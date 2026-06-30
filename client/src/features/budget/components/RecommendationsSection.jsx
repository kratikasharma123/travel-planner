import RecommendationCard from './RecommendationCard.jsx';

function RecommendationsSection({ recommendations = [] }) {
  return (
    <section className="app-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow">Cost optimization</p>
          <h2 className="section-title">Smart recommendations</h2>
        </div>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">{recommendations.length} insights</span>
      </div>
      {recommendations.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Add expenses to unlock spending insights and savings opportunities.</p>
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
