import { FileText, Repeat, Store, Tag, Wallet } from 'lucide-react';

const categories = ['accommodation', 'food', 'transport', 'activities', 'shopping', 'insurance', 'miscellaneous'];
const inputClass = 'rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:bg-slate-100';

function ExpenseForm({ formData, selectedBudget, editingExpense, onChange, onSubmit, onCancel, isSubmitting }) {
  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <FileText className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
          <input name="title" value={formData.title} onChange={onChange} required minLength={2} className={`${inputClass} w-full pl-11`} placeholder="Expense title" />
        </div>
        <div className="relative">
          <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
          <select name="category" value={formData.category} onChange={onChange} required className={`${inputClass} w-full pl-11 capitalize`}>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div className="relative">
          <Wallet className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
          <input type="number" name="amount" min="0" value={formData.amount} onChange={onChange} required className={`${inputClass} w-full pl-11`} placeholder="Amount" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Store className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
          <input name="vendor" value={formData.vendor} onChange={onChange} className={`${inputClass} w-full pl-11`} placeholder="Vendor" />
        </div>
        <select name="status" value={formData.status} onChange={onChange} required className={inputClass}>
          <option value="estimated">Estimated</option>
          <option value="actual">Actual</option>
        </select>
        <select name="costType" value={formData.costType} onChange={onChange} className={inputClass}>
          <option value="fixed">Fixed</option>
          <option value="variable">Variable</option>
          <option value="one-time">One-time</option>
          <option value="recurring">Recurring</option>
        </select>
        <div className="relative">
          <Repeat className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
          <select name="recurrenceFrequency" value={formData.recurrenceFrequency} onChange={onChange} disabled={formData.costType !== 'recurring'} className={`${inputClass} w-full pl-11`}>
            <option value="">No recurrence</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-orange-100 pt-5">
        <button type="submit" disabled={!selectedBudget || isSubmitting} className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Add Expense'}
        </button>
        {editingExpense && <button type="button" onClick={onCancel} className="rounded-full border border-orange-100 px-5 py-3 text-sm font-black text-orange-600 transition hover:bg-orange-50">Cancel edit</button>}
      </div>
    </form>
  );
}

export default ExpenseForm;
