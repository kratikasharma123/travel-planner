import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { resolveLocations, searchTravelLocations } from '../../../services/mapService.js';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function isValidCoordinate(location) {
  return Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng));
}

function FitBounds({ locations }) {
  const map = useMap();

  useEffect(() => {
    const markerLocations = locations.filter(isValidCoordinate);
    if (!markerLocations.length) return;
    if (markerLocations.length === 1) {
      map.setView([Number(markerLocations[0].lat), Number(markerLocations[0].lng)], 12);
      return;
    }
    map.fitBounds(markerLocations.map((location) => [Number(location.lat), Number(location.lng)]), { padding: [32, 32] });
  }, [locations, map]);

  return null;
}

function WeatherMapPanels({ weather, locations = [], selectedTrip, onSaveLocation }) {
  const [mapMessage, setMapMessage] = useState('Search and save places to add markers.');
  const [mapLocations, setMapLocations] = useState([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const destination = useMemo(
    () => selectedTrip?.city || selectedTrip?.customDestination?.name || selectedTrip?.destination?.name || selectedTrip?.country || '',
    [selectedTrip]
  );
  const markerLocations = useMemo(() => mapLocations.filter(isValidCoordinate), [mapLocations]);
  const defaultCenter = markerLocations[0]
    ? [Number(markerLocations[0].lat), Number(markerLocations[0].lng)]
    : [20.5937, 78.9629];

  useEffect(() => {
    let isMounted = true;
    resolveLocations(locations).then((resolved) => {
      if (!isMounted) return;
      setMapLocations(resolved);
      setMapMessage(resolved.some(isValidCoordinate) ? '' : 'Search and save places to add markers.');
    });
    return () => {
      isMounted = false;
    };
  }, [locations]);

  async function handleSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setMapMessage('');
    try {
      const results = await searchTravelLocations(query, {
        destination,
        country: selectedTrip?.country || selectedTrip?.customDestination?.country || '',
        locationType: 'attraction',
      });
      setSearchResults(results);
      if (!results.length) setMapMessage('No places found. Try another search.');
    } catch (error) {
      setMapMessage(error?.message || 'Unable to search OpenStreetMap places right now.');
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSave(result) {
    if (!onSaveLocation) return;
    await onSaveLocation({
      ...result,
      tripId: selectedTrip?._id,
      locationType: result.locationType || 'attraction',
      notes: 'Saved from OpenStreetMap search',
    });
    setSearchResults((current) => current.filter((item) => item.name !== result.name));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/85 p-6 shadow-soft backdrop-blur-xl sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Weather</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">7-day forecast</h2>
          </div>
          {weather?.isFallback && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">Fallback</span>}
        </div>
        {weather?.error && <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-700">{weather.error}</p>}
        <p className="mt-3 text-sm font-bold text-slate-500">{weather?.location || 'Destination'}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Current</p>
            <p className="mt-1 font-black text-slate-950">{weather?.current || 'Fallback weather'}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Temp / feels</p>
            <p className="mt-1 font-black text-slate-950">{weather?.temperature ?? '--'}°C / {weather?.feelsLike ?? '--'}°C</p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Rain / humidity</p>
            <p className="mt-1 font-black text-slate-950">{weather?.rainChance ?? 0}% / {weather?.humidity ?? 0}%</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Wind / air</p>
            <p className="mt-1 font-black text-slate-950">{weather?.windSpeed ?? 0} kph • {weather?.airQuality || 'Good'}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-2">
          {weather?.forecast?.slice(0, 7).map((day) => (
            <div key={day.day} className="flex justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-sm shadow-sm">
              <span className="font-bold text-slate-700">{day.day}</span>
              <span className="text-right text-slate-600">{day.condition} • {day.minTemperature}°/{day.maxTemperature}°C • {day.rainChance}% rain</span>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/85 p-6 shadow-soft backdrop-blur-xl sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Free OpenStreetMap</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Saved locations & route planning</h2>
        <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="form-control flex-1" placeholder={`Search places${destination ? ` near ${destination}` : ''}`} />
          <button type="submit" disabled={isSearching || !selectedTrip?._id} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
        <div className="mt-5 h-80 overflow-hidden rounded-[2rem] border border-orange-100 bg-orange-50">
          <MapContainer center={defaultCenter} zoom={markerLocations.length ? 12 : 4} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds locations={markerLocations} />
            {markerLocations.map((location) => (
              <Marker key={location._id || location.id || `${location.name}-${location.lat}-${location.lng}`} position={[Number(location.lat), Number(location.lng)]} icon={markerIcon}>
                <Popup>
                  <strong>{location.name}</strong>
                  <br />
                  {location.address || location.locationType || 'Saved location'}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        {mapMessage && <p className="mt-3 rounded-2xl bg-orange-50 p-3 text-sm font-bold text-slate-600">{mapMessage}</p>}
        <div className="mt-4 grid gap-2">
          {searchResults.map((result) => (
            <div key={`${result.name}-${result.address}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-sm shadow-sm">
              <span>
                <span className="font-black text-slate-950">{result.name}</span>{' '}
                <span className="text-slate-500">{result.address}</span>
              </span>
              <button type="button" onClick={() => handleSave(result)} className="rounded-full border border-orange-100 px-3 py-1.5 text-xs font-black text-orange-600 hover:bg-orange-50">
                Save
              </button>
            </div>
          ))}
          {mapLocations.slice(0, 5).map((loc) => (
            <div key={loc._id || loc.id || loc.name} className="rounded-2xl border border-slate-100 bg-white p-3 text-sm shadow-sm">
              <span className="font-black text-slate-950">{loc.name}</span>{' '}
              <span className="text-slate-500">{loc.locationType}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default WeatherMapPanels;
