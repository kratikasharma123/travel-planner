function SmartSuggestionCard({ suggestion }) {
  const priorityClass = suggestion.priority === 'High'
    ? 'bg-rose-50 text-rose-700'
    : suggestion.priority === 'Medium'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-emerald-50 text-emerald-700';

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-orange-100 bg-gradient-to-br from-white to-orange-50/60 p-5 shadow-lg shadow-orange-100/30 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-orange-100 transition group-hover:rotate-6">
          {suggestion.icon || '💡'}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${priorityClass}`}>{suggestion.priority || 'Low'}</span>
      </div>
      <h3 className="mt-4 font-black text-slate-950 group-hover:text-orange-600">{suggestion.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{suggestion.description}</p>
    </article>
  );
}

export default SmartSuggestionCard;
