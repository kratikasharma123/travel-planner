import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Coffee,
  Compass,
  Heart,
  Hotel,
  MapPin,
  Mountain,
  Plane,
  Route,
  Sparkles,
  Star,
  Trash2,
  Utensils,
  Wallet,
} from 'lucide-react';
import { fallbackDestinations } from '../data/destinationData.js';

const categoryChips = ['All', 'Destinations', 'Hotels', 'Restaurants', 'Cafes', 'Beaches', 'Mountains', 'Activities', 'Hidden Gems'];

const extraSavedPlaces = [
  {
    id: 'tulum-cafe',
    name: 'Nomad Sunrise Cafe',
    city: 'Tulum',
    country: 'Mexico',
    category: 'Cafes',
    rating: 4.7,
    budgetLevel: 'Mid-range',
    bestTime: '8 AM - 1 PM',
    notes: 'Beach breakfast spot with smoothie bowls and quiet morning views.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=90',
  },
  {
    id: 'jaipur-food',
    name: 'Old City Food Walk',
    city: 'Jaipur',
    country: 'India',
    category: 'Restaurants',
    rating: 4.8,
    budgetLevel: 'Budget',
    bestTime: '6 PM - 9 PM',
    notes: 'Perfect for kachori, kulfi, chai, and warm evening street scenes.',
    imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=90',
  },
  {
    id: 'interlaken-hike',
    name: 'Harder Kulm Trail',
    city: 'Interlaken',
    country: 'Switzerland',
    category: 'Mountains',
    rating: 4.9,
    budgetLevel: 'Premium',
    bestTime: 'June to September',
    notes: 'Mountain views, picnic stops, and one of the best sunset viewpoints.',
    imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=90',
  },
];

const collections = [
  { title: 'Honeymoon Ideas', count: 8, icon: Heart, tone: 'bg-rose-50 text-rose-600' },
  { title: 'Budget Trips', count: 12, icon: Wallet, tone: 'bg-emerald-50 text-emerald-700' },
  { title: 'Weekend Escapes', count: 6, icon: Plane, tone: 'bg-orange-50 text-orange-600' },
  { title: 'Food Places', count: 14, icon: Utensils, tone: 'bg-amber-50 text-amber-700' },
  { title: 'Adventure Spots', count: 9, icon: Mountain, tone: 'bg-teal-50 text-teal-700' },
];

const aiSuggestions = [
  { title: 'Similar places you may like', description: 'Find destinations with the same vibe as your favorites.', icon: Sparkles, tone: 'bg-orange-50 text-orange-600' },
  { title: 'Best time to visit', description: 'Compare seasons, prices, and crowd levels before booking.', icon: CalendarDays, tone: 'bg-emerald-50 text-emerald-700' },
  { title: 'Build itinerary from saved places', description: 'Turn your saved spots into a clean day-wise plan.', icon: Route, tone: 'bg-amber-50 text-amber-700' },
  { title: 'Compare saved destinations', description: 'Shortlist by budget, safety, weather, and travel style.', icon: Compass, tone: 'bg-teal-50 text-teal-700' },
];

