import { MapPin, Star } from 'lucide-react';
import { currencyFormat } from '../../../utils/budgetCalculations.js';

const destinationImages = {
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=90',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=90',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=90',
  ubud: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=90',
  panaji: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=90',
};

function getRecommendationImage(recommendation) {
  const destinationKey = recommendation.destinationName?.toLowerCase();
  const cityKey = recommendation.city?.toLowerCase();

  return (
    recommendation.imageUrl ||
    destinationImages[destinationKey] ||
    destinationImages[cityKey] ||
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=90'
  );
}

function DestinationRecommendationCard({ recommendation }) {
  const imageUrl = getRecommendationImage(recommendation);

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white shadow-lg shadow-orange-100/30 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-orange-100 via-amber-50 to-emerald-100">
        <img
          src={imageUrl}
          alt={`${recommendation.destinationName}, ${recommendation.country}`}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent" />
        <div className="absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-2xl bg-white text-orange-500 shadow-lg">
          <MapPin className="h-6 w-6" />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-950 group-hover:text-orange-600">{recommendation.destinationName}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">{recommendation.city || recommendation.country}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">
            <Star className="h-3.5 w-3.5 fill-current" />
            {recommendation.rating}
          </span>
        </div>
        <p className="mt-4 text-lg font-black text-slate-950">{currencyFormat(recommendation.estimatedBudget || 0)}</p>
        <p className="mt-1 text-sm text-slate-600">Best: {recommendation.bestTimeToVisit}</p>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-orange-500">Attractions</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{recommendation.popularAttractions?.join(' • ')}</p>
      </div>
    </article>
  );
}

export default DestinationRecommendationCard;
