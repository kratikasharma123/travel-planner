function BudgetForm({ formData, trips = [], selectedBudget, onChange, onSubmit, onCancel, onDelete, isSubmitting }) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Budget Name
          <input name="name" value={formData.name} onChange={onChange} required minLength={2} className="form-control" placeholder="Europe summer budget" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Trip
          <select name="tripId" value={formData.tripId || ''} onChange={onChange} required className="form-control">
            <option value="">Select trip</option>
            {trips.map((trip) => (
              <option key={trip._id} value={trip._id}>{trip.title}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Category
          <select name="category" value={formData.category} onChange={onChange} required className="form-control">
            <option value="general">General</option>
            <option value="business">Business</option>
            <option value="family">Family</option>
            <option value="honeymoon">Honeymoon</option>
            <option value="solo">Solo</option>
            <option value="group">Group</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Total Budget
          <input type="number" name="totalBudget" min="0" value={formData.totalBudget} onChange={onChange} required className="form-control" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Currency
          <input name="currency" value={formData.currency} onChange={onChange} required minLength={3} maxLength={3} className="form-control uppercase" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Start Date
          <input type="date" name="startDate" value={formData.startDate} onChange={onChange} required className="form-control" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          End Date
          <input type="date" name="endDate" value={formData.endDate} onChange={onChange} required className="form-control" />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Description
          <textarea name="description" value={formData.description} onChange={onChange} rows="3" className="form-control" placeholder="Budget notes and assumptions" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Savings Target
          <input type="number" name="savingsTarget" min="0" value={formData.savingsTarget} onChange={onChange} className="form-control" />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : selectedBudget ? 'Update Budget' : 'Create Budget'}
        </button>
        {selectedBudget && (
          <button type="button" onClick={onCancel} className="btn-secondary">New Budget</button>
        )}
        {selectedBudget && (
          <button type="button" onClick={onDelete} disabled={isSubmitting} className="btn-danger">Delete Budget</button>
        )}
      </div>
    </form>
  );
}

export default BudgetForm;
