import { currencyFormat } from '../../../utils/budgetCalculations.js';

function DestinationRecommendationCard({ recommendation }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="h-32 bg-gradient-to-br from-primary-100 to-slate-200" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-950">{recommendation.destinationName}</h3>
            <p className="text-sm text-slate-600">{recommendation.city || recommendation.country}</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">★ {recommendation.rating}</span>
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-950">{currencyFormat(recommendation.estimatedBudget || 0)}</p>
        <p className="mt-1 text-sm text-slate-600">Best: {recommendation.bestTimeToVisit}</p>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Attractions</p>
        <p className="mt-1 text-sm text-slate-600">{recommendation.popularAttractions?.join(' • ')}</p>
      </div>
    </article>
  );
}

export default DestinationRecommendationCard;
