import { CalendarDays, Coins, FileText, Flag, PiggyBank, Wallet } from 'lucide-react';

function FieldLabel({ icon, label, children }) {
  const FieldIcon = icon;

  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      <span className="inline-flex items-center gap-2">
        <FieldIcon className="h-4 w-4 text-orange-500" />
        {label}
      </span>
      {children}
    </label>
  );
}

function BudgetForm({ formData, trips = [], selectedBudget, onChange, onSubmit, onCancel, onDelete, isSubmitting }) {
  const inputClass = 'rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100';

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <div className="grid gap-4 lg:grid-cols-3">
        <FieldLabel icon={Wallet} label="Budget Name">
          <input name="name" value={formData.name} onChange={onChange} required minLength={2} className={inputClass} placeholder="Europe summer budget" />
        </FieldLabel>
        <FieldLabel icon={Flag} label="Trip">
          <select name="tripId" value={formData.tripId || ''} onChange={onChange} required className={inputClass}>
            <option value="">Select trip</option>
            {trips.map((trip) => (
              <option key={trip._id} value={trip._id}>{trip.title}</option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel icon={FileText} label="Category">
          <select name="category" value={formData.category} onChange={onChange} required className={inputClass}>
            <option value="general">General</option>
            <option value="business">Business</option>
            <option value="family">Family</option>
            <option value="honeymoon">Honeymoon</option>
            <option value="solo">Solo</option>
            <option value="group">Group</option>
          </select>
        </FieldLabel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FieldLabel icon={Coins} label="Total Budget">
          <input type="number" name="totalBudget" min="0" value={formData.totalBudget} onChange={onChange} required className={inputClass} placeholder="2500" />
        </FieldLabel>
        <FieldLabel icon={Wallet} label="Currency">
          <input name="currency" value={formData.currency} onChange={onChange} required minLength={3} maxLength={3} className={`${inputClass} uppercase`} />
        </FieldLabel>
        <FieldLabel icon={CalendarDays} label="Start Date">
          <input type="date" name="startDate" value={formData.startDate} onChange={onChange} required className={inputClass} />
        </FieldLabel>
        <FieldLabel icon={CalendarDays} label="End Date">
          <input type="date" name="endDate" value={formData.endDate} onChange={onChange} required className={inputClass} />
        </FieldLabel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <FieldLabel icon={FileText} label="Description">
          <textarea name="description" value={formData.description} onChange={onChange} rows="3" className={inputClass} placeholder="Budget notes and assumptions" />
        </FieldLabel>
        <FieldLabel icon={PiggyBank} label="Savings Target">
          <input type="number" name="savingsTarget" min="0" value={formData.savingsTarget} onChange={onChange} className={inputClass} placeholder="500" />
        </FieldLabel>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-orange-100 pt-5">
        <button type="submit" disabled={isSubmitting} className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'Saving...' : selectedBudget ? 'Update Budget' : 'Create Budget'}
        </button>
        {selectedBudget && (
          <button type="button" onClick={onCancel} className="rounded-full border border-orange-100 px-5 py-3 text-sm font-black text-orange-600 transition hover:bg-orange-50">New Budget</button>
        )}
        {selectedBudget && (
          <button type="button" onClick={onDelete} disabled={isSubmitting} className="rounded-full border border-rose-200 px-5 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50 disabled:opacity-60">Delete Budget</button>
        )}
      </div>
    </form>
  );
}

export default BudgetForm;
