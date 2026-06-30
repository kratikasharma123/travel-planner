function ChecklistPanel({ items = [], onSeed }) {
  const completed = items.filter((item) => item.isComplete).length;
  const percent = items.length ? Math.round((completed / items.length) * 100) : 0;
  return (
    <section className="app-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="section-eyebrow">Travel checklist</p><h2 className="section-title">Packing & essentials</h2></div>
        <button type="button" onClick={onSeed} className="btn-secondary">Generate packing list</button>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary-500" style={{ width: `${percent}%` }} /></div>
      <p className="mt-2 text-sm font-semibold text-slate-600">{percent}% complete</p>
      <div className="mt-5 grid gap-2">
        {items.slice(0, 8).map((item) => <div key={item._id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm"><span>{item.isComplete ? '✅' : '⬜'}</span><span className="font-semibold text-slate-700">{item.category}</span><span className="text-slate-600">{item.title}</span></div>)}
        {items.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No checklist items yet.</p>}
      </div>
    </section>
  );
}

export default ChecklistPanel;
