import AdminEmptyState from './AdminEmptyState.jsx';

function AdminTable({
  columns = [],
  rows = [],
  actions,
  isLoading = false,
  emptyMessage = 'No records found.',
}) {
  if (isLoading)
    return <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">Loading records...</p>;
  if (!rows.length)
    return (
      <AdminEmptyState
        title={emptyMessage}
        description="There is no matching data for this section yet."
      />
    );

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3">
                {column.label}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row.id || row._id} className="hover:bg-slate-50/70">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-slate-700">
                  {column.render ? column.render(row) : row[column.key] || '—'}
                </td>
              ))}
              {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTable;
