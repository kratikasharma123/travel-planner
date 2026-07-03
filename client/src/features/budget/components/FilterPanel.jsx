const inputClass = 'rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100';

function FilterPanel({ filters, budgets = [], onChange, onReset, onPageSizeChange }) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 lg:grid-cols-6">
        <input name="search" value={filters.search} onChange={onChange} className={`${inputClass} lg:col-span-2`} placeholder="Search title, vendor, category, notes" />
        <select name="budgetId" value={filters.budgetId || ''} onChange={onChange} className={inputClass}>
          <option value="">All budgets</option>
          {budgets.map((budget) => <option key={budget._id} value={budget._id}>{budget.name}</option>)}
        </select>
        <input name="category" value={filters.category} onChange={onChange} className={inputClass} placeholder="Category" />
        <input name="vendor" value={filters.vendor} onChange={onChange} className={inputClass} placeholder="Vendor" />
        <select name="status" value={filters.status} onChange={onChange} className={inputClass}>
          <option value="">All statuses</option>
          <option value="estimated">Estimated</option>
          <option value="actual">Actual</option>
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <input type="date" name="startDate" value={filters.startDate} onChange={onChange} className={inputClass} />
        <input type="date" name="endDate" value={filters.endDate} onChange={onChange} className={inputClass} />
        <input type="month" name="month" value={filters.month} onChange={onChange} className={inputClass} />
        <input type="number" name="year" value={filters.year} onChange={onChange} min="2000" max="2100" className={inputClass} placeholder="Year" />
        <select name="limit" value={filters.limit} onChange={onPageSizeChange} className={inputClass}>
          <option value="10">10 rows</option>
          <option value="20">20 rows</option>
          <option value="50">50 rows</option>
        </select>
        <button type="button" onClick={onReset} className="rounded-full border border-orange-100 px-5 py-3 text-sm font-black text-orange-600 transition hover:bg-orange-50">Reset Filters</button>
      </div>
    </div>
  );
}

export default FilterPanel;
