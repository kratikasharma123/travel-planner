import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChefHat,
  Compass,
  DollarSign,
  Gem,
  HeartHandshake,
  Leaf,
  MapPin,
  Mountain,
  PackageCheck,
  Plane,
  Sparkles,
  Users,
  WandSparkles,
  Wallet,
} from 'lucide-react';
import ChecklistPanel from '../features/travelAssistant/components/ChecklistPanel.jsx';
import DestinationRecommendationCard from '../features/travelAssistant/components/DestinationRecommendationCard.jsx';
import ItineraryDayCard from '../features/travelAssistant/components/ItineraryDayCard.jsx';
import SmartSuggestionCard from '../features/travelAssistant/components/SmartSuggestionCard.jsx';
import WeatherMapPanels from '../features/travelAssistant/components/WeatherMapPanels.jsx';
import { useTripManagement } from '../hooks/useTripManagement.js';
import { useTrips } from '../hooks/useTrips.js';
import { generateDestinationRecommendations, generateSmartSuggestions } from '../services/aiTravelService.js';
import { saveDestinationRecommendations } from '../services/tripManagementService.js';
import { getWeatherSummaryForTrip } from '../services/weatherService.js';
import { currencyFormat } from '../utils/budgetCalculations.js';

const interestOptions = ['Food', 'Hidden gems', 'Nature', 'Culture', 'Adventure', 'Family'];

const aiActionCards = [
  { title: 'Reduce budget', description: 'Find smarter swaps for stays, transport, and paid activities.', icon: DollarSign, tone: 'bg-orange-50 text-orange-600', action: 'reduce-budget' },
  { title: 'Add hidden gems', description: 'Blend local cafes, quiet viewpoints, and authentic culture stops.', icon: Gem, tone: 'bg-amber-50 text-amber-600', action: 'hidden-gems' },
  { title: 'Make family-friendly', description: 'Adjust pace, safety notes, rest breaks, and kid-friendly ideas.', icon: HeartHandshake, tone: 'bg-emerald-50 text-emerald-600', action: 'family-friendly' },
  { title: 'Add food recommendations', description: 'Plan meals around markets, signature dishes, and local favorites.', icon: ChefHat, tone: 'bg-orange-50 text-orange-600', action: 'food-recommendations' },
  { title: 'Add adventure activities', description: 'Add hikes, water sports, scenic routes, and outdoor moments.', icon: Mountain, tone: 'bg-teal-50 text-teal-600', action: 'adventure-activities' },
  { title: 'Create packing list', description: 'Generate essentials based on destination, weather, and trip style.', icon: PackageCheck, tone: 'bg-lime-50 text-lime-700', action: 'packing' },
];

function groupDays(items = []) {
  return [...new Set(items.map((item) => item.dayNumber))].sort((a, b) => a - b);
}

