import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDestinations } from '../hooks/useDestinations.js';

const initialFilters = {
  search: '',
  country: '',
  region: '',
  costLevel: '',
  tag: '',
};

function DestinationsPage() {
  const { destinations, isLoading, error, refreshDestinations } = useDestinations();
  const [filters, setFilters] = useState(initialFilters);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function handleApplyFilters(event) {
    event.preventDefault();
    await refreshDestinations(filters);
  }

  async function handleResetFilters() {
    setFilters(initialFilters);
    await refreshDestinations();
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Destination data</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-950">Destination Discovery</h1>
      <p className="mt-3 text-slate-600">
        Browse seeded destination records, filter by travel interests, and use them as inspiration for your next trip.
      </p>

      <form className="mt-6 grid gap-3 lg:grid-cols-6" onSubmit={handleApplyFilters}>
        <input
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 lg:col-span-2"
          placeholder="Search destination"
        />
        <input
          name="country"
          value={filters.country}
          onChange={handleFilterChange}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          placeholder="Country"
        />
        <input
          name="region"
          value={filters.region}
          onChange={handleFilterChange}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          placeholder="Region"
        />
        <select
          name="costLevel"
          value={filters.costLevel}
          onChange={handleFilterChange}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
        >
          <option value="">Any budget</option>
          <option value="budget">Budget</option>
          <option value="mid-range">Mid-range</option>
          <option value="luxury">Luxury</option>
        </select>
        <input
          name="tag"
          value={filters.tag}
          onChange={handleFilterChange}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          placeholder="Tag"
        />
        <div className="flex gap-2 lg:col-span-6">
          <button type="submit" className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600">
            Apply filters
          </button>
          <button type="button" onClick={handleResetFilters} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Reset
          </button>
        </div>
      </form>

      {isLoading && <p className="mt-6 text-slate-600">Loading destinations...</p>}
      {error && <p className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {!isLoading && destinations.length === 0 && (
        <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-slate-600">
          No destinations found. Try changing filters or run the Supabase seed file.
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {destinations.map((destination) => (
          <article key={destination._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {destination.imageUrl && (
              <img
                src={destination.imageUrl}
                alt={`${destination.name}, ${destination.country}`}
                className="h-44 w-full object-cover"
                loading="lazy"
              />
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-950">{destination.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {destination.country} {destination.region ? `• ${destination.region}` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {destination.costLevel}
                </span>
              </div>

              {destination.bestTimeToVisit && (
                <p className="mt-4 rounded-2xl bg-white p-3 text-sm font-medium text-slate-700">
                  Best time: {destination.bestTimeToVisit}
                </p>
              )}
              {destination.description && <p className="mt-4 text-sm leading-6 text-slate-600">{destination.description}</p>}
              {destination.popularAttractions?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Top attractions</p>
                  <p className="mt-2 text-sm text-slate-600">{destination.popularAttractions.slice(0, 4).join(' • ')}</p>
                </div>
              )}
              {destination.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {destination.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {(destination.safetyNotes || destination.familySuitabilityNotes) && (
                <details className="mt-4 rounded-2xl bg-white p-3 text-sm text-slate-600">
                  <summary className="cursor-pointer font-semibold text-slate-800">Safety & family notes</summary>
                  {destination.safetyNotes && <p className="mt-2">{destination.safetyNotes}</p>}
                  {destination.familySuitabilityNotes && <p className="mt-2">{destination.familySuitabilityNotes}</p>}
                </details>
              )}
              <Link
                to="/my-trips"
                className="mt-5 inline-flex rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
              >
                Plan a trip
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DestinationsPage;
