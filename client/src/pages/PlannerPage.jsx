import { useEffect, useMemo, useState } from 'react';
import ChecklistPanel from '../features/travelAssistant/components/ChecklistPanel.jsx';
import DestinationRecommendationCard from '../features/travelAssistant/components/DestinationRecommendationCard.jsx';
import ItineraryDayCard from '../features/travelAssistant/components/ItineraryDayCard.jsx';
import SmartSuggestionCard from '../features/travelAssistant/components/SmartSuggestionCard.jsx';
import WeatherMapPanels from '../features/travelAssistant/components/WeatherMapPanels.jsx';
import { useTripManagement } from '../hooks/useTripManagement.js';
import { useTrips } from '../hooks/useTrips.js';
import { generateDestinationRecommendations, generateSmartSuggestions } from '../services/aiTravelService.js';
import { getWeatherSummaryForTrip } from '../services/weatherService.js';

function groupDays(items = []) {
  return [...new Set(items.map((item) => item.dayNumber))].sort((a, b) => a - b);
}

function PlannerPage() {
  const { trips } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState('');
  const [weather, setWeather] = useState(null);
  const { itineraryItems, checklists, locations, recommendations, refreshTripManagement, createGeneratedItinerary, seedPackingChecklist, setRecommendations, isLoading, error } = useTripManagement();
  const selectedTrip = trips.find((trip) => trip._id === selectedTripId) || trips[0];
  const smartSuggestions = useMemo(() => generateSmartSuggestions({ trip: selectedTrip, weather }), [selectedTrip, weather]);
  const days = groupDays(itineraryItems);

  useEffect(() => {
    if (selectedTrip?._id) {
      refreshTripManagement(selectedTrip._id);
      getWeatherSummaryForTrip(selectedTrip).then(setWeather);
    }
  }, [selectedTrip, refreshTripManagement]);

  function handleRecommendations() {
    setRecommendations(generateDestinationRecommendations({ budget: selectedTrip?.budget || 2000, interests: selectedTrip?.interests || [] }));
  }

  return (
    <section className="page-stack">
      <div className="app-card">
        <p className="section-eyebrow">AI Trip Planner</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Generate itineraries and manage trip plans</h1>
            <p className="section-description">Build day-by-day plans, destination ideas, packing lists, weather summaries, maps, and smart travel suggestions.</p>
          </div>
          <select value={selectedTripId || selectedTrip?._id || ''} onChange={(event) => setSelectedTripId(event.target.value)} className="form-control">
            {trips.map((trip) => <option key={trip._id} value={trip._id}>{trip.title}</option>)}
          </select>
        </div>
        {error && <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="app-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="section-eyebrow">AI itinerary</p><h2 className="section-title">Day-by-day plan</h2></div>
            <button type="button" disabled={!selectedTrip || isLoading} onClick={() => createGeneratedItinerary(selectedTrip)} className="btn-primary">Generate / Regenerate</button>
          </div>
          <div className="mt-5 grid gap-4">
            {days.length === 0 && <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">Select a trip and generate an itinerary.</p>}
            {days.map((day) => <ItineraryDayCard key={day} dayNumber={day} items={itineraryItems.filter((item) => item.dayNumber === day)} />)}
          </div>
        </section>

        <section className="app-card">
          <p className="section-eyebrow">Trip context</p>
          <h2 className="section-title">{selectedTrip?.title || 'No trip selected'}</h2>
          <div className="mt-5 grid gap-3 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-950">Destination:</span> {selectedTrip?.city || selectedTrip?.customDestination?.name || 'Not set'}, {selectedTrip?.country || selectedTrip?.customDestination?.country || ''}</p>
            <p><span className="font-semibold text-slate-950">Dates:</span> {selectedTrip?.startDate || 'Flexible'} → {selectedTrip?.endDate || 'Flexible'}</p>
            <p><span className="font-semibold text-slate-950">Style:</span> {selectedTrip?.travelStyle || 'Not set'}</p>
            <p><span className="font-semibold text-slate-950">Budget:</span> {selectedTrip?.budget || 'Not set'}</p>
          </div>
        </section>
      </div>

      <ChecklistPanel items={checklists} onSeed={() => selectedTrip && seedPackingChecklist(selectedTrip)} />

      <section className="app-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="section-eyebrow">Destination recommendations</p><h2 className="section-title">AI-inspired places</h2></div>
          <button type="button" onClick={handleRecommendations} className="btn-secondary">Generate recommendations</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {recommendations.map((recommendation) => <DestinationRecommendationCard key={recommendation.destinationName} recommendation={recommendation} />)}
          {recommendations.length === 0 && <p className="rounded-2xl bg-slate-50 p-5 text-slate-600 md:col-span-3">Generate recommendations based on budget, season, interests, and duration.</p>}
        </div>
      </section>

      <section className="app-card">
        <p className="section-eyebrow">Smart suggestions</p>
        <h2 className="section-title">Optimization tips</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">{smartSuggestions.map((suggestion) => <SmartSuggestionCard key={suggestion.title} suggestion={suggestion} />)}</div>
      </section>

      <WeatherMapPanels weather={weather} locations={locations} />
    </section>
  );
}

export default PlannerPage;
