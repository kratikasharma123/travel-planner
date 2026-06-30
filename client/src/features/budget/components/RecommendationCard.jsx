function RecommendationCard({ recommendation }) {
  const priorityClass = recommendation.priority === 'High' ? 'bg-rose-50 text-rose-700' : recommendation.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700';

  return (
    <article className="app-card-compact">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-2xl bg-white px-3 py-2 text-xl">{recommendation.icon}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityClass}`}>{recommendation.priority}</span>
      </div>
      <h3 className="mt-4 font-bold text-slate-950">{recommendation.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{recommendation.description}</p>
    </article>
  );
}

export default RecommendationCard;
