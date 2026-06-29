import { useState } from 'react';
import { useSavedTrips } from '../hooks/useSavedTrips.js';
import { useTrips } from '../hooks/useTrips.js';

const initialForm = {
  title: '',
  destinationName: '',
  destinationCountry: '',
  travelerCount: 1,
  travelStyle: '',
  status: 'draft',
};

function MyTripsPage() {
  const { trips, isLoading, error, createTrip, archiveTrip } = useTrips();
  const { saveTrip } = useSavedTrips();
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleCreateTrip(event) {
    event.preventDefault();
    setFormError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await createTrip({
        title: formData.title,
        customDestination: {
          name: formData.destinationName,
          country: formData.destinationCountry,
        },
        travelerCount: Number(formData.travelerCount),
        travelStyle: formData.travelStyle,
        status: formData.status,
      });
      setFormData(initialForm);
      setSuccess('Trip created successfully.');
    } catch (apiError) {
      setFormError(apiError?.response?.data?.message || 'Unable to create trip.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchiveTrip(tripId) {
    setFormError('');
    setSuccess('');

    try {
      await archiveTrip(tripId);
      setSuccess('Trip archived successfully.');
    } catch (apiError) {
      setFormError(apiError?.response?.data?.message || 'Unable to archive trip.');
    }
  }

  async function handleSaveTrip(trip) {
    setFormError('');
    setSuccess('');

    try {
      await saveTrip({ tripId: trip._id, savedTitle: trip.title });
      setSuccess('Trip saved successfully.');
    } catch (apiError) {
      setFormError(apiError?.response?.data?.message || 'Unable to save trip.');
    }
  }

  return (
    <section className="grid gap-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Trip data layer</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-950">My Trips</h1>
        <p className="mt-3 text-slate-600">
          Create and manage user-owned trips. AI itinerary generation is planned for Milestone 5.
        </p>

        {formError && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{formError}</p>}
        {success && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}

        <form className="mt-6 grid gap-4 lg:grid-cols-3" onSubmit={handleCreateTrip}>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            minLength={2}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="Trip title"
          />
          <input
            name="destinationName"
            value={formData.destinationName}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="Destination city"
          />
          <input
            name="destinationCountry"
            value={formData.destinationCountry}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="Country"
          />
          <input
            type="number"
            name="travelerCount"
            min="1"
            max="50"
            value={formData.travelerCount}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
          <input
            name="travelStyle"
            value={formData.travelStyle}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="Travel style"
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          >
            <option value="draft">Draft</option>
            <option value="saved">Saved</option>
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-primary-500 px-6 py-3 font-semibold text-white hover:bg-primary-600 disabled:opacity-70 lg:col-span-3"
          >
            {isSubmitting ? 'Creating...' : 'Create Trip'}
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950">Your trip records</h2>
        {isLoading && <p className="mt-4 text-slate-600">Loading trips...</p>}
        {error && <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
        {!isLoading && trips.length === 0 && <p className="mt-4 text-slate-600">No trips yet. Create your first draft above.</p>}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {trips.map((trip) => (
            <article key={trip._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-950">{trip.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {trip.destination?.name || trip.customDestination?.name || 'Custom destination'}
                    {trip.customDestination?.country ? `, ${trip.customDestination.country}` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{trip.status}</span>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Travelers: {trip.travelerCount} {trip.travelStyle ? `• ${trip.travelStyle}` : ''}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveTrip(trip)}
                  className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
                >
                  Save Trip
                </button>
                {trip.status !== 'archived' && (
                  <button
                    type="button"
                    onClick={() => handleArchiveTrip(trip._id)}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                  >
                    Archive
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MyTripsPage;
