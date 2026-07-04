function RecommendationCard({ recommendation }) {
  const priorityClass = recommendation.priority === 'High' ? 'bg-rose-50 text-rose-700 ring-rose-100' : recommendation.priority === 'Medium' ? 'bg-amber-50 text-amber-700 ring-amber-100' : 'bg-emerald-50 text-emerald-700 ring-emerald-100';

  return (
    <article className="rounded-[1.5rem] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-orange-100">{recommendation.icon}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${priorityClass}`}>{recommendation.priority}</span>
      </div>
      <h3 className="mt-4 font-black text-slate-950">{recommendation.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{recommendation.description}</p>
    </article>
  );
}

export default RecommendationCard;
