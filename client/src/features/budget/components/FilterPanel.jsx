function FilterPanel({ filters, budgets = [], onChange, onReset, onPageSizeChange }) {
  return (
    <div className="app-card">
      <div className="grid gap-3 lg:grid-cols-6">
        <input name="search" value={filters.search} onChange={onChange} className="form-control lg:col-span-2" placeholder="Search title, vendor, category, notes" />
        <select name="budgetId" value={filters.budgetId || ''} onChange={onChange} className="form-control">
          <option value="">All budgets</option>
          {budgets.map((budget) => <option key={budget._id} value={budget._id}>{budget.name}</option>)}
        </select>
        <input name="category" value={filters.category} onChange={onChange} className="form-control" placeholder="Category" />
        <input name="vendor" value={filters.vendor} onChange={onChange} className="form-control" placeholder="Vendor" />
        <select name="status" value={filters.status} onChange={onChange} className="form-control">
          <option value="">All statuses</option>
          <option value="estimated">Estimated</option>
          <option value="actual">Actual</option>
        </select>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <input type="date" name="startDate" value={filters.startDate} onChange={onChange} className="form-control" />
        <input type="date" name="endDate" value={filters.endDate} onChange={onChange} className="form-control" />
        <input type="month" name="month" value={filters.month} onChange={onChange} className="form-control" />
        <input type="number" name="year" value={filters.year} onChange={onChange} min="2000" max="2100" className="form-control" placeholder="Year" />
        <select name="limit" value={filters.limit} onChange={onPageSizeChange} className="form-control">
          <option value="10">10 rows</option>
          <option value="20">20 rows</option>
          <option value="50">50 rows</option>
        </select>
        <button type="button" onClick={onReset} className="btn-secondary">Reset Filters</button>
      </div>
    </div>
  );
}

export default FilterPanel;
