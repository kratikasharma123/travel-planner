export const currencyFormat = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));

export function getExpenseTotals(expenses = []) {
  return expenses.reduce(
    (totals, expense) => {
      const amount = Number(expense.amount || 0);
      totals.total += amount;
      if (expense.status === 'actual') totals.actual += amount;
      else totals.estimated += amount;
      totals.byCategory[expense.category] = (totals.byCategory[expense.category] || 0) + amount;
      totals.byVendor[expense.vendor || 'Unknown'] = (totals.byVendor[expense.vendor || 'Unknown'] || 0) + amount;
      totals.byCostType[expense.costType] = (totals.byCostType[expense.costType] || 0) + amount;
      const month = (expense.expenseDate || '').slice(0, 7) || 'Unscheduled';
      totals.byMonth[month] = (totals.byMonth[month] || 0) + amount;
      return totals;
    },
    { total: 0, estimated: 0, actual: 0, byCategory: {}, byVendor: {}, byCostType: {}, byMonth: {} }
  );
}

export function getBudgetSummary(budget, expenses = []) {
  const totalBudget = Number(budget?.totalBudget || budget?.totalEstimate || 0);
  const totals = getExpenseTotals(expenses);
  const totalEstimatedCost = totals.estimated;
  const totalActualCost = totals.actual;
  const totalCost = totalEstimatedCost + totalActualCost;
  const remainingBudget = totalBudget - totalCost;
  const utilization = totalBudget > 0 ? Math.min((totalCost / totalBudget) * 100, 999) : 0;
  const savingsAmount = Math.max(remainingBudget, 0);

  return {
    totalBudget,
    totalEstimatedCost,
    totalActualCost,
    totalCost,
    remainingBudget,
    utilization,
    savingsAmount,
    totals,
    status: utilization >= 100 ? 'over' : utilization >= 80 ? 'near' : 'under',
  };
}

export function getBudgetTone(utilization = 0) {
  if (utilization >= 100) {
    return {
      key: 'over',
      label: 'Over Budget',
      textClass: 'text-rose-700',
      bgClass: 'bg-rose-500',
      softClass: 'bg-rose-50 text-rose-700 border-rose-100',
    };
  }

  if (utilization >= 80) {
    return {
      key: 'near',
      label: 'Near Budget',
      textClass: 'text-amber-700',
      bgClass: 'bg-amber-400',
      softClass: 'bg-amber-50 text-amber-700 border-amber-100',
    };
  }

  return {
    key: 'under',
    label: 'Under Budget',
    textClass: 'text-emerald-700',
    bgClass: 'bg-emerald-500',
    softClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
}

export function objectToChartRows(record = {}, nameKey = 'name', valueKey = 'value') {
  return Object.entries(record).map(([name, value]) => ({ [nameKey]: name, [valueKey]: Number(value || 0) }));
}

export function getMonthlySpendingRows(expenses = []) {
  const byMonth = expenses.reduce((months, expense) => {
    const month = (expense.expenseDate || '').slice(0, 7) || 'Unscheduled';
    const amount = Number(expense.amount || 0);
    months[month] = months[month] || { month, estimated: 0, actual: 0, total: 0 };
    months[month][expense.status === 'actual' ? 'actual' : 'estimated'] += amount;
    months[month].total += amount;
    return months;
  }, {});

  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
}

export function getSavingsProgress(budget, summary) {
  const target = Number(budget?.savingsTarget || 0);
  const saved = Math.max(summary?.savingsAmount || 0, 0);
  const percentage = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  return { target, saved, remaining: Math.max(target - saved, 0), percentage };
}

export function getSavingsTrendRows(budget, expenses = []) {
  const totalBudget = Number(budget?.totalBudget || budget?.totalEstimate || 0);
  let runningCost = 0;

  return getMonthlySpendingRows(expenses).map((row) => {
    runningCost += row.total;
    return {
      month: row.month,
      savings: Math.max(totalBudget - runningCost, 0),
      spent: runningCost,
    };
  });
}

export function getCostBreakdown(expenses = []) {
  const totals = getExpenseTotals(expenses);
  const total = totals.total || 1;
  return ['fixed', 'variable', 'one-time', 'recurring'].map((type) => ({
    type,
    amount: totals.byCostType[type] || 0,
    percentage: ((totals.byCostType[type] || 0) / total) * 100,
  }));
}

function addFrequency(date, frequency) {
  const next = new Date(date);
  if (frequency === 'daily') next.setDate(next.getDate() + 1);
  if (frequency === 'weekly') next.setDate(next.getDate() + 7);
  if (frequency === 'monthly') next.setMonth(next.getMonth() + 1);
  if (frequency === 'quarterly') next.setMonth(next.getMonth() + 3);
  if (frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
  return next;
}

export function getUpcomingRecurringExpenses(expenses = [], rangeEndDate) {
  const today = new Date();
  const endDate = rangeEndDate ? new Date(rangeEndDate) : new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
  const upcoming = [];

  expenses
    .filter((expense) => expense.costType === 'recurring' && expense.recurrenceFrequency)
    .forEach((expense) => {
      let occurrenceDate = new Date(expense.expenseDate || today);
      const recurrenceEnd = expense.recurrenceEndDate ? new Date(expense.recurrenceEndDate) : endDate;
      const finalDate = recurrenceEnd < endDate ? recurrenceEnd : endDate;

      while (occurrenceDate <= today) {
        occurrenceDate = addFrequency(occurrenceDate, expense.recurrenceFrequency);
      }

      while (occurrenceDate <= finalDate && upcoming.length < 100) {
        upcoming.push({ ...expense, occurrenceDate: occurrenceDate.toISOString().slice(0, 10) });
        occurrenceDate = addFrequency(occurrenceDate, expense.recurrenceFrequency);
      }
    });

  return upcoming.sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate));
}

export function estimateSavingsCompletionDate(budget, expenses = []) {
  const summary = getBudgetSummary(budget, expenses);
  const progress = getSavingsProgress(budget, summary);
  if (!progress.target || progress.remaining <= 0) return 'Goal reached';

  const rows = getMonthlySpendingRows(expenses);
  const averageMonthlySavings = rows.length > 0 ? Math.max((summary.totalBudget - summary.totalCost) / Math.max(rows.length, 1), 0) : 0;
  if (!averageMonthlySavings) return 'Needs more savings data';

  const monthsNeeded = Math.ceil(progress.remaining / averageMonthlySavings);
  const date = new Date();
  date.setMonth(date.getMonth() + monthsNeeded);
  return date.toLocaleDateString();
}
