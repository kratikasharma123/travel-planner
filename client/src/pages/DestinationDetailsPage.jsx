import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Heart, MapPin, Plane, Sparkles, Star, Wallet } from 'lucide-react';
import { fallbackDestinations } from '../data/destinationData.js';
import { useSavedPlaces } from '../hooks/useSavedPlaces.js';

function normalizeSlug(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function findDestination(destinationId, stateDestination) {
  if (stateDestination) return stateDestination;
  return fallbackDestinations.find((destination) => destination._id === destinationId || normalizeSlug(destination.name) === destinationId) || fallbackDestinations[0];
}

function placePayloadFromDestination(destination) {
  return {
    destinationId: destination.id || destination._id || null,
    name: destination.name,
    city: destination.region || destination.city || destination.name,
    country: destination.country,
    category: destination.category || destination.tags?.[0] || 'Destinations',
    notes: destination.description || '',
    imageUrl: destination.imageUrl || destination.image || '',
    rating: Number(destination.rating || 4.7),
    budgetLevel: destination.budgetLevel || destination.costLevel || 'mid-range',
    bestTime: destination.bestTimeToVisit || '',
    tags: destination.tags || [],
    metadata: { raw: destination },
  };
}

function DestinationDetailsPage() {
  const { destinationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const destination = findDestination(destinationId, location.state?.destination);
  const { savePlace } = useSavedPlaces();
  const [message, setMessage] = useState('');

  async function handleSavePlace() {
    setMessage('');
    try {
      await savePlace(placePayloadFromDestination(destination));
      setMessage('Destination saved successfully.');
    } catch (apiError) {
      setMessage(apiError?.response?.data?.message || apiError?.message || 'Unable to save place.');
    }
  }

  return (
    <section className="grid gap-6">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-700 ring-1 ring-orange-100 transition hover:bg-orange-50 hover:text-orange-600">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {message && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</p>}

      <section className="relative min-h-[30rem] overflow-hidden rounded-[2rem] shadow-2xl shadow-orange-100">
        <img src={destination.imageUrl || destination.image} alt={`${destination.name}, ${destination.country}`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-100 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Destination details
          </p>
          <h1 className="mt-5 text-5xl font-black tracking-tight sm:text-6xl">{destination.name}</h1>
          <p className="mt-3 flex items-center gap-2 text-lg font-semibold text-white/80">
            <MapPin className="h-5 w-5 text-orange-300" />
            {destination.country} {destination.region ? `• ${destination.region}` : ''}
          </p>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-white/80">{destination.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/planner" state={{ destination }} className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600">
              Plan Trip
              <Plane className="h-4 w-4" />
            </Link>
            <button type="button" onClick={handleSavePlace} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/25">
              <Heart className="h-4 w-4" />
              Save place
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Rating', value: destination.rating, icon: Star },
          { label: 'Budget', value: destination.budgetLevel || destination.costLevel, icon: Wallet },
          { label: 'Best time', value: destination.bestTimeToVisit, icon: CalendarDays },
          { label: 'Category', value: destination.category, icon: Sparkles },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40">
              <Icon className="h-6 w-6 text-orange-500" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
              <p className="mt-1 font-black text-slate-950">{item.value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <article className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Highlights</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Top things to experience</h2>
          <div className="mt-5 grid gap-3">
            {destination.popularAttractions?.map((attraction) => (
              <div key={attraction} className="rounded-2xl bg-orange-50 p-4 text-sm font-bold text-slate-700">
                {attraction}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-6 shadow-xl shadow-orange-100/40">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Travel mood</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Why you’ll love it</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {destination.tags?.map((tag) => (
              <span key={tag} className="rounded-full bg-white px-4 py-2 text-sm font-black text-orange-600 shadow-sm ring-1 ring-orange-100">
                {tag}
              </span>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}

export default DestinationDetailsPage;
