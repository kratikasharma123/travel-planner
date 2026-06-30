import { useEffect, useMemo, useState } from 'react';
import AlertBanner from '../features/budget/components/AlertBanner.jsx';
import AnalyticsSection from '../features/budget/components/AnalyticsSection.jsx';
import { budgetToForm, emptyExpenseForm, expenseToForm } from '../features/budget/budgetFormUtils.js';
import BudgetForm from '../features/budget/components/BudgetForm.jsx';
import BudgetProgressBar from '../features/budget/components/BudgetProgressBar.jsx';
import CostBreakdown from '../features/budget/components/CostBreakdown.jsx';
import ExpenseForm from '../features/budget/components/ExpenseForm.jsx';
import ExpenseTable from '../features/budget/components/ExpenseTable.jsx';
import FilterPanel from '../features/budget/components/FilterPanel.jsx';
import RecommendationsSection from '../features/budget/components/RecommendationsSection.jsx';
import ReportsPanel from '../features/budget/components/ReportsPanel.jsx';
import SavingsGoalCard from '../features/budget/components/SavingsGoalCard.jsx';
import StatCard from '../features/budget/components/StatCard.jsx';
import ToastStack from '../features/budget/components/ToastStack.jsx';
import { useBudget } from '../hooks/useBudget.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useTrips } from '../hooks/useTrips.js';
import {
  currencyFormat,
  getBudgetSummary,
  getCostBreakdown,
  getMonthlySpendingRows,
  getSavingsProgress,
  getSavingsTrendRows,
  getUpcomingRecurringExpenses,
} from '../utils/budgetCalculations.js';
import { getBudgetAlerts, getBudgetRecommendations } from '../utils/budgetRecommendations.js';
import { exportBudgetReport } from '../utils/exportUtils.js';

const initialFilters = {
  search: '',
  category: '',
  vendor: '',
  status: '',
  budgetId: '',
  startDate: '',
  endDate: '',
  month: '',
  year: '',
  page: 1,
  limit: 10,
};

function getErrorMessage(apiError, fallback) {
  return apiError?.response?.data?.message || apiError?.message || fallback;
}

function validateBudgetForm(formData) {
  if (!formData.name.trim()) return 'Budget name is required.';
  if (!formData.tripId) return 'Please select a trip for this budget.';
  if (!Number(formData.totalBudget)) return 'Total budget must be greater than zero.';
  if (!formData.currency || formData.currency.length !== 3) return 'Currency must be a 3-letter code.';
  if (!formData.startDate || !formData.endDate) return 'Start and end dates are required.';
  if (formData.endDate < formData.startDate) return 'End date must be after start date.';
  if (!formData.category) return 'Category is required.';
  return '';
}

function validateExpenseForm(formData) {
  if (!formData.title.trim()) return 'Expense title is required.';
  if (!formData.category) return 'Expense category is required.';
  if (!Number(formData.amount)) return 'Expense amount must be greater than zero.';
  if (!formData.expenseDate) return 'Expense date is required.';
  if (!formData.status) return 'Expense status is required.';
  if (formData.costType === 'recurring' && !formData.recurrenceFrequency) return 'Recurring expenses need a recurrence frequency.';
  return '';
}

