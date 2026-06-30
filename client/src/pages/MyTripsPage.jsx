import { useMemo, useState } from 'react';
import { useSavedTrips } from '../hooks/useSavedTrips.js';
import { useTrips } from '../hooks/useTrips.js';

const initialForm = {
  title: '',
  destinationName: '',
  destinationCountry: '',
  startDate: '',
  endDate: '',
  durationDays: '',
  travelerCount: 1,
  travelStyle: '',
  interests: '',
  notes: '',
  status: 'draft',
};

const initialFilters = {
  search: '',
  status: '',
};

const initialSavedEditForm = {
  savedTitle: '',
  folder: '',
  tags: '',
  notes: '',
};

function tripToForm(trip) {
  return {
    title: trip.title || '',
    destinationName: trip.customDestination?.name || trip.destination?.name || '',
    destinationCountry: trip.customDestination?.country || trip.destination?.country || '',
    startDate: trip.startDate || '',
    endDate: trip.endDate || '',
    durationDays: trip.durationDays || '',
    travelerCount: trip.travelerCount || 1,
    travelStyle: trip.travelStyle || '',
    interests: trip.interests?.join(', ') || '',
    notes: trip.notes || '',
    status: trip.status || 'draft',
  };
}

function createTripPayload(formData) {
  return {
    title: formData.title,
    customDestination: {
      name: formData.destinationName,
      country: formData.destinationCountry,
    },
    startDate: formData.startDate || null,
    endDate: formData.endDate || null,
    durationDays: formData.durationDays ? Number(formData.durationDays) : null,
    travelerCount: Number(formData.travelerCount),
    travelStyle: formData.travelStyle,
    interests: formData.interests
      .split(',')
      .map((interest) => interest.trim())
      .filter(Boolean),
    notes: formData.notes,
    status: formData.status,
  };
}

function createSavedTripPayload(formData) {
  return {
    savedTitle: formData.savedTitle,
    folder: formData.folder,
    tags: formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    notes: formData.notes,
  };
}

function getErrorMessage(apiError, fallback) {
  const message = apiError?.response?.data?.message || apiError?.message || fallback;

  if (apiError?.code === '23505' || message.toLowerCase().includes('duplicate')) {
    return 'This trip is already saved.';
  }

  return message;
}

