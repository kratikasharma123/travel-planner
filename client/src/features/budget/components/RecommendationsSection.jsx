import RecommendationCard from './RecommendationCard.jsx';

function RecommendationsSection({ recommendations = [] }) {
  return (
    <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Cost optimization</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Smart recommendations</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">AI-style suggestions based on your current spending pattern.</p>
        </div>
        <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-orange-600 ring-1 ring-orange-100">{recommendations.length} insights</span>
      </div>
      {recommendations.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm font-semibold text-slate-600">Add expenses to unlock spending insights and savings opportunities.</p>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {recommendations.map((recommendation) => (
            <RecommendationCard key={`${recommendation.title}-${recommendation.priority}`} recommendation={recommendation} />
          ))}
        </div>
      )}
    </section>
  );
}

export default RecommendationsSection;
