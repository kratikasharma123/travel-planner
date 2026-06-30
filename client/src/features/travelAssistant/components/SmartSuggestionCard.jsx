function SmartSuggestionCard({ suggestion }) {
  const priorityClass = suggestion.priority === 'High' ? 'bg-rose-50 text-rose-700' : suggestion.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700';
  return (
    <article className="app-card-compact">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-2xl bg-white px-3 py-2 text-lg">{suggestion.icon || '💡'}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityClass}`}>{suggestion.priority || 'Low'}</span>
      </div>
      <h3 className="mt-3 font-bold text-slate-950">{suggestion.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{suggestion.description}</p>
    </article>
  );
}

export default SmartSuggestionCard;
