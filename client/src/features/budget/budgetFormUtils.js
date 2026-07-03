export const emptyBudgetForm = {
  name: '',
  totalBudget: '',
  currency: 'USD',
  startDate: '',
  endDate: '',
  description: '',
  category: 'general',
  savingsTarget: '',
  tripId: '',
};

export function budgetToForm(budget) {
  if (!budget) return emptyBudgetForm;

  return {
    name: budget.name || '',
    totalBudget: budget.totalBudget || '',
    currency: budget.currency || 'USD',
    startDate: budget.startDate || '',
    endDate: budget.endDate || '',
    description: budget.description || '',
    category: budget.category || 'general',
    savingsTarget: budget.savingsTarget || '',
    tripId: budget.tripId || budget.trip || '',
  };
}

export const emptyExpenseForm = {
  title: '',
  category: 'miscellaneous',
  amount: '',
  expenseDate: new Date().toISOString().slice(0, 10),
  vendor: '',
  notes: '',
  status: 'estimated',
  costType: 'variable',
  recurrenceFrequency: '',
  recurrenceEndDate: '',
};

export function expenseToForm(expense) {
  if (!expense) return emptyExpenseForm;

  return {
    title: expense.title || '',
    category: expense.category || 'miscellaneous',
    amount: expense.amount || '',
    expenseDate: expense.expenseDate || '',
    vendor: expense.vendor || '',
    notes: expense.notes || '',
    status: expense.status || 'estimated',
    costType: expense.costType || 'variable',
    recurrenceFrequency: expense.recurrenceFrequency || '',
    recurrenceEndDate: expense.recurrenceEndDate || '',
  };
}
