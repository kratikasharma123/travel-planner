import { currencyFormat, getBudgetSummary, getMonthlySpendingRows } from './budgetCalculations.js';

function topEntries(record = {}, limit = 3) {
  return Object.entries(record)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, limit);
}

export function getBudgetRecommendations(budget, expenses = []) {
  const summary = getBudgetSummary(budget, expenses);
  const recommendations = [];
  const topCategory = topEntries(summary.totals.byCategory, 1)[0];
  const topVendor = topEntries(summary.totals.byVendor, 1)[0];
  const monthlyRows = getMonthlySpendingRows(expenses);
  const currency = budget?.currency || 'USD';

  if (summary.utilization >= 100) {
    recommendations.push({ icon: '🚨', priority: 'High', title: 'Budget exceeded', description: 'Your total costs are higher than your budget. Pause non-essential spending and review actual expenses.' });
  } else if (summary.utilization >= 90) {
    recommendations.push({ icon: '⚠️', priority: 'High', title: 'Budget almost exhausted', description: 'You have crossed 90% utilization. Keep remaining expenses limited to essentials.' });
  } else if (summary.utilization >= 80) {
    recommendations.push({ icon: '🟡', priority: 'Medium', title: 'Near budget limit', description: 'You have crossed 80% utilization. Review upcoming recurring and variable expenses.' });
  }

  if (topCategory) {
    const potentialSavings = Number(topCategory[1]) * 0.12;
    recommendations.push({ icon: '📊', priority: 'Medium', title: `Highest category: ${topCategory[0]}`, description: `This category leads spending at ${currencyFormat(topCategory[1], currency)}. A 12% reduction could save about ${currencyFormat(potentialSavings, currency)}.` });
  }

  const variableTotal = summary.totals.byCostType.variable || 0;
  if (variableTotal > summary.totalCost * 0.35 && variableTotal > 0) {
    recommendations.push({ icon: '✂️', priority: 'Medium', title: 'Reduce variable costs', description: `Variable costs are ${currencyFormat(variableTotal, currency)}. Compare transport, meals, and activity options before booking.` });
  }

  if (topVendor && topVendor[0] !== 'Unknown') {
    recommendations.push({ icon: '🏪', priority: 'Low', title: `Expensive vendor: ${topVendor[0]}`, description: `${topVendor[0]} accounts for ${currencyFormat(topVendor[1], currency)}. Compare alternatives or negotiate discounts.` });
  }

  const duplicates = expenses.filter((expense, index) =>
    expenses.findIndex((item) => item.title.toLowerCase() === expense.title.toLowerCase() && Number(item.amount) === Number(expense.amount) && item.vendor === expense.vendor) !== index
  );

  if (duplicates.length > 0) {
    recommendations.push({ icon: '♻️', priority: 'Medium', title: 'Possible duplicate expenses', description: `${duplicates.length} expenses look duplicated. Review and remove accidental entries.` });
  }

  const recurringTotal = expenses.filter((expense) => expense.costType === 'recurring').reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  if (recurringTotal > summary.totalBudget * 0.35 && summary.totalBudget > 0) {
    recommendations.push({ icon: '🔁', priority: 'Medium', title: 'High recurring costs', description: 'Recurring expenses are a large part of your budget. Cancel unused subscriptions or reduce fixed commitments.' });
  }

  if (summary.savingsAmount > 0) {
    recommendations.push({ icon: '💰', priority: 'Low', title: 'Remaining budget available', description: `You still have ${currencyFormat(summary.savingsAmount, currency)} available. Reserve part of it for your savings goal or emergency buffer.` });
  }

  if (monthlyRows.length >= 2) {
    const previous = monthlyRows[monthlyRows.length - 2];
    const current = monthlyRows[monthlyRows.length - 1];
    if (current.total > previous.total) {
      recommendations.push({ icon: '📈', priority: 'Medium', title: 'Monthly spending is rising', description: `${current.month} spending is higher than ${previous.month}. Review recent purchases before the trend continues.` });
    }
  }

  return recommendations.slice(0, 8);
}

export function getBudgetAlerts(budget, expenses = []) {
  const summary = getBudgetSummary(budget, expenses);
  const alerts = [];
  const largeExpense = expenses.find((expense) => Number(expense.amount || 0) >= summary.totalBudget * 0.25 && summary.totalBudget > 0);

  if (summary.utilization >= 100) alerts.push({ tone: 'danger', message: 'Budget exceeded. Review expenses immediately.' });
  else if (summary.utilization >= 90) alerts.push({ tone: 'danger', message: 'Budget reached 90%. Spending control recommended.' });
  else if (summary.utilization >= 80) alerts.push({ tone: 'warning', message: 'Budget reached 80%. You are near the limit.' });

  if (largeExpense) alerts.push({ tone: 'warning', message: `Large expense added: ${largeExpense.title}.` });

  if (budget?.endDate) {
    const daysLeft = Math.ceil((new Date(budget.endDate).getTime() - Date.now()) / 86400000);
    if (daysLeft >= 0 && daysLeft <= 7) alerts.push({ tone: 'warning', message: 'Budget period is ending soon.' });
  }

  return alerts;
}
