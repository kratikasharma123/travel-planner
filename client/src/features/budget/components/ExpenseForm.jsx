const categories = ['accommodation', 'food', 'transport', 'activities', 'shopping', 'insurance', 'miscellaneous'];

function ExpenseForm({ formData, selectedBudget, editingExpense, onChange, onSubmit, onCancel, isSubmitting }) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 lg:grid-cols-4">
        <input name="title" value={formData.title} onChange={onChange} required minLength={2} className="form-control lg:col-span-2" placeholder="Expense title" />
        <select name="category" value={formData.category} onChange={onChange} required className="form-control">
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <input type="number" name="amount" min="0" value={formData.amount} onChange={onChange} required className="form-control" placeholder="Amount" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <input type="date" name="expenseDate" value={formData.expenseDate} onChange={onChange} required className="form-control" />
        <input name="vendor" value={formData.vendor} onChange={onChange} className="form-control" placeholder="Vendor" />
        <select name="status" value={formData.status} onChange={onChange} required className="form-control">
          <option value="estimated">Estimated</option>
          <option value="actual">Actual</option>
        </select>
        <select name="costType" value={formData.costType} onChange={onChange} className="form-control">
          <option value="fixed">Fixed</option>
          <option value="variable">Variable</option>
          <option value="one-time">One-time</option>
          <option value="recurring">Recurring</option>
        </select>
        <select name="recurrenceFrequency" value={formData.recurrenceFrequency} onChange={onChange} disabled={formData.costType !== 'recurring'} className="form-control disabled:bg-slate-100">
          <option value="">No recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <input type="date" name="recurrenceEndDate" value={formData.recurrenceEndDate} onChange={onChange} disabled={formData.costType !== 'recurring'} className="form-control disabled:bg-slate-100" />
        <textarea name="notes" value={formData.notes} onChange={onChange} rows="2" className="form-control" placeholder="Notes" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={!selectedBudget || isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Add Expense'}
        </button>
        {editingExpense && <button type="button" onClick={onCancel} className="btn-secondary">Cancel edit</button>}
      </div>
    </form>
  );
}

export default ExpenseForm;
