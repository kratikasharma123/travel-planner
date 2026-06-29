import { useState } from 'react';
import { useBudget } from '../hooks/useBudget.js';
import { useTrips } from '../hooks/useTrips.js';

const categoryFields = [
  ['accommodation', 'Accommodation'],
  ['food', 'Food'],
  ['transport', 'Transport'],
  ['activities', 'Activities'],
  ['miscellaneous', 'Miscellaneous'],
  ['emergencyBuffer', 'Emergency Buffer'],
];

const emptyBudget = {
  currency: 'USD',
  confidenceLevel: 'low',
  notes: '',
  categories: {
    accommodation: 0,
    food: 0,
    transport: 0,
    activities: 0,
    miscellaneous: 0,
    emergencyBuffer: 0,
  },
};

function budgetToForm(budget) {
  if (!budget) return emptyBudget;

  return {
    currency: budget.currency || 'USD',
    confidenceLevel: budget.confidenceLevel || 'low',
    notes: budget.notes || '',
    categories: { ...emptyBudget.categories, ...budget.categories },
  };
}

function getErrorMessage(apiError, fallback) {
  return apiError?.response?.data?.message || apiError?.message || fallback;
}

function BudgetPage() {
  const { trips, isLoading: tripsLoading } = useTrips();
  const { budget, isLoading, error, loadBudget, saveBudget, deleteBudget } = useBudget();
  const [selectedTripId, setSelectedTripId] = useState('');
  const [formData, setFormData] = useState(emptyBudget);
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');

  async function handleTripSelect(event) {
    const tripId = event.target.value;
    setSelectedTripId(tripId);
    setSuccess('');
    setFormError('');

    if (!tripId) {
      setFormData(emptyBudget);
      return;
    }

    const loadedBudget = await loadBudget(tripId);
    setFormData(budgetToForm(loadedBudget));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleCategoryChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      categories: { ...current.categories, [name]: Number(value) },
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSuccess('');
    setFormError('');

    if (!selectedTripId) return;

    try {
      const savedBudget = await saveBudget(selectedTripId, formData);
      setFormData(budgetToForm(savedBudget));
      setSuccess('Budget saved successfully.');
    } catch (apiError) {
      setFormError(getErrorMessage(apiError, 'Unable to save budget.'));
    }
  }

  async function handleDeleteBudget() {
    setSuccess('');
    setFormError('');

    if (!budget?._id) {
      setFormData(emptyBudget);
      setSuccess('Budget form reset.');
      return;
    }

    try {
      await deleteBudget(budget._id);
      setFormData(emptyBudget);
      setSuccess('Budget deleted successfully.');
    } catch (apiError) {
      setFormError(getErrorMessage(apiError, 'Unable to delete budget.'));
    }
  }

  function handleResetForm() {
    setFormData(budgetToForm(budget));
    setSuccess('');
    setFormError('');
  }

  const total = Object.values(formData.categories).reduce((sum, value) => sum + Number(value || 0), 0);
  const selectedTrip = trips.find((trip) => trip._id === selectedTripId);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Manual budget data</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-950">Budget Planner</h1>
      <p className="mt-3 text-slate-600">
        Save manual budget categories for a trip. Automatic estimation is planned for Milestone 6.
      </p>

      {error && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {formError && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{formError}</p>}
      {success && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}

      <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Select trip
          <select
            value={selectedTripId}
            onChange={handleTripSelect}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          >
            <option value="">Choose a trip</option>
            {trips.map((trip) => (
              <option key={trip._id} value={trip._id}>
                {trip.title}
              </option>
            ))}
          </select>
        </label>

        {!tripsLoading && trips.length === 0 && <p className="text-sm text-slate-600">Create a trip first from My Trips.</p>}
        {selectedTrip && (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <span className="font-semibold text-slate-950">Selected:</span> {selectedTrip.title}{' '}
            {selectedTrip.customDestination?.name ? `• ${selectedTrip.customDestination.name}` : ''}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryFields.map(([key, label]) => (
            <label key={key} className="grid gap-2 text-sm font-medium text-slate-700">
              {label}
              <input
                type="number"
                min="0"
                name={key}
                value={formData.categories[key]}
                onChange={handleCategoryChange}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
              />
            </label>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Currency
            <input
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              maxLength={3}
              className="rounded-2xl border border-slate-200 px-4 py-3 uppercase outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Confidence
            <select
              name="confidenceLevel"
              value={formData.confidenceLevel}
              onChange={handleChange}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Notes
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="Manual assumptions for this budget"
          />
        </label>

        <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {formData.currency.toUpperCase()} {total}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Confidence</p>
            <p className="mt-1 font-semibold capitalize text-slate-800">{formData.confidenceLevel}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Saved record</p>
            <p className="mt-1 font-semibold text-slate-800">{budget ? 'Available' : 'Not saved yet'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={!selectedTripId || isLoading}
            className="rounded-full bg-primary-500 px-6 py-3 font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Saving...' : 'Save Budget'}
          </button>
          <button
            type="button"
            onClick={handleResetForm}
            disabled={isLoading}
            className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-70"
          >
            Reset form
          </button>
          <button
            type="button"
            onClick={handleDeleteBudget}
            disabled={!selectedTripId || isLoading}
            className="rounded-full border border-rose-200 px-6 py-3 font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-70"
          >
            {budget ? 'Delete Budget' : 'Clear form'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default BudgetPage;
