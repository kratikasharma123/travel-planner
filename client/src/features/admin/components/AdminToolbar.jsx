function AdminToolbar({ search, onSearchChange, filters = [], actions, resultCount }) {
  return (
    <div className="mb-5 grid gap-3 rounded-2xl bg-slate-50 p-4 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto]">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="form-control bg-white"
            placeholder="Search records..."
            aria-label="Search admin records"
          />
        </label>
        <div className="grid gap-3 sm:grid-flow-col sm:auto-cols-max">
          {filters.map((filter) => (
            <label key={filter.key} className="grid gap-1 text-sm font-medium text-slate-700">
              {filter.label}
              <select
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
                className="form-control bg-white"
                aria-label={filter.label}
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={option.value || option} value={option.value || option}>
                    {option.label || option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {typeof resultCount === 'number' && (
          <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
            {resultCount} records
          </span>
        )}
        {actions}
      </div>
    </div>
  );
}

export default AdminToolbar;
