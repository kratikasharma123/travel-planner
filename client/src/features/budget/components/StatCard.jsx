function StatCard({ label, value, helper, tone = 'slate', icon }) {
  const toneClasses = {
    slate: 'bg-slate-50 text-slate-700',
    green: 'bg-emerald-50 text-emerald-700',
    yellow: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
    blue: 'bg-primary-50 text-primary-700',
  };

  return (
    <article className="app-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        {icon && <span className={`rounded-2xl px-3 py-2 text-lg ${toneClasses[tone] || toneClasses.slate}`}>{icon}</span>}
      </div>
      {helper && <p className="mt-3 text-sm text-slate-600">{helper}</p>}
    </article>
  );
}

export default StatCard;