function getDestinationLabel(trip) {
  return trip?.city || trip?.customDestination?.name || trip?.destination?.name || 'Choose destination';
}

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getTripDayCount(trip) {
  if (trip?.durationDays) return Number(trip.durationDays);
  if (!trip?.startDate || !trip?.endDate) return null;

  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function getTripDays(trip) {
  return getTripDayCount(trip) || 'Flexible';
}

function getTimelineDays(items = [], trip) {
  const generatedDays = groupDays(items);
  const tripDayCount = getTripDayCount(trip);
  if (!tripDayCount) return generatedDays;

  const maxDay = Math.max(tripDayCount, generatedDays.at(-1) || 0);
  return Array.from({ length: maxDay }, (_, index) => index + 1);
}

function getAiActionLabel(action) {
  return aiActionCards.find((card) => card.action === action)?.title || 'AI';
}

function compactItineraryItems(items = []) {
  return items.slice(0, 24).map((item) => ({
    dayNumber: item.dayNumber,
    timeBlock: item.timeBlock,
    title: item.title,
    description: item.description?.slice(0, 180) || '',
    locationName: item.locationName || '',
    category: item.category || 'activity',
    estimatedCost: item.estimatedCost || 0,
    sortOrder: item.sortOrder || 0,
  }));
}

function PlannerPage() {
  const inputPanelRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDestination = location.state?.destination;
  const routeTrip = location.state?.trip;
  const { trips, createTrip } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState('');
  const [weather, setWeather] = useState(null);
  const [plannerDraft, setPlannerDraft] = useState({
    destination: selectedDestination?.name || selectedDestination?.city || routeTrip?.city || routeTrip?.customDestination?.name || '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: 1,
    travelStyle: '',
    notes: '',
  });
  const [selectedInterests, setSelectedInterests] = useState(['Hidden gems', 'Food']);
  const [activeAiAction, setActiveAiAction] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmittingTrip, setIsSubmittingTrip] = useState(false);
  const {

    itineraryItems,
    checklists,
    locations,
    recommendations,
    refreshTripManagement,
    createGeneratedItinerary,
    seedPackingChecklist,
    toggleChecklistItem,
    setRecommendations,
    locationsCrud,
    isLoading,
    error,
  } = useTripManagement();
  const selectedTrip = trips.find((trip) => trip._id === selectedTripId) || trips[0];
  const smartSuggestions = useMemo(() => generateSmartSuggestions({ trip: selectedTrip, weather }), [selectedTrip, weather]);
  const days = getTimelineDays(itineraryItems, selectedTrip);
  const tripDays = getTripDays(selectedTrip);
  const aiScore = selectedTrip ? Math.min(98, 78 + days.length * 4 + selectedInterests.length * 2) : 86;

  useEffect(() => {
    if (selectedTrip?._id) {
      refreshTripManagement(selectedTrip._id);
      getWeatherSummaryForTrip(selectedTrip).then(setWeather);
    }
  }, [selectedTrip, refreshTripManagement]);

  function handleDraftChange(event) {
    const { name, value } = event.target;
    setPlannerDraft((current) => ({ ...current, [name]: value }));
  }

  function toggleInterest(interest) {
    setSelectedInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]
    );
  }

  async function handleGenerateItinerary(action = '') {
    const requestedAction = typeof action === 'string' ? action : '';
    setFormError('');
    setSuccess('');

    if (!selectedTrip?._id) {
      setFormError('Save or select a trip before generating an AI itinerary.');
      return;
    }

    const result = await createGeneratedItinerary(selectedTrip, {
      days: getTripDayCount(selectedTrip),
      interests: selectedInterests,
      draft: {
        ...plannerDraft,
        existingItineraryItems: requestedAction ? compactItineraryItems(itineraryItems) : [],
      },
      weather,
      action: requestedAction,
    });

    if (result) {
      const actionLabel = getAiActionLabel(requestedAction);
      setSuccess(requestedAction ? `${actionLabel} applied. A fresh improved itinerary is now shown below.` : 'AI itinerary generated and saved successfully.');
    }
  }

  async function handleRecommendations() {
    setFormError('');
    setSuccess('');

    try {
      const generated = await generateDestinationRecommendations({
        budget: selectedTrip?.budget || plannerDraft.budget,
        interests: selectedTrip?.interests?.length ? selectedTrip.interests : selectedInterests,
        season: selectedTrip?.startDate || plannerDraft.startDate,
      });

      setRecommendations(generated);

      if (selectedTrip?._id && generated.length) {
        const saved = await saveDestinationRecommendations(generated, selectedTrip._id);
        setRecommendations(saved.recommendations);
        setSuccess('Destination recommendations generated and saved.');
        return;
      }

      setSuccess('Destination recommendations generated. Select a saved trip to store them.');
    } catch (apiError) {
      setFormError(apiError?.response?.data?.message || apiError?.message || 'Unable to generate recommendations.');
    }
  }

  async function handleAiAction(action) {
    setFormError('');
    setSuccess('');
    setActiveAiAction(action);

    if (action === 'packing') {
      if (!selectedTrip?._id) {
        setFormError('Save or select a trip before generating a packing list.');
        setActiveAiAction('');
        return;
      }

      try {
        await seedPackingChecklist(selectedTrip);
        setSuccess('Packing checklist generated.');
      } catch (apiError) {
        setFormError(apiError?.response?.data?.message || apiError?.message || 'Unable to generate packing list.');
      } finally {
        setActiveAiAction('');
      }
      return;
    }

    try {
      await handleGenerateItinerary(action);
    } finally {
      setActiveAiAction('');
    }
  }

  async function handleSaveTrip() {
    setFormError('');
    setSuccess('');

    if (!plannerDraft.destination.trim()) {
      setFormError('Destination is required.');
      return;
    }

    setIsSubmittingTrip(true);

    try {
      const trip = await createTrip({
        title: `${plannerDraft.destination.trim()} trip`,
        destinationId: isUuid(selectedDestination?.id || selectedDestination?._id) ? (selectedDestination.id || selectedDestination._id) : null,
        customDestination: {
          name: plannerDraft.destination.trim(),
          country: selectedDestination?.country || '',
        },
        city: plannerDraft.destination.trim(),
        country: selectedDestination?.country || '',
        startDate: plannerDraft.startDate || null,
        endDate: plannerDraft.endDate || null,
        budget: Number(plannerDraft.budget || 0),
        travelerCount: Number(plannerDraft.travelers || 1),
        travelStyle: plannerDraft.travelStyle,
        interests: selectedInterests,
        notes: plannerDraft.notes,
        status: 'saved',
      });
      setSuccess('Trip saved successfully. Redirecting to My Trips...');
      setTimeout(() => navigate('/my-trips', { state: { trip, success: 'Trip saved successfully.' } }), 800);
    } catch (apiError) {
      setFormError(apiError?.response?.data?.message || apiError?.message || 'Unable to save trip.');
    } finally {
      setIsSubmittingTrip(false);
    }
  }

  async function handleSaveMapLocation(location) {
    if (!selectedTrip?._id) {
      setFormError('Save or select a trip before saving map locations.');
      return;
    }

    setFormError('');
    setSuccess('');
    try {
      await locationsCrud.create({
        ...location,
        tripId: selectedTrip._id,
      });
      await refreshTripManagement(selectedTrip._id);
      setSuccess('Map location saved to this trip.');
    } catch (apiError) {
      setFormError(apiError?.response?.data?.message || apiError?.message || 'Unable to save map location.');
    }
  }

  function scrollToPreferences() {
    inputPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section className="relative grid gap-6 overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-72 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />

      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 p-6 shadow-2xl shadow-orange-100 sm:p-8 lg:p-10">
        <img
          src="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=1800&q=90"
          alt="Airplane and hot air balloon AI trip planning background"
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-orange-950/45 to-orange-400/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(251,146,60,0.35),transparent_30%),radial-gradient(circle_at_86%_76%,rgba(16,185,129,0.24),transparent_28%)]" />
        <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute bottom-8 right-10 hidden rotate-6 rounded-[2rem] bg-white/50 p-5 shadow-xl backdrop-blur md:block">
          <Plane className="h-9 w-9 text-orange-500" />
          <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-orange-600">Smart route</p>
        </div>
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-100 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              AI travel planner
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
              Plan your perfect trip with AI
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/85 sm:text-lg">
              Build weather-aware routes, day-wise itineraries, local gems, packing essentials, and budget-friendly travel ideas from one premium planning cockpit.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!selectedTrip || isLoading}
                onClick={handleGenerateItinerary}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-orange-300/40 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <WandSparkles className="h-4 w-4" />
                Generate AI Trip
              </button>
              <button
                type="button"
                onClick={scrollToPreferences}
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-6 py-3 text-sm font-black text-slate-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
              >
                <Compass className="h-4 w-4 text-orange-500" />
                Tune preferences
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Days', value: tripDays, icon: CalendarDays },
              { label: 'Budget', value: selectedTrip?.budget ? currencyFormat(selectedTrip.budget) : plannerDraft.budget || 'Flexible', icon: Wallet },
              { label: 'Travelers', value: selectedTrip?.travelerCount || plannerDraft.travelers || 1, icon: Users },
              { label: 'AI Score', value: `${aiScore}%`, icon: Sparkles },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-lg shadow-orange-100/40 backdrop-blur transition hover:-translate-y-1 hover:bg-white">
                  <Icon className="h-5 w-5 text-orange-500" />
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-xl font-black text-slate-950">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={inputPanelRef} className="relative rounded-[2rem] border border-orange-100 bg-white/90 p-5 shadow-xl shadow-orange-100/50 backdrop-blur sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Trip input</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Shape your AI brief</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Add a few trip details here for a richer planning experience, then generate with your selected saved trip.</p>
          </div>
          <select value={selectedTripId || selectedTrip?._id || ''} onChange={(event) => setSelectedTripId(event.target.value)} className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-100">
            {trips.map((trip) => <option key={trip._id} value={trip._id}>{trip.title}</option>)}
          </select>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <label className="grid gap-2 text-sm font-bold text-slate-700 lg:col-span-2">
            Destination
            <input name="destination" value={plannerDraft.destination} onChange={handleDraftChange} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder={getDestinationLabel(selectedTrip)} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Start date
            <input type="date" name="startDate" value={plannerDraft.startDate} onChange={handleDraftChange} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            End date
            <input type="date" name="endDate" value={plannerDraft.endDate} onChange={handleDraftChange} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Budget
            <input name="budget" value={plannerDraft.budget} onChange={handleDraftChange} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder={selectedTrip?.budget ? currencyFormat(selectedTrip.budget) : '$2,000'} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Travelers
            <input type="number" min="1" name="travelers" value={plannerDraft.travelers} onChange={handleDraftChange} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 lg:col-span-2">
            Travel style
            <select name="travelStyle" value={plannerDraft.travelStyle} onChange={handleDraftChange} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100">
              <option value="">Choose a style</option>
              <option value="relaxed">Relaxed</option>
              <option value="adventure">Adventure</option>
              <option value="family">Family-friendly</option>
              <option value="luxury">Luxury comfort</option>
              <option value="culture">Culture-first</option>
            </select>
          </label>
          <div className="lg:col-span-4">
            <p className="text-sm font-bold text-slate-700">Interests</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-4 py-2 text-sm font-black transition ${
                    selectedInterests.includes(interest) ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          <label className="grid gap-2 text-sm font-bold text-slate-700 lg:col-span-4">
            Special notes
            <textarea name="notes" value={plannerDraft.notes} onChange={handleDraftChange} rows="3" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="Slow mornings, vegetarian food, wheelchair access, toddler-friendly stops..." />
          </label>
        </div>
        <button type="button" disabled={isSubmittingTrip} onClick={handleSaveTrip} className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
          <Sparkles className="h-4 w-4" />
          {isSubmittingTrip ? 'Saving trip...' : 'Save Trip'}
        </button>
      </section>

      {(error || formError || success) && (
        <div className="grid gap-3">
          {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}
          {formError && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{formError}</p>}
          {success && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{success}</p>}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
        <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">AI itinerary</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Day-wise travel timeline</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Your route, activities, rest windows, and local moments organized into a clean AI timeline.</p>
            </div>
            <button type="button" disabled={!selectedTrip || isLoading} onClick={handleGenerateItinerary} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60">
              <WandSparkles className="h-4 w-4" />
              Generate / Regenerate
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            {days.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-orange-200 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-8 text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-white text-orange-500 shadow-xl shadow-orange-100">
                  <Compass className="h-10 w-10" />
                </div>
                <h3 className="mt-5 text-2xl font-black text-slate-950">No itinerary generated yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Fill your trip details and let AI create your day-by-day plan.</p>
                <button type="button" disabled={!selectedTrip || isLoading} onClick={handleGenerateItinerary} className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
                  <MapPin className="h-4 w-4" />
                  Create itinerary
                </button>
              </div>
            )}
            {days.map((day) => <ItineraryDayCard key={day} dayNumber={day} items={itineraryItems.filter((item) => item.dayNumber === day)} />)}
          </div>
        </section>

        <aside className="grid content-start gap-6">
          <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-xl shadow-orange-100/40">
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-orange-900 p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">Trip context</p>
              <h2 className="mt-2 text-3xl font-black">{selectedTrip?.title || 'No trip selected'}</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">AI uses these details to personalize pacing, costs, activities, and essentials.</p>
            </div>
            <div className="grid gap-3 p-5 text-sm">
              {[
                { label: 'Destination', value: `${getDestinationLabel(selectedTrip)}${selectedTrip?.country || selectedTrip?.customDestination?.country ? `, ${selectedTrip.country || selectedTrip.customDestination?.country}` : ''}`, icon: MapPin },
                { label: 'Dates', value: `${selectedTrip?.startDate || 'Flexible'} → ${selectedTrip?.endDate || 'Flexible'}`, icon: CalendarDays },
                { label: 'Travel style', value: selectedTrip?.travelStyle || plannerDraft.travelStyle || 'Not set', icon: Leaf },
                { label: 'Budget', value: selectedTrip?.budget ? currencyFormat(selectedTrip.budget) : plannerDraft.budget || 'Not set', icon: Wallet },
                { label: 'Travelers', value: selectedTrip?.travelerCount || plannerDraft.travelers || 'Not set', icon: Users },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-orange-50/70 p-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-orange-500 shadow-sm"><Icon className="h-5 w-5" /></span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                      <p className="mt-0.5 font-black text-slate-800">{item.value}</p>
                    </div>
                  </div>
                );
              })}
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Interests</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selectedTrip?.interests?.length ? selectedTrip.interests : selectedInterests).map((interest) => (
                    <span key={interest} className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">{interest}</span>
                  ))}
                </div>
              </div>
              <button type="button" onClick={scrollToPreferences} className="mt-2 rounded-full border border-orange-100 px-5 py-3 text-sm font-black text-orange-600 transition hover:bg-orange-50">
                Edit Preferences
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-5 shadow-xl shadow-orange-100/40">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">AI actions</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Improve this plan</h2>
            <div className="mt-5 grid gap-3">
              {aiActionCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button key={card.title} type="button" disabled={isLoading || Boolean(activeAiAction)} onClick={() => handleAiAction(card.action)} className="group flex items-start gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-orange-50 transition hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${card.tone}`}>
                      {activeAiAction === card.action ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current/30 border-t-current" /> : <Icon className="h-5 w-5" />}
                    </span>
                    <span>
                      <span className="font-black text-slate-950 group-hover:text-orange-600">{activeAiAction === card.action ? 'Improving...' : card.title}</span>
                      <span className="mt-1 block text-sm leading-5 text-slate-600">{card.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      <ChecklistPanel items={checklists} onSeed={() => handleAiAction('packing')} onToggleItem={toggleChecklistItem} />

      <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Destination recommendations</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">AI-inspired places</h2>
          </div>
          <button type="button" onClick={handleRecommendations} className="rounded-full border border-orange-100 px-5 py-3 text-sm font-black text-orange-600 transition hover:bg-orange-50">Generate recommendations</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {recommendations.map((recommendation) => <DestinationRecommendationCard key={recommendation.destinationName} recommendation={recommendation} />)}
          {recommendations.length === 0 && <p className="rounded-2xl bg-orange-50 p-5 text-slate-600 md:col-span-3">Generate recommendations based on budget, season, interests, and duration.</p>}
        </div>
      </section>

      <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Smart suggestions</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Optimization tips</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">{smartSuggestions.map((suggestion) => <SmartSuggestionCard key={suggestion.title} suggestion={suggestion} />)}</div>
      </section>

      <WeatherMapPanels
        weather={weather}
        locations={locations}
        selectedTrip={selectedTrip}
        onSaveLocation={handleSaveMapLocation}
      />
    </section>
  );
}

export default PlannerPage;
