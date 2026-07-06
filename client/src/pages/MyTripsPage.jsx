import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Compass,
  Edit3,
  Heart,
  MapPin,
  Plane,
  Plus,
  Sparkles,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';
import { useTrips } from '../hooks/useTrips.js';
import { currencyFormat } from '../utils/budgetCalculations.js';

const initialForm = {
  title: '',
  destinationName: '',
  destinationCountry: '',
  budget: '',
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
  status: '',
};

const tripTabs = ['All', 'Upcoming', 'Planned', 'Completed'];

const tripImages = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=90',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=90',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=90',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=90',
];

function tripToForm(trip) {
  return {
    title: trip.title || '',
    destinationName: trip.customDestination?.name || trip.destination?.name || '',
    destinationCountry: trip.customDestination?.country || trip.destination?.country || trip.country || '',
    budget: trip.budget || '',
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
    city: formData.destinationName,
    country: formData.destinationCountry,
    budget: Number(formData.budget || 0),
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

function getErrorMessage(apiError, fallback) {
  const message = apiError?.response?.data?.message || apiError?.message || fallback;

  if (apiError?.code === '23505' || message.toLowerCase().includes('duplicate')) {
    return 'This trip is already saved.';
  }

  return message;
}

function getInitialForm(destination) {
  if (!destination) return initialForm;

  const destinationName = destination.name || destination.city || '';
  const destinationCountry = destination.country || '';

  return {
    ...initialForm,
    title: `${destinationName || 'New'} trip`,
    destinationName,
    destinationCountry,
    notes: destination.tag ? `Inspired by ${destination.tag}.` : '',
  };
}

function getDestinationName(trip) {
  return trip.destination?.name || trip.customDestination?.name || trip.city || 'Custom destination';
}

function getWishlistCount() {
  return JSON.parse(window.localStorage.getItem('tripsafar-favorite-destinations') || '[]').length;
}

function getTripProgress(trip) {
  if (trip.status === 'completed') return 100;
  if (trip.status === 'active') return 72;
  if (trip.status === 'saved') return 58;
  return 34;
}

function getDurationFromDates(startDate, endDate) {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return '';
  return String(Math.round((end - start) / 86400000) + 1);
}

function MyTripsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDestination = location.state?.destination;
  const { trips, isLoading, error, refreshTrips, createTrip, updateTrip, deleteTrip } = useTrips();
  const [formData, setFormData] = useState(() => getInitialForm(selectedDestination));
  const [filters, setFilters] = useState(initialFilters);
  const [activeTab, setActiveTab] = useState('All');
  const [editingTripId, setEditingTripId] = useState(null);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(() => {
    const destinationName = selectedDestination?.name || selectedDestination?.city;
    return destinationName ? `Ready to create your ${destinationName} trip.` : '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTrips = useMemo(() => trips.filter((trip) => trip.status !== 'archived'), [trips]);
  const upcomingTrips = useMemo(() => activeTrips.filter((trip) => trip.status !== 'completed'), [activeTrips]);
  const completedTrips = useMemo(() => trips.filter((trip) => trip.status === 'completed'), [trips]);
  const filteredTrips = useMemo(() => {
    if (activeTab === 'Upcoming') return upcomingTrips;
    if (activeTab === 'Planned') return trips.filter((trip) => ['draft', 'saved', 'active'].includes(trip.status));
    if (activeTab === 'Completed') return completedTrips;
    return trips;
  }, [activeTab, completedTrips, trips, upcomingTrips]);
  const featuredTrip = upcomingTrips[0] || activeTrips[0] || null;
  const savedDestinationCount = getWishlistCount();

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => {
      const next = { ...current, [name]: value };
      if (name === 'startDate' || name === 'endDate') {
        next.durationDays = getDurationFromDates(next.startDate, next.endDate);
      }
      return next;
    });
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
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

  async function handleDeleteTrip(tripId) {
    setFormError('');
    setSuccess('');

    try {
      await deleteTrip(tripId);
      setSuccess('Trip deleted successfully.');
    } catch (apiError) {
      setFormError(getErrorMessage(apiError, 'Unable to delete trip.'));
    }
  }

  return (
    <section className="relative grid gap-6 overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-96 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />

      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 p-6 shadow-2xl shadow-orange-100 sm:p-8 lg:p-10">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=90"
          alt="Airplane trips background"
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-orange-950/45 to-orange-400/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(251,146,60,0.35),transparent_30%),radial-gradient(circle_at_86%_76%,rgba(16,185,129,0.24),transparent_28%)]" />
      
        <div className="relative max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-100 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Trip cockpit
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">Your travel plans</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/85 sm:text-lg">Manage saved trips, itineraries, budgets, and AI recommendations.</p>
          <button type="button" onClick={() => navigate('/planner')} className="mt-7 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            Plan New Trip
          </button>
        </div>
      </section>

      {(formError || success || error) && (
        <div className="grid gap-3">
          {formError && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{formError}</p>}
          {success && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{success}</p>}
          {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Trips', value: trips.length, icon: Plane },
          { label: 'Upcoming Trips', value: upcomingTrips.length, icon: CalendarDays },
          { label: 'Completed Trips', value: completedTrips.length, icon: CheckCircleIcon },
          { label: 'Saved Destinations', value: savedDestinationCount, icon: Heart },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40 transition hover:-translate-y-1 hover:shadow-xl">
              <Icon className="h-6 w-6 text-orange-500" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
              <p className="mt-1 text-3xl font-black text-slate-950">{item.value}</p>
            </article>
          );
        })}
      </section>

      {featuredTrip && (
        <section className="group relative min-h-96 overflow-hidden rounded-[2rem] shadow-2xl shadow-orange-100">
          <img src={tripImages[0]} alt={featuredTrip.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">Featured upcoming trip</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{featuredTrip.title}</h2>
            <p className="mt-2 text-lg font-semibold text-white/80">{getDestinationName(featuredTrip)} • {featuredTrip.startDate || 'Flexible dates'}</p>
            <div className="mt-5 max-w-xl">
              <div className="flex justify-between text-xs font-black uppercase tracking-[0.16em] text-white/60"><span>Planning progress</span><span>{getTripProgress(featuredTrip)}%</span></div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-orange-500" style={{ width: `${getTripProgress(featuredTrip)}%` }} /></div>
            </div>
            <Link to="/planner" state={{ trip: featuredTrip }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600">
              Continue Planning
              <Plane className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Plan new trip</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Create or edit a trip</h2>
        <form className="mt-5 grid gap-4 lg:grid-cols-3" onSubmit={handleSubmitTrip}>
          <input name="title" value={formData.title} onChange={handleChange} required minLength={2} className="form-control" placeholder="Trip title" />
          <input name="destinationName" value={formData.destinationName} onChange={handleChange} className="form-control" placeholder="Destination city" />
          <input name="destinationCountry" value={formData.destinationCountry} onChange={handleChange} className="form-control" placeholder="Country" />
          <input type="number" name="budget" min="0" value={formData.budget} onChange={handleChange} className="form-control" placeholder="Trip budget" />
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="form-control" />
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="form-control" />
          <input type="number" name="durationDays" min="1" max="365" value={formData.durationDays} readOnly className="form-control bg-slate-50" placeholder="Duration days" />
          <select name="status" value={formData.status} onChange={handleChange} className="form-control"><option value="draft">Draft</option><option value="saved">Saved</option><option value="archived">Archived</option></select>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="form-control lg:col-span-3" placeholder="Trip notes" />
          <div className="flex flex-wrap gap-3 lg:col-span-3">
            <button type="submit" disabled={isSubmitting} className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? 'Saving...' : editingTripId ? 'Update Trip' : 'Create Trip'}</button>
            {editingTripId && <button type="button" onClick={handleCancelEdit} className="btn-secondary">Cancel edit</button>}
          </div>
        </form>
      </section>

      <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Trip records</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Your trip cards</h2>
            <p className="mt-2 text-sm text-slate-600">{activeTrips.length} active trips • {trips.length} total records</p>
          </div>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleApplyFilters}>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="form-control"><option value="">All statuses</option><option value="draft">Draft</option><option value="saved">Saved</option><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select>
            <div className="flex gap-2"><button type="submit" className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600">Filter</button><button type="button" onClick={handleResetFilters} className="btn-secondary">Reset</button></div>
          </form>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tripTabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-2 text-sm font-black transition ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>{tab}</button>)}
        </div>

        {isLoading && <p className="mt-4 text-slate-600">Loading trips...</p>}
        {!isLoading && filteredTrips.length === 0 && (
          <div className="mt-6 rounded-[1.75rem] border border-dashed border-orange-200 bg-orange-50 p-8 text-center">
            <Compass className="mx-auto h-12 w-12 text-orange-500" />
            <h3 className="mt-4 text-xl font-black text-slate-950">No trips planned yet</h3>
            <button type="button" onClick={() => navigate('/planner')} className="mt-4 rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white">Create your first trip</button>
          </div>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTrips.map((trip, index) => (
              <article key={trip._id} className="group overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-lg shadow-orange-100/40 transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-100/70">
                <div className="relative h-52 overflow-hidden">
                  <img src={tripImages[index % tripImages.length]} alt={trip.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/10" />
                  <span className="absolute bottom-4 left-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-black uppercase text-white">{trip.status}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-black text-slate-950">{trip.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-500"><MapPin className="h-4 w-4 text-orange-500" />{getDestinationName(trip)}</p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p><CalendarDays className="mr-1 inline h-4 w-4 text-orange-500" />{trip.startDate || 'Flexible'} {trip.endDate ? `→ ${trip.endDate}` : ''}</p>
                    <p><Users className="mr-1 inline h-4 w-4 text-orange-500" />{trip.travelerCount} travelers</p>
                    <p><Wallet className="mr-1 inline h-4 w-4 text-orange-500" />{currencyFormat(trip.budget || 0)}</p>
                    <p><Sparkles className="mr-1 inline h-4 w-4 text-orange-500" />{trip.travelStyle || 'AI-ready'}</p>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-black uppercase tracking-[0.16em] text-slate-400"><span>Progress</span><span>{getTripProgress(trip)}%</span></div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-orange-50"><div className="h-full rounded-full bg-orange-500" style={{ width: `${getTripProgress(trip)}%` }} /></div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to={`/my-trips/${trip._id}`} state={{ trip }} className="rounded-full border border-orange-100 px-4 py-2 text-sm font-black text-orange-600 hover:bg-orange-50"><Edit3 className="mr-1 inline h-4 w-4" />View Details</Link>
                    <Link to="/planner" state={{ trip }} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white">Continue Planning</Link>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-orange-50 pt-4">
                    <button type="button" onClick={() => handleEditTrip(trip)} className="text-xs font-black text-slate-500 hover:text-orange-600"><Edit3 className="mr-1 inline h-3.5 w-3.5" />Edit Trip</button>
                    <button type="button" onClick={() => handleDeleteTrip(trip._id)} className="text-xs font-black text-rose-600"><Trash2 className="mr-1 inline h-3.5 w-3.5" />Delete</button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>

    </section>
  );
}

function CheckCircleIcon(props) {
  return <Sparkles {...props} />;
}

export default MyTripsPage;
