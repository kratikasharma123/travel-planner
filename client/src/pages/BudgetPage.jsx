import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Car,
  ChartPie,
  CheckCircle2,
  Coins,
  Hotel,
  MapPin,
  PiggyBank,
  Plane,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  Trash2,
  Utensils,
  Wallet,
  WandSparkles,
  Users,
} from 'lucide-react';
import AlertBanner from '../features/budget/components/AlertBanner.jsx';
import { budgetToForm, emptyExpenseForm } from '../features/budget/budgetFormUtils.js';
import BudgetForm from '../features/budget/components/BudgetForm.jsx';
import ExpenseForm from '../features/budget/components/ExpenseForm.jsx';
import RecommendationsSection from '../features/budget/components/RecommendationsSection.jsx';
import ReportsPanel from '../features/budget/components/ReportsPanel.jsx';
import SavingsGoalCard from '../features/budget/components/SavingsGoalCard.jsx';
import ToastStack from '../features/budget/components/ToastStack.jsx';
import { useBudget } from '../hooks/useBudget.js';
import { useTrips } from '../hooks/useTrips.js';
import {
  currencyFormat,
  getBudgetSummary,
  getCostBreakdown,
  getSavingsProgress,
} from '../utils/budgetCalculations.js';
import { getBudgetAlerts, getBudgetRecommendations } from '../utils/budgetRecommendations.js';
import { exportBudgetReport } from '../utils/exportUtils.js';

const quickBreakdown = [
  { label: 'Hotel', icon: Hotel, color: 'bg-orange-500' },
  { label: 'Food', icon: Utensils, color: 'bg-emerald-500' },
  { label: 'Transport', icon: Car, color: 'bg-teal-500' },
  { label: 'Activities', icon: Plane, color: 'bg-amber-500' },
  { label: 'Shopping', icon: ShoppingBag, color: 'bg-lime-500' },
  { label: 'Misc', icon: ReceiptText, color: 'bg-slate-500' },
];

const aiTips = [
  { title: 'Reduce hotel cost', description: 'Compare flexible stays outside tourist-heavy zones and prioritize free breakfast.', icon: Hotel },
  { title: 'Save on food', description: 'Mix local markets and one signature dinner instead of premium meals daily.', icon: Utensils },
  { title: 'Use local transport', description: 'Choose passes, walkable clusters, and shared rides before private transfers.', icon: Car },
  { title: 'Avoid peak season', description: 'Shift dates by one week to unlock better stays and lighter crowds.', icon: CalendarDays },
  { title: 'Find free attractions', description: 'Add parks, viewpoints, galleries, beaches, and cultural walks.', icon: Sparkles },
];

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