function BudgetPage() {
  const { trips, isLoading: tripsLoading } = useTrips();
  const {
    budgets,
    selectedBudget,
    expenses,
    pagination,
    isLoading,
    isSubmitting,
    error,
    refreshBudgets,
    selectBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    refreshExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useBudget();
  const [budgetForm, setBudgetForm] = useState(budgetToForm(null));
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [toasts, setToasts] = useState([]);
  const [reportType, setReportType] = useState('budget');
  const debouncedSearch = useDebouncedValue(filters.search, 350);

  const activeFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch, budgetId: filters.budgetId || selectedBudget?._id || '' }),
    [debouncedSearch, filters, selectedBudget]
  );

  useEffect(() => {
    refreshExpenses(activeFilters);
  }, [activeFilters, refreshExpenses]);

  const summary = useMemo(() => getBudgetSummary(selectedBudget, expenses), [selectedBudget, expenses]);
  const recommendations = useMemo(() => getBudgetRecommendations(selectedBudget, expenses), [selectedBudget, expenses]);
  const alerts = useMemo(() => getBudgetAlerts(selectedBudget, expenses), [selectedBudget, expenses]);
  const costBreakdown = useMemo(() => getCostBreakdown(expenses), [expenses]);
  const savingsProgress = useMemo(() => getSavingsProgress(selectedBudget, summary), [selectedBudget, summary]);
  const monthlyRows = useMemo(() => getMonthlySpendingRows(expenses), [expenses]);
  const savingsRows = useMemo(() => getSavingsTrendRows(selectedBudget, expenses), [selectedBudget, expenses]);
  const upcomingRecurring = useMemo(() => getUpcomingRecurringExpenses(expenses, selectedBudget?.endDate), [expenses, selectedBudget]);
  const currency = selectedBudget?.currency || budgetForm.currency || 'USD';

  function addToast(message, tone = 'success') {
    setToasts((current) => [...current, { id: `${message}-${Date.now()}`, message, tone }].slice(-4));
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function handleBudgetChange(event) {
    const { name, value } = event.target;
    setBudgetForm((current) => ({ ...current, [name]: name === 'currency' ? value.toUpperCase() : value }));
  }

  function handleExpenseChange(event) {
    const { name, value } = event.target;
    setExpenseForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'costType' && value !== 'recurring' ? { recurrenceFrequency: '', recurrenceEndDate: '' } : {}),
    }));
  }

  function handleBudgetSelect(event) {
    const budgetId = event.target.value;
    selectBudget(budgetId);
    const budget = budgets.find((item) => item._id === budgetId) || null;
    setBudgetForm(budgetToForm(budget));
    setFilters((current) => ({ ...current, budgetId, page: 1 }));
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
    if (name === 'budgetId') {
      selectBudget(value);
      const budget = budgets.find((item) => item._id === value) || null;
      setBudgetForm(budgetToForm(budget));
    }
  }

  function handlePageSizeChange(event) {
    setFilters((current) => ({ ...current, limit: Number(event.target.value), page: 1 }));
  }

  function resetFilters() {
    setFilters({ ...initialFilters, budgetId: selectedBudget?._id || '' });
  }

  async function handleBudgetSubmit(event) {
    event.preventDefault();
    setFormError('');
    setSuccess('');

    const validationError = validateBudgetForm(budgetForm);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      ...budgetForm,
      totalBudget: Number(budgetForm.totalBudget),
      savingsTarget: Number(budgetForm.savingsTarget || 0),
      totalEstimate: Number(budgetForm.totalBudget),
    };

    try {
      if (selectedBudget) {
        await updateBudget(selectedBudget._id, payload);
        setSuccess('Budget updated successfully.');
        addToast('Budget updated successfully.');
      } else {
        await createBudget(payload);
        setSuccess('Budget created successfully.');
        addToast('Budget created successfully.');
      }
      await refreshBudgets();
    } catch (apiError) {
      setFormError(getErrorMessage(apiError, 'Unable to save budget.'));
    }
  }

  async function handleDeleteBudget() {
    if (!selectedBudget) return;
    setFormError('');
    setSuccess('');

    try {
      await deleteBudget(selectedBudget._id);
      setBudgetForm(budgetToForm(null));
      setSuccess('Budget deleted successfully.');
      addToast('Budget deleted successfully.');
      await refreshBudgets();
    } catch (apiError) {
      setFormError(getErrorMessage(apiError, 'Unable to delete budget.'));
    }
  }

  async function handleExpenseSubmit(event) {
    event.preventDefault();
    setFormError('');
    setSuccess('');

    if (!selectedBudget) {
      setFormError('Create or select a budget before adding expenses.');
      return;
    }

    const validationError = validateExpenseForm(expenseForm);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      ...expenseForm,
      amount: Number(expenseForm.amount),
      budgetId: selectedBudget._id,
      tripId: selectedBudget.tripId || selectedBudget.trip,
    };

    try {
      if (editingExpense) {
        await updateExpense(editingExpense._id, payload);
        setSuccess('Expense updated successfully.');
        addToast('Expense updated successfully.');
      } else {
        const created = await createExpense(payload);
        setSuccess('Expense added successfully.');
        addToast(Number(created.amount) >= summary.totalBudget * 0.25 && summary.totalBudget > 0 ? 'Large expense added.' : 'Expense added successfully.', 'success');
      }
      setEditingExpense(null);
      setExpenseForm(emptyExpenseForm);
      await refreshExpenses(activeFilters);
    } catch (apiError) {
      setFormError(getErrorMessage(apiError, 'Unable to save expense.'));
    }
  }

  async function handleDeleteExpense(expenseId) {
    setFormError('');
    setSuccess('');

    try {
      await deleteExpense(expenseId);
      setSuccess('Expense deleted successfully.');
      addToast('Expense deleted successfully.');
      await refreshExpenses(activeFilters);
    } catch (apiError) {
      setFormError(getErrorMessage(apiError, 'Unable to delete expense.'));
    }
  }

  function handleEditExpense(expense) {
    setEditingExpense(expense);
    setExpenseForm(expenseToForm(expense));
  }

  function handleCancelBudgetEdit() {
    selectBudget('');
    setBudgetForm(budgetToForm(null));
  }

  function handleCancelExpenseEdit() {
    setEditingExpense(null);
    setExpenseForm(emptyExpenseForm);
  }

  function handlePageChange(page) {
    setFilters((current) => ({ ...current, page }));
  }

  function handleExport(format) {
    if (!selectedBudget) return;
    exportBudgetReport(reportType, format, selectedBudget, summary, expenses);
  }

  return (
    <section className="page-stack">
      <div className="app-card">
        <p className="section-eyebrow">Budget planner & cost optimization</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Budget Planner</h1>
            <p className="section-description">Plan trip budgets, track estimated and actual expenses, optimize costs, analyze trends, and export reports.</p>
          </div>
          <select value={selectedBudget?._id || ''} onChange={handleBudgetSelect} className="form-control">
            <option value="">New budget</option>
            {budgets.map((budget) => <option key={budget._id} value={budget._id}>{budget.name}</option>)}
          </select>
        </div>
        {error && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
        {formError && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{formError}</p>}
        {success && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Budget" value={currencyFormat(summary.totalBudget, currency)} icon="💼" tone="blue" />
        <StatCard label="Estimated Cost" value={currencyFormat(summary.totalEstimatedCost, currency)} icon="🧾" />
        <StatCard label="Actual Cost" value={currencyFormat(summary.totalActualCost, currency)} icon="✅" tone="green" />
        <StatCard label="Remaining" value={currencyFormat(summary.remainingBudget, currency)} icon="💵" tone={summary.remainingBudget < 0 ? 'red' : 'green'} />
        <StatCard label="Utilization" value={`${summary.utilization.toFixed(1)}%`} icon="📍" tone={summary.status === 'over' ? 'red' : summary.status === 'near' ? 'yellow' : 'green'} />
        <StatCard label="Savings" value={currencyFormat(summary.savingsAmount, currency)} icon="🏦" tone="green" />
      </div>

      <BudgetProgressBar utilization={summary.utilization} />

      <div className="grid gap-6 lg:gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="app-card">
          <p className="section-eyebrow">Budget setup</p>
          <h2 className="section-title">Create or edit budget</h2>
          {!tripsLoading && trips.length === 0 && <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">Create a trip first from My Trips before creating a budget.</p>}
          <div className="mt-6">
            <BudgetForm formData={budgetForm} trips={trips} selectedBudget={selectedBudget} onChange={handleBudgetChange} onSubmit={handleBudgetSubmit} onCancel={handleCancelBudgetEdit} onDelete={handleDeleteBudget} isSubmitting={isSubmitting} />
          </div>
        </section>

        <section className="app-card">
          <p className="section-eyebrow">Expense management</p>
          <h2 className="section-title">Add estimated or actual costs</h2>
          <div className="mt-6">
            <ExpenseForm formData={expenseForm} selectedBudget={selectedBudget} editingExpense={editingExpense} onChange={handleExpenseChange} onSubmit={handleExpenseSubmit} onCancel={handleCancelExpenseEdit} isSubmitting={isSubmitting} />
          </div>
        </section>
      </div>

      <RecommendationsSection recommendations={recommendations} />

      <section className="grid gap-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Expenses</h2>
          <p className="mt-2 text-sm text-slate-600">Search, filter, paginate, edit, and delete budget expenses.</p>
        </div>
        <FilterPanel filters={filters} budgets={budgets} onChange={handleFilterChange} onReset={resetFilters} onPageSizeChange={handlePageSizeChange} />
        <ExpenseTable expenses={expenses} currency={currency} pagination={pagination} onEdit={handleEditExpense} onDelete={handleDeleteExpense} onPageChange={handlePageChange} isLoading={isLoading} />
      </section>

      <CostBreakdown rows={costBreakdown} currency={currency} />
      <SavingsGoalCard budget={selectedBudget} progress={savingsProgress} expenses={expenses} />

      <section className="app-card">
        <p className="section-eyebrow">Recurring expenses</p>
        <h2 className="section-title">Upcoming recurring costs</h2>
        {upcomingRecurring.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-slate-600">No upcoming recurring expenses calculated.</p>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {upcomingRecurring.slice(0, 6).map((expense) => (
              <article key={`${expense._id}-${expense.occurrenceDate}`} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-bold text-slate-950">{expense.title}</p>
                <p className="mt-1 text-sm text-slate-600">{expense.occurrenceDate} • {expense.recurrenceFrequency}</p>
                <p className="mt-2 font-semibold text-slate-950">{currencyFormat(expense.amount, currency)}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <AnalyticsSection summary={summary} expenses={expenses} monthlyRows={monthlyRows} savingsRows={savingsRows} />
      <ReportsPanel reportType={reportType} onReportTypeChange={(event) => setReportType(event.target.value)} onExport={handleExport} disabled={!selectedBudget} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </section>
  );
}

export default BudgetPage;
