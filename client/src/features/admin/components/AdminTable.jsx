import AdminEmptyState from './AdminEmptyState.jsx';

function AdminTable({
  columns = [],
  rows = [],
  actions,
  isLoading = false,
  emptyMessage = 'No records found.',
}) {
  if (isLoading)
    return <p className="rounded-2xl bg-orange-50 p-5 text-sm font-semibold text-stone-600">Loading records...</p>;
  if (!rows.length)
    return (
      <AdminEmptyState
        title={emptyMessage}
        description="There is no matching data for this section yet."
      />
    );

  return (
    <div className="overflow-x-auto rounded-[20px] border border-orange-100 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-orange-50/80 text-xs uppercase tracking-[0.16em] text-orange-700">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-black">
                {column.label}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right font-black">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-orange-100 bg-white">
          {rows.map((row) => (
            <tr key={row.id || row._id} className="transition hover:bg-orange-50/50">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-stone-700">
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
