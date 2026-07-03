function AdminStatCard({ label, value, icon, helper }) {
  return (
    <article className="app-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          {helper && <p className="mt-2 text-sm text-slate-600">{helper}</p>}
        </div>
        <span className="rounded-2xl bg-primary-50 px-3 py-2 text-lg text-primary-700">{icon}</span>
      </div>
    </article>
  );
}

export default AdminStatCard;
