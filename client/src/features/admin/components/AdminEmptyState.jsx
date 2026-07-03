function AdminEmptyState({
  title = 'No records found.',
  description = 'Try adjusting filters or create a new record.',
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}

export default AdminEmptyState;