function normalizeSavedPlace(place, index = 0) {
  const fallback = fallbackDestinations[index % fallbackDestinations.length];
  const source = typeof place === 'string' ? { name: place } : place;
  const name = source.name || source.destinationName || fallback.name;
  const tags = source.tags?.length ? source.tags : fallback.tags;
  const category = source.category || (tags?.includes('Food') ? 'Restaurants' : tags?.includes('Beach') ? 'Beaches' : tags?.includes('Mountains') ? 'Mountains' : 'Destinations');

  return {
    id: source.id || source._id || `${name}-${source.country || fallback.country}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    city: source.city || source.region || fallback.region || name,
    country: source.country || fallback.country,
    category,
    rating: source.rating || fallback.rating || 4.7,
    budgetLevel: source.budgetLevel || source.costLevel || fallback.budgetLevel || 'Mid-range',
    bestTime: source.bestTime || source.bestTimeToVisit || fallback.bestTimeToVisit || 'Anytime',
    notes: source.notes || source.description || fallback.description,
    imageUrl: source.imageUrl || source.image || fallback.imageUrl,
    raw: source,
  };
}

function getStoredPlaces() {
  try {
    return JSON.parse(window.localStorage.getItem('tripsafar-favorite-destinations') || '[]').map(normalizeSavedPlace);
  } catch {
    return [];
  }
}

function saveStoredPlaces(places) {
  window.localStorage.setItem('tripsafar-favorite-destinations', JSON.stringify(places));
  window.dispatchEvent(new Event('tripsafar-favorites-updated'));
}

function matchesCategory(place, category) {
  if (category === 'All') return true;
  const haystack = [place.category, place.name, place.city, place.country, place.notes].join(' ').toLowerCase();
  const normalizedCategory = category.toLowerCase().replace(/s$/, '');
  return haystack.includes(normalizedCategory) || (category === 'Destinations' && place.category === 'Destinations');
}

function SavedPlaceCard({ place, onRemove, onPlanTrip }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-xl shadow-orange-100/40 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-100/70">
      <div className="relative h-64 overflow-hidden">
        <img src={place.imageUrl} alt={place.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/10" />
        <button type="button" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-orange-500 text-white shadow-lg backdrop-blur" aria-label={`Saved ${place.name}`}>
          <Heart className="h-5 w-5 fill-current" />
        </button>
        <span className="absolute bottom-4 left-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white shadow-lg">{place.category}</span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-950 group-hover:text-orange-600">{place.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-500"><MapPin className="h-4 w-4 text-orange-500" />{place.city}, {place.country}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-800 ring-1 ring-orange-100"><Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />{place.rating}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-orange-50 p-3"><Wallet className="h-4 w-4 text-orange-500" /><p className="mt-2 font-black text-slate-800">{place.budgetLevel}</p></div>
          <div className="rounded-2xl bg-emerald-50 p-3"><CalendarDays className="h-4 w-4 text-emerald-600" /><p className="mt-2 font-black text-slate-800">{place.bestTime}</p></div>
        </div>

        <p className="mt-4 line-clamp-2 rounded-2xl bg-amber-50/70 p-3 text-sm leading-6 text-slate-600">{place.notes}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => onPlanTrip(place)} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white transition hover:bg-orange-600">Plan Trip</button>
          <button type="button" className="rounded-full border border-orange-100 px-4 py-2 text-sm font-black text-orange-600 transition hover:bg-orange-50">View Details</button>
          <button type="button" onClick={() => onRemove(place.id)} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-50"><Trash2 className="mr-1 inline h-4 w-4" />Remove</button>
        </div>
      </div>
    </article>
  );
}

function SavedPlacesPage() {
  const navigate = useNavigate();
  const [savedPlaces, setSavedPlaces] = useState(() => {
    const stored = getStoredPlaces();
    return stored.length ? stored : [...fallbackDestinations.slice(0, 5).map(normalizeSavedPlace), ...extraSavedPlaces];
  });
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPlaces = useMemo(() => savedPlaces.filter((place) => matchesCategory(place, activeCategory)), [activeCategory, savedPlaces]);

  const stats = useMemo(() => [
    { label: 'Total Saved Places', value: savedPlaces.length, icon: Heart, tone: 'bg-orange-50 text-orange-600' },
    { label: 'Destinations', value: savedPlaces.filter((place) => place.category === 'Destinations').length, icon: MapPin, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Hotels', value: savedPlaces.filter((place) => place.category === 'Hotels').length, icon: Hotel, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Restaurants', value: savedPlaces.filter((place) => ['Restaurants', 'Cafes'].includes(place.category)).length, icon: Coffee, tone: 'bg-teal-50 text-teal-700' },
    { label: 'Activities', value: savedPlaces.filter((place) => ['Activities', 'Mountains', 'Beaches', 'Hidden Gems'].includes(place.category)).length, icon: Compass, tone: 'bg-lime-50 text-lime-700' },
  ], [savedPlaces]);

  function handleRemove(placeId) {
    setSavedPlaces((current) => {
      const next = current.filter((place) => place.id !== placeId);
      saveStoredPlaces(next.map((place) => place.raw || place));
      return next;
    });
  }

  function handlePlanTrip(place) {
    navigate('/planner', { state: { destination: { name: place.name, country: place.country, city: place.city, imageUrl: place.imageUrl, tag: place.category } } });
  }

  return (
    <section className="relative grid gap-6 overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-96 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />

      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 p-6 shadow-2xl shadow-orange-100 sm:p-8 lg:p-10">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=90"
          alt="Saved places beach travel background"
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-orange-950/45 to-orange-400/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(251,146,60,0.35),transparent_30%),radial-gradient(circle_at_86%_76%,rgba(16,185,129,0.24),transparent_28%)]" />
        <Heart className="absolute right-10 top-8 hidden h-24 w-24 rotate-12 text-white/50 md:block" />
        <div className="relative max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-100 shadow-sm backdrop-blur"><Sparkles className="h-4 w-4" />Saved travel board</p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">Your saved places</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/85 sm:text-lg">Keep track of destinations, hotels, restaurants, and hidden gems.</p>
          <button type="button" onClick={() => navigate('/destinations')} className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-600">Explore Destinations<ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40 transition hover:-translate-y-1 hover:shadow-xl">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${stat.tone}`}><Icon className="h-6 w-6" /></span>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
              <p className="mt-1 text-3xl font-black text-slate-950">{stat.value}</p>
            </article>
          );
        })}
      </section>

      <section className="flex flex-wrap gap-2">
        {categoryChips.map((category) => (
          <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`rounded-full px-4 py-2 text-sm font-black transition ${activeCategory === category ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-600 ring-1 ring-orange-100 hover:bg-orange-50 hover:text-orange-600'}`}>
            {category}
          </button>
        ))}
      </section>

      {filteredPlaces.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-orange-200 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-10 text-center shadow-lg shadow-orange-100/40">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-white text-orange-500 shadow-xl shadow-orange-100"><Heart className="h-10 w-10" /></div>
          <h2 className="mt-5 text-2xl font-black text-slate-950">No saved places yet</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Save destinations, cafes, hotels, and hidden gems to build your perfect trip board.</p>
          <button type="button" onClick={() => navigate('/destinations')} className="mt-5 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600">Start exploring</button>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPlaces.map((place) => <SavedPlaceCard key={place.id} place={place} onRemove={handleRemove} onPlanTrip={handlePlanTrip} />)}
        </section>
      )}

      <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Collections</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Saved collections</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {collections.map((collection) => {
            const Icon = collection.icon;
            return (
              <article key={collection.title} className="rounded-[1.5rem] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-4 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${collection.tone}`}><Icon className="h-6 w-6" /></span>
                <h3 className="mt-4 font-black text-slate-950">{collection.title}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">{collection.count} saved ideas</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">AI suggestions</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Make more from saved places</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {aiSuggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <article key={suggestion.title} className="rounded-[1.5rem] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-4 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${suggestion.tone}`}><Icon className="h-6 w-6" /></span>
                <h3 className="mt-4 font-black text-slate-950">{suggestion.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{suggestion.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

export default SavedPlacesPage;