function MyTripsPage() {
  const { trips, isLoading, error, refreshTrips, createTrip, updateTrip, archiveTrip } = useTrips();
  const {
    savedTrips,
    isLoading: savedTripsLoading,
    error: savedTripsError,
    refreshSavedTrips,
    saveTrip,
    updateSavedTrip,
    removeSavedTrip,
  } = useSavedTrips();
  const [formData, setFormData] = useState(initialForm);
  const [filters, setFilters] = useState(initialFilters);
  const [editingTripId, setEditingTripId] = useState(null);
  const [editingSavedTripId, setEditingSavedTripId] = useState(null);
  const [savedEditForm, setSavedEditForm] = useState(initialSavedEditForm);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTrips = useMemo(() => trips.filter((trip) => trip.status !== 'archived'), [trips]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleSavedEditChange(event) {
    const { name, value } = event.target;
    setSavedEditForm((current) => ({ ...current, [name]: value }));
  }

  async function handleApplyFilters(event) {
    event.preventDefault();
    await refreshTrips(filters);
  }

  async function handleResetFilters() {
    setFilters(initialFilters);
    await refreshTrips();
  }

  function handleEditTrip(trip) {
    setEditingTripId(trip._id);
    setFormData(tripToForm(trip));
    setFormError('');
    setSuccess('');
  }

  function handleCancelEdit() {
    setEditingTripId(null);
    setFormData(initialForm);
    setFormError('');
  }

  async function handleSubmitTrip(event) {
    event.preventDefault();
    setFormError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const payload = createTripPayload(formData);

      if (editingTripId) {
        await updateTrip(editingTripId, payload);
        setSuccess('Trip updated successfully.');
      } else {
        await createTrip(payload);
        setSuccess('Trip created successfully.');
      }

      setEditingTripId(null);
      setFormData(initialForm);
    } catch (apiError) {
      setFormError(getErrorMessage(apiError, editingTripId ? 'Unable to update trip.' : 'Unable to create trip.'));
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
      setFormError(getErrorMessage(apiError, 'Unable to archive trip.'));
    }
  }

  async function handleSaveTrip(trip) {
    setFormError('');
    setSuccess('');

    try {
      await saveTrip({ tripId: trip._id, savedTitle: trip.title });
      setSuccess('Trip saved successfully.');
    } catch (apiError) {
      setFormError(getErrorMessage(apiError, 'Unable to save trip.'));
    }
  }

  function handleEditSavedTrip(savedTrip) {
    setEditingSavedTripId(savedTrip._id);
    setSavedEditForm({
      savedTitle: savedTrip.savedTitle || savedTrip.trip?.title || '',
      folder: savedTrip.folder || '',
      tags: savedTrip.tags?.join(', ') || '',
      notes: savedTrip.notes || '',
    });
    setFormError('');
    setSuccess('');
  }

  function handleCancelSavedEdit() {
    setEditingSavedTripId(null);
    setSavedEditForm(initialSavedEditForm);
  }

  async function handleUpdateSavedTrip(event) {
    event.preventDefault();
    if (!editingSavedTripId) return;

    setFormError('');
    setSuccess('');

    try {
      await updateSavedTrip(editingSavedTripId, createSavedTripPayload(savedEditForm));
      setEditingSavedTripId(null);
      setSavedEditForm(initialSavedEditForm);
      setSuccess('Saved trip updated successfully.');
    } catch (apiError) {
      setFormError(getErrorMessage(apiError, 'Unable to update saved trip.'));
    }
  }

  async function handleRemoveSavedTrip(savedTripId) {
    setFormError('');
    setSuccess('');

    try {
      await removeSavedTrip(savedTripId);
      setSuccess('Saved trip removed successfully.');
    } catch (apiError) {
      setFormError(getErrorMessage(apiError, 'Unable to remove saved trip.'));
    }
  }

  return (
    <section className="page-stack">
      <div className="app-card">
        <p className="section-eyebrow">Trip data layer</p>
        <h1 className="section-title">My Trips</h1>
        <p className="section-description">
          Create, edit, archive, and save user-owned trips. AI itinerary generation is planned for Milestone 5.
        </p>

        {formError && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{formError}</p>}
        {success && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}

        <form className="mt-5 grid gap-4 lg:grid-cols-3" onSubmit={handleSubmitTrip}>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            minLength={2}
            className="form-control"
            placeholder="Trip title"
          />
          <input
            name="destinationName"
            value={formData.destinationName}
            onChange={handleChange}
            className="form-control"
            placeholder="Destination city"
          />
          <input
            name="destinationCountry"
            value={formData.destinationCountry}
            onChange={handleChange}
            className="form-control"
            placeholder="Country"
          />
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="form-control"
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="form-control"
          />
          <input
            type="number"
            name="durationDays"
            min="1"
            max="365"
            value={formData.durationDays}
            onChange={handleChange}
            className="form-control"
            placeholder="Duration days"
          />
          <input
            type="number"
            name="travelerCount"
            min="1"
            max="50"
            value={formData.travelerCount}
            onChange={handleChange}
            className="form-control"
          />
          <input
            name="travelStyle"
            value={formData.travelStyle}
            onChange={handleChange}
            className="form-control"
            placeholder="Travel style"
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-control"
          >
            <option value="draft">Draft</option>
            <option value="saved">Saved</option>
            <option value="archived">Archived</option>
          </select>
          <input
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            className="form-control lg:col-span-2"
            placeholder="Interests, comma-separated"
          />
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="form-control lg:col-span-3"
            placeholder="Trip notes"
          />
          <div className="flex flex-wrap gap-3 lg:col-span-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : editingTripId ? 'Update Trip' : 'Create Trip'}
            </button>
            {editingTripId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-secondary"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="app-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Your trip records</h2>
            <p className="mt-2 text-sm text-slate-600">{activeTrips.length} active trips • {trips.length} total records</p>
          </div>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto]" onSubmit={handleApplyFilters}>
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Search trips"
            />
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="saved">Saved</option>
              <option value="archived">Archived</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Filter
              </button>
              <button type="button" onClick={handleResetFilters} className="btn-secondary">
                Reset
              </button>
            </div>
          </form>
        </div>

        {isLoading && <p className="mt-4 text-slate-600">Loading trips...</p>}
        {error && <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
        {!isLoading && trips.length === 0 && <p className="mt-4 text-slate-600">No trips found. Create your first draft above.</p>}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {trips.map((trip) => (
            <article key={trip._id} className="app-card-compact">
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
              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p>Travelers: {trip.travelerCount}</p>
                <p>{trip.travelStyle || 'No style set'}</p>
                <p>{trip.startDate || 'No start date'} {trip.endDate ? `→ ${trip.endDate}` : ''}</p>
                <p>{trip.durationDays ? `${trip.durationDays} days` : 'Flexible duration'}</p>
              </div>
              {trip.interests?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {trip.interests.map((interest) => (
                    <span key={interest} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
              {trip.notes && <p className="mt-4 text-sm leading-6 text-slate-600">{trip.notes}</p>}
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleEditTrip(trip)}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveTrip(trip)}
                  className="btn-primary"
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

      <div className="app-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-eyebrow">Saved trips</p>
            <h2 className="section-title">Saved trip library</h2>
            <p className="mt-2 text-slate-600">Organize saved trips with folders, notes, and tags.</p>
          </div>
          <button
            type="button"
            onClick={() => refreshSavedTrips()}
            className="btn-secondary"
          >
            Refresh
          </button>
        </div>

        {savedTripsLoading && <p className="mt-4 text-slate-600">Loading saved trips...</p>}
        {savedTripsError && <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{savedTripsError}</p>}
        {!savedTripsLoading && savedTrips.length === 0 && <p className="mt-4 text-slate-600">No saved trips yet. Save a trip from the records above.</p>}

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {savedTrips.map((savedTrip) => (
            <article key={savedTrip._id} className="app-card-compact">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-950">{savedTrip.savedTitle || savedTrip.trip?.title || 'Saved trip'}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {savedTrip.trip?.customDestination?.name || savedTrip.trip?.destination?.name || 'Destination not set'}
                    {savedTrip.folder ? ` • ${savedTrip.folder}` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {savedTrip.savedAt ? new Date(savedTrip.savedAt).toLocaleDateString() : 'Saved'}
                </span>
              </div>

              {editingSavedTripId === savedTrip._id ? (
                <form className="mt-4 grid gap-3" onSubmit={handleUpdateSavedTrip}>
                  <input
                    name="savedTitle"
                    value={savedEditForm.savedTitle}
                    onChange={handleSavedEditChange}
                    className="form-control"
                    placeholder="Saved title"
                  />
                  <input
                    name="folder"
                    value={savedEditForm.folder}
                    onChange={handleSavedEditChange}
                    className="form-control"
                    placeholder="Folder"
                  />
                  <input
                    name="tags"
                    value={savedEditForm.tags}
                    onChange={handleSavedEditChange}
                    className="form-control"
                    placeholder="Tags, comma-separated"
                  />
                  <textarea
                    name="notes"
                    value={savedEditForm.notes}
                    onChange={handleSavedEditChange}
                    rows="3"
                    className="form-control"
                    placeholder="Saved trip notes"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className="btn-primary">
                      Save metadata
                    </button>
                    <button type="button" onClick={handleCancelSavedEdit} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {savedTrip.notes && <p className="mt-4 text-sm leading-6 text-slate-600">{savedTrip.notes}</p>}
                  {savedTrip.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {savedTrip.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditSavedTrip(savedTrip)}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                    >
                      Edit metadata
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSavedTrip(savedTrip._id)}
                      className="btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MyTripsPage;