function getDateDiff(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function BudgetPage() {
  const budgetInputRef = useRef(null);
  const { trips, isLoading: tripsLoading } = useTrips();
  const {
    budgets,
    selectedBudget,
    expenses,
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
  } = useBudget();
  const [budgetForm, setBudgetForm] = useState(budgetToForm(null));
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [toasts, setToasts] = useState([]);
  const [reportType, setReportType] = useState('budget');

  const activeFilters = useMemo(() => ({ budgetId: selectedBudget?._id || '' }), [selectedBudget]);

  useEffect(() => {
    refreshExpenses(activeFilters);
  }, [activeFilters, refreshExpenses]);

  const summary = useMemo(() => getBudgetSummary(selectedBudget, expenses), [selectedBudget, expenses]);
  const recommendations = useMemo(() => getBudgetRecommendations(selectedBudget, expenses), [selectedBudget, expenses]);
  const alerts = useMemo(() => getBudgetAlerts(selectedBudget, expenses), [selectedBudget, expenses]);
  const costBreakdown = useMemo(() => getCostBreakdown(expenses), [expenses]);
  const savingsProgress = useMemo(() => getSavingsProgress(selectedBudget, summary), [selectedBudget, summary]);
  const currency = selectedBudget?.currency || budgetForm.currency || 'USD';
  const selectedTrip = trips.find((trip) => trip._id === (selectedBudget?.tripId || selectedBudget?.trip || budgetForm.tripId));
  const travelers = Number(selectedTrip?.travelerCount || 1);
  const days = selectedTrip?.durationDays || getDateDiff(selectedBudget?.startDate || budgetForm.startDate, selectedBudget?.endDate || budgetForm.endDate);
  const costPerPerson = summary.totalEstimatedCost ? summary.totalEstimatedCost / travelers : summary.totalBudget / travelers;
  const dailyAverage = summary.totalEstimatedCost ? summary.totalEstimatedCost / days : summary.totalBudget / days;

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
  }

  function scrollToBudgetInput() {
    selectBudget('');
    setBudgetForm(budgetToForm(null));
    budgetInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  function handleCancelBudgetEdit() {
    selectBudget('');
    setBudgetForm(budgetToForm(null));
  }

  function handleCancelExpenseEdit() {
    setEditingExpense(null);
    setExpenseForm(emptyExpenseForm);
  }

  function handleExport(format) {
    if (!selectedBudget) return;
    exportBudgetReport(reportType, format, selectedBudget, summary, expenses);
  }

  return (
    <section className="relative grid gap-6 overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-96 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />

      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 p-6 shadow-2xl shadow-orange-100 sm:p-8 lg:p-10">
        <img
          src="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=1800&q=90"
          alt="Airplane and hot air balloon travel budgeting background"
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-orange-950/45 to-orange-400/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(251,146,60,0.35),transparent_30%),radial-gradient(circle_at_86%_76%,rgba(16,185,129,0.24),transparent_28%)]" />
       
        <div className="relative max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-100 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            AI budget planner
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">Plan your trip budget smartly</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/85 sm:text-lg">Estimate, optimize, and track your travel expenses with AI.</p>
          <button type="button" onClick={scrollToBudgetInput} className="mt-7 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-600">
            <WandSparkles className="h-4 w-4" />
            Create Budget Plan
          </button>
        </div>
      </section>

      {(error || formError || success) && (
        <div className="grid gap-3">
          {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}
          {formError && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{formError}</p>}
          {success && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{success}</p>}
        </div>
      )}

      <AlertBanner alerts={alerts} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total estimated budget', value: currencyFormat(summary.totalBudget, currency), icon: Wallet, tone: 'bg-orange-50 text-orange-600' },
          { label: 'Cost per person', value: currencyFormat(costPerPerson || 0, currency), icon: Users, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Daily average cost', value: currencyFormat(dailyAverage || 0, currency), icon: CalendarDays, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Remaining budget', value: currencyFormat(summary.remainingBudget, currency), icon: PiggyBank, tone: summary.remainingBudget < 0 ? 'bg-rose-50 text-rose-700' : 'bg-teal-50 text-teal-700' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40 transition hover:-translate-y-1 hover:shadow-xl">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${item.tone}`}><Icon className="h-6 w-6" /></span>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{item.value}</p>
            </article>
          );
        })}
      </section>

      <div ref={budgetInputRef} className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Budget input</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Create or edit budget</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Set destination, dates, travelers, and your total travel wallet.</p>
            </div>
            <select value={selectedBudget?._id || ''} onChange={handleBudgetSelect} className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-100">
              <option value="">New budget</option>
              {budgets.map((budget) => <option key={budget._id} value={budget._id}>{budget.name}</option>)}
            </select>
          </div>
          {!tripsLoading && trips.length === 0 && <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-700">Create a trip first from My Trips before creating a budget.</p>}
          <div className="mt-6"><BudgetForm formData={budgetForm} trips={trips} selectedBudget={selectedBudget} onChange={handleBudgetChange} onSubmit={handleBudgetSubmit} onCancel={handleCancelBudgetEdit} onDelete={handleDeleteBudget} isSubmitting={isSubmitting} /></div>
        </section>

        <section className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-5 shadow-xl shadow-orange-100/40 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Expense breakdown</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Category spending</h2>
          <div className="mt-6 grid gap-4">
            {quickBreakdown.map((item, index) => {
              const Icon = item.icon;
              const row = costBreakdown.find((entry) => entry.category?.toLowerCase().includes(item.label.toLowerCase())) || costBreakdown[index];
              const value = Number(row?.amount || row?.value || 0);
              const percent = summary.totalActualCost ? Math.min(100, Math.round((value / summary.totalActualCost) * 100)) : Math.max(8, 68 - index * 9);
              return (
                <div key={item.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-50">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-3 text-sm font-black text-slate-700"><Icon className="h-5 w-5 text-orange-500" />{item.label}</span>
                    <span className="text-sm font-black text-slate-950">{currencyFormat(value, currency)}</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-orange-50"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} /></div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">AI budget tips</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Save more without losing the fun</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {aiTips.map((tip) => {
            const Icon = tip.icon;
            return (
              <article key={tip.title} className="rounded-[1.5rem] bg-orange-50/70 p-4 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-orange-100">
                <Icon className="h-6 w-6 text-orange-500" />
                <h3 className="mt-4 font-black text-slate-950">{tip.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tip.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Saved budgets</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Budget plans</h2>
          </div>
          <button type="button" onClick={scrollToBudgetInput} className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600">Create your first budget</button>
        </div>
        {budgets.length === 0 ? (
          <div className="mt-6 rounded-[1.75rem] border border-dashed border-orange-200 bg-orange-50 p-8 text-center">
            <Wallet className="mx-auto h-12 w-12 text-orange-500" />
            <h3 className="mt-4 text-xl font-black text-slate-950">No budget plans yet</h3>
            <button type="button" onClick={scrollToBudgetInput} className="mt-4 rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white">Create your first budget</button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {budgets.map((budget) => (
              <article key={budget._id} className="rounded-[1.5rem] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">{budget.currency || currency}</p>
                <h3 className="mt-2 text-xl font-black text-slate-950">{budget.name}</h3>
                <p className="mt-2 text-3xl font-black text-orange-500">{currencyFormat(budget.totalBudget || budget.totalEstimate || 0, budget.currency || currency)}</p>
                <p className="mt-2 text-sm font-semibold text-slate-500">Created {budget.createdAt ? new Date(budget.createdAt).toLocaleDateString() : 'recently'}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to={`/budget/${budget._id}`} state={{ budget }} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white transition hover:bg-orange-600">View</Link>
                  <button type="button" onClick={() => { selectBudget(budget._id); setBudgetForm(budgetToForm(budget)); budgetInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="rounded-full border border-orange-100 px-4 py-2 text-sm font-black text-orange-600 hover:bg-orange-50">Edit</button>
                  <button type="button" onClick={() => deleteBudget(budget._id)} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-black text-rose-700 hover:bg-rose-50"><Trash2 className="inline h-4 w-4" /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Expense management</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Add estimated or actual costs</h2>
        <div className="mt-6"><ExpenseForm formData={expenseForm} selectedBudget={selectedBudget} editingExpense={editingExpense} onChange={handleExpenseChange} onSubmit={handleExpenseSubmit} onCancel={handleCancelExpenseEdit} isSubmitting={isSubmitting} /></div>
      </section>

      <RecommendationsSection recommendations={recommendations} />
      <SavingsGoalCard budget={selectedBudget} progress={savingsProgress} expenses={expenses} />

      <ReportsPanel reportType={reportType} onReportTypeChange={(event) => setReportType(event.target.value)} onExport={handleExport} disabled={!selectedBudget} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </section>
  );
}

export default BudgetPage;
