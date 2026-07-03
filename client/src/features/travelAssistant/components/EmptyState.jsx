function EmptyState({ title = 'Nothing here yet', description = 'Start by adding your first item.' }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 text-slate-600">
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm">{description}</p>
    </div>
  );
}

export default EmptyState;
