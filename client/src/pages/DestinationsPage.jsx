import { useDestinations } from '../hooks/useDestinations.js';

function DestinationsPage() {
  const { destinations, isLoading, error } = useDestinations();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Destination data</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-950">Destination Discovery</h1>
      <p className="mt-3 text-slate-600">
        Read-only destination records are available for future trip planning. AI recommendations come later.
      </p>

      {isLoading && <p className="mt-6 text-slate-600">Loading destinations...</p>}
      {error && <p className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {!isLoading && destinations.length === 0 && (
        <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-slate-600">
          No destinations found yet. Destination records can be added later through admin/data tooling.
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
            {destination.description && <p className="mt-4 text-sm leading-6 text-slate-600">{destination.description}</p>}
              {destination.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {destination.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DestinationsPage;
