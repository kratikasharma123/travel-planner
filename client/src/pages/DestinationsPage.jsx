import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Compass,
  Eye,
  Flame,
  Gem,
  Heart,
  MapPin,
  Mountain,
  Plane,
  Search,
  Sparkles,
  Star,
  Utensils,
  Wallet,
} from 'lucide-react';
import { fallbackDestinations } from '../data/destinationData.js';
import { useDestinations } from '../hooks/useDestinations.js';
import { useSavedPlaces } from '../hooks/useSavedPlaces.js';

const categories = ['All', 'Beach', 'Mountains', 'Adventure', 'Romantic', 'Family', 'Budget Friendly', 'Luxury', 'Culture', 'Food'];

const aiRecommendationCards = [
  { title: 'Best for your budget', subtitle: 'Warm stays, fewer transfers, better value', icon: Wallet, color: 'bg-orange-50 text-orange-600' },
  { title: 'Trending this month', subtitle: 'Places travelers are saving right now', icon: Flame, color: 'bg-amber-50 text-amber-700' },
  { title: 'Perfect weekend trip', subtitle: 'Short, easy, and high-impact escapes', icon: Plane, color: 'bg-emerald-50 text-emerald-700' },
  { title: 'Hidden gem', subtitle: 'Less crowded picks with local charm', icon: Gem, color: 'bg-teal-50 text-teal-700' },
];

function normalizeDestination(destination, index = 0) {
  const fallback = fallbackDestinations[index % fallbackDestinations.length];
  const name = destination.name || destination.destinationName || fallback.name;
  const tags = destination.tags?.length ? destination.tags : fallback.tags;
  const category = destination.category || tags?.[0] || fallback.category;

  return {
    ...fallback,
    ...destination,
    _id: destination._id || destination.id || `${name}-${destination.country || fallback.country}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    id: destination.id || destination._id || `${name}-${destination.country || fallback.country}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    country: destination.country || fallback.country,
    category,
    tags,
    imageUrl: destination.imageUrl || destination.image || fallback.imageUrl,
    budgetLevel: destination.budgetLevel || destination.costLevel || fallback.budgetLevel,
    costLevel: destination.costLevel || fallback.costLevel,
    rating: destination.rating || fallback.rating,
    bestTimeToVisit: destination.bestTimeToVisit || fallback.bestTimeToVisit,
    description: destination.description || fallback.description,
    popularAttractions: destination.popularAttractions?.length ? destination.popularAttractions : fallback.popularAttractions,
  };
}

function placePayloadFromDestination(destination) {
  return {
    destinationId: destination.id || destination._id || null,
    name: destination.name,
    city: destination.region || destination.city || destination.name,
    country: destination.country,
    category: destination.category || destination.tags?.[0] || 'Destinations',
    notes: destination.description || '',
    imageUrl: destination.imageUrl || '',
    rating: Number(destination.rating || 4.7),
    budgetLevel: destination.budgetLevel || destination.costLevel || 'mid-range',
    bestTime: destination.bestTimeToVisit || '',
    tags: destination.tags || [],
    metadata: { raw: destination },
  };
}

function matchesCategory(destination, category) {
  if (category === 'All') return true;
  const haystack = [destination.category, destination.budgetLevel, destination.costLevel, ...(destination.tags || [])]
    .join(' ')
    .toLowerCase();
  return haystack.includes(category.toLowerCase());
}

function DestinationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedDestination = location.state?.destination;
  const { destinations, isLoading, error } = useDestinations();
  const {
    savedPlaces,
    isLoading: savedPlacesLoading,
    error: savedPlacesError,
    savePlace,
    removeSavedPlace,
    removeSavedPlaceByDestination,
  } = useSavedPlaces();
  const [showWishlist, setShowWishlist] = useState(Boolean(location.state?.showWishlist));
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || selectedDestination?.name || selectedDestination?.city || '');
  const [appliedSearch, setAppliedSearch] = useState(location.state?.searchQuery || selectedDestination?.name || selectedDestination?.city || '');
  const [activeCategory, setActiveCategory] = useState('All');

  const normalizedDestinations = useMemo(() => {
    const source = destinations.length ? destinations : fallbackDestinations;
    return source.map((destination, index) => normalizeDestination(destination, index));
  }, [destinations]);

  const visibleDestinations = useMemo(() => {
    const source = showWishlist ? savedPlaces : normalizedDestinations;
    const query = appliedSearch.trim().toLowerCase();

    return source.filter((destination) => {
      const text = [
        destination.name,
        destination.country,
        destination.region,
        destination.description,
        destination.category,
        ...(destination.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      return (!query || text.includes(query)) && matchesCategory(destination, activeCategory);
    });
  }, [activeCategory, appliedSearch, normalizedDestinations, savedPlaces, showWishlist]);

  const searchSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const source = showWishlist ? savedPlaces : normalizedDestinations;
    return source
      .filter((destination) => {
        const text = [destination.name, destination.country, destination.region, destination.description, destination.category, ...(destination.tags || [])]
          .join(' ')
          .toLowerCase();
        return text.includes(query);
      })
      .slice(0, 5);
  }, [normalizedDestinations, savedPlaces, searchQuery, showWishlist]);

  const featuredDestination = visibleDestinations[0] || normalizedDestinations[0];
  const favoriteNames = new Set(savedPlaces.map((destination) => destination.name));
  const favoriteDestinationIds = new Set(savedPlaces.map((destination) => destination.destinationId).filter(Boolean));
  const countryCount = new Set(normalizedDestinations.map((destination) => destination.country)).size;

  function handleApplyLegacyFilters(event) {
    event?.preventDefault();
    setAppliedSearch(searchQuery.trim());
    setSearchQuery('');
  }

  function handleSuggestionClick(destination) {
    setAppliedSearch(destination.name);
    setSearchQuery('');
    setShowWishlist(false);
  }

  function clearFilters() {
    setSearchQuery('');
    setAppliedSearch('');
    setActiveCategory('All');
    setShowWishlist(false);
  }

  function handleShowWishlist() {
    setShowWishlist(true);
  }

  function handleShowAllDestinations() {
    setShowWishlist(false);
  }

  async function toggleWishlist(destination) {
    setSuccess('');
    const savedPlace = savedPlaces.find((item) => item.destinationId === (destination.id || destination._id) || item.name === destination.name);

    try {
      if (savedPlace) {
        await removeSavedPlace(savedPlace._id);
        setSuccess('Saved place removed successfully.');
      } else {
        await savePlace(placePayloadFromDestination(destination));
        setSuccess('Destination saved successfully.');
      }
    } catch {
      setSuccess('');
    }
  }

  async function handleRemoveWishlist(destination) {
    setSuccess('');
    try {
      if (destination.destinationId) {
        await removeSavedPlaceByDestination(destination.destinationId);
      } else {
        await removeSavedPlace(destination._id || destination.id);
      }
      setSuccess('Saved place removed successfully.');
    } catch {
      setSuccess('');
    }
  }

  function planTrip(destination) {
    navigate('/planner', { state: { destination } });
  }

  return (
    <section className="relative grid gap-6 overflow-hidden">
      <div className="pointer-events-none absolute -left-28 top-20 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-96 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />

      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 p-6 shadow-2xl shadow-orange-100 sm:p-8 lg:p-10">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=90"
          alt="Warm tropical travel destination background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-orange-950/45 to-orange-400/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.35),transparent_30%),radial-gradient(circle_at_85%_75%,rgba(16,185,129,0.28),transparent_28%)]" />

        <div className="relative max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-100 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            AI destination discovery
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
            Discover your next destination
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/85 sm:text-lg">
            Explore handpicked places, hidden gems, and AI-powered recommendations.
          </p>

          <form onSubmit={handleApplyLegacyFilters} className="mt-8 flex max-w-3xl flex-col gap-3 rounded-[1.6rem] bg-white/85 p-2 backdrop-blur sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-500" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-13 min-h-12 w-full rounded-[1.25rem] border-0 bg-transparent px-12 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="Search Bali, mountains, food, culture..."
              />
              {searchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-[1.25rem] border border-orange-100 bg-white shadow-xl shadow-orange-100/60">
                  {searchSuggestions.map((destination) => (
                    <button
                      key={destination._id || destination.id || destination.name}
                      type="button"
                      onClick={() => handleSuggestionClick(destination)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
                    >
                      <span>{destination.name}</span>
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{destination.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="rounded-[1.25rem] bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Destinations', value: normalizedDestinations.length, icon: MapPin },
          { label: 'Countries', value: countryCount, icon: Compass },
          { label: 'Saved Places', value: savedPlaces.length, icon: Heart },
          { label: 'AI Recommendations', value: aiRecommendationCards.length, icon: Sparkles },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40 transition hover:-translate-y-1 hover:shadow-xl">
              <Icon className="h-6 w-6 text-orange-500" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
              <p className="mt-1 text-3xl font-black text-slate-950">{stat.value}</p>
            </article>
          );
        })}
      </section>

      <section className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleShowAllDestinations}
          className={`rounded-full px-5 py-2.5 text-sm font-black transition ${!showWishlist ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-600 ring-1 ring-orange-100 hover:bg-orange-50'}`}
        >
          All destinations
        </button>
        <button
          type="button"
          onClick={handleShowWishlist}
          className={`rounded-full px-5 py-2.5 text-sm font-black transition ${showWishlist ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-600 ring-1 ring-orange-100 hover:bg-orange-50'}`}
        >
          Wishlist ({savedPlaces.length})
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-black transition ${
              activeCategory === category ? 'bg-slate-950 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-600 ring-1 ring-orange-100 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            {category}
          </button>
        ))}
      </section>

      {featuredDestination && (
        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="group relative min-h-96 overflow-hidden rounded-[2rem] shadow-2xl shadow-orange-100">
            <img src={featuredDestination.imageUrl} alt={featuredDestination.name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">Featured destination</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{featuredDestination.name}</h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/80">{featuredDestination.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {featuredDestination.tags?.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white backdrop-blur">{tag}</span>
                ))}
              </div>
              <button type="button" onClick={() => planTrip(featuredDestination)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600">
                Generate AI Trip
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>

          <div className="grid gap-4">
            {aiRecommendationCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${card.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-950">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.subtitle}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {isLoading && !showWishlist && <p className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-600 shadow-soft">Loading destinations...</p>}
      {savedPlacesLoading && showWishlist && <p className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-600 shadow-soft">Loading saved places...</p>}
      {error && !showWishlist && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}
      {savedPlacesError && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{savedPlacesError}</p>}
      {success && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{success}</p>}

      {!isLoading && visibleDestinations.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-orange-200 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-10 text-center shadow-lg shadow-orange-100/40">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-white text-orange-500 shadow-xl shadow-orange-100">
            <Compass className="h-10 w-10" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-950">No destinations found</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Try another search, switch category, or clear filters to start fresh.</p>
          <button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600">
            Clear filters
          </button>
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleDestinations.map((destination) => {
          const isFavorite = favoriteNames.has(destination.name) || favoriteDestinationIds.has(destination.id || destination._id);
          return (
            <article key={destination._id || destination.name} className="group overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-xl shadow-orange-100/40 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-100/70">
              <div className="relative h-64 overflow-hidden">
                <img src={destination.imageUrl} alt={`${destination.name}, ${destination.country}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/10" />
                <button
                  type="button"
                  onClick={() => toggleWishlist(destination)}
                  className={`absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full shadow-lg backdrop-blur transition ${isFavorite ? 'bg-orange-500 text-white' : 'bg-white/90 text-orange-500 hover:bg-orange-50'}`}
                  aria-pressed={isFavorite}
                  aria-label={`${isFavorite ? 'Remove' : 'Save'} ${destination.name}`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white shadow-lg">{destination.category}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-800 backdrop-blur">
                    <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                    {destination.rating}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950 group-hover:text-orange-600">{destination.name}</h2>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-500"><MapPin className="h-4 w-4 text-orange-500" /> {destination.country}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black capitalize text-emerald-700">{destination.budgetLevel}</span>
                </div>

                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{destination.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-orange-50 p-3">
                    <CalendarDays className="h-4 w-4 text-orange-500" />
                    <p className="mt-2 font-black text-slate-800">Best time</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{destination.bestTimeToVisit}</p>
                  </div>
                  <div className="rounded-2xl bg-teal-50 p-3">
                    <Wallet className="h-4 w-4 text-teal-600" />
                    <p className="mt-2 font-black text-slate-800">Budget</p>
                    <p className="mt-1 text-xs font-semibold capitalize text-slate-500">{destination.costLevel}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {destination.tags?.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">{tag}</span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={() => planTrip(destination)} className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-black text-white transition hover:bg-orange-600">
                    Plan Trip
                    <Plane className="h-4 w-4" />
                  </button>
                  <Link to={`/destinations/${destination.id || destination._id}`} state={{ destination }} className="inline-flex items-center gap-2 rounded-full border border-orange-100 px-5 py-2.5 text-sm font-black text-orange-600 transition hover:bg-orange-50">
                    View Details
                    <Eye className="h-4 w-4" />
                  </Link>
                  {showWishlist && (
                    <button type="button" onClick={() => handleRemoveWishlist(destination)} className="rounded-full border border-rose-200 px-5 py-2.5 text-sm font-black text-rose-700 transition hover:bg-rose-50">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );
}

export default DestinationsPage;
