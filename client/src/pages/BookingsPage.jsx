import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  Edit3,
  Hotel,
  Map,
  MapPin,
  Plane,
  Plus,
  ReceiptText,
  Sparkles,
  Ticket,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useBookings } from '../hooks/useBookings.js';
import { useTrips } from '../hooks/useTrips.js';
import { currencyFormat } from '../utils/budgetCalculations.js';

const bookingTabs = ['All', 'Hotels', 'Flights', 'Tours', 'Activities', 'Upcoming', 'Completed', 'Cancelled'];

const initialForm = {
  tripId: '',
  type: 'Activities',
  title: '',
  provider: '',
  confirmationId: '',
  location: '',
  date: '',
  time: '',
  status: 'Upcoming',
  price: '',
  image: '',
};

const bookingTypeMeta = {
  Hotels: { icon: Hotel, tone: 'bg-orange-50 text-orange-600', value: 'hotel' },
  Flights: { icon: Plane, tone: 'bg-emerald-50 text-emerald-700', value: 'flight' },
  Tours: { icon: Map, tone: 'bg-amber-50 text-amber-700', value: 'tour' },
  Activities: { icon: Compass, tone: 'bg-teal-50 text-teal-700', value: 'activity' },
};

const statusClasses = {
  Upcoming: 'bg-orange-50 text-orange-700 ring-orange-100',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Cancelled: 'bg-rose-50 text-rose-700 ring-rose-100',
};

function normalizeStatus(status = '') {
  const lower = status.toLowerCase();
  if (lower === 'completed') return 'Completed';
  if (lower === 'cancelled') return 'Cancelled';
  return 'Upcoming';
}

function normalizeType(type = '') {
  const lower = type.toLowerCase();
  if (lower === 'hotel') return 'Hotels';
  if (lower === 'flight') return 'Flights';
  if (lower === 'tour') return 'Tours';
  return 'Activities';
}

function bookingToForm(booking) {
  if (!booking) return initialForm;
  return {
    tripId: booking.tripId || '',
    type: normalizeType(booking.bookingType || booking.type),
    title: booking.title || '',
    provider: booking.provider || '',
    confirmationId: booking.confirmationId || booking.referenceNumber || '',
    location: booking.location || '',
    date: booking.date || '',
    time: booking.time || '',
    status: normalizeStatus(booking.status),
    price: booking.price || '',
    image: booking.image || '',
  };
}

function formToPayload(formData) {
  return {
    tripId: formData.tripId || null,
    bookingType: bookingTypeMeta[formData.type]?.value || 'activity',
    type: formData.type,
    title: formData.title,
    provider: formData.provider,
    confirmationId: formData.confirmationId,
    location: formData.location,
    date: formData.date,
    time: formData.time,
    status: formData.status.toLowerCase(),
    price: Number(formData.price || 0),
    image: formData.image,
  };
}

function getBookingDate(booking) {
  if (!booking.date) return new Date(0);
  return new Date(`${booking.date}T${booking.time || '00:00'}`);
}

function getCountdown(booking) {
  const now = new Date();
  const diff = getBookingDate(booking) - now;
  if (diff <= 0) return booking.status === 'Completed' ? 'Completed' : 'Today';
  const days = Math.ceil(diff / 86400000);
  return `${days} day${days === 1 ? '' : 's'} to go`;
}

function BookingCard({ booking, onCancel, onEdit, onDelete }) {
  const displayType = normalizeType(booking.type || booking.bookingType);
  const displayStatus = normalizeStatus(booking.status);
  const meta = bookingTypeMeta[displayType] || bookingTypeMeta.Activities;
  const Icon = meta.icon;

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-orange-100 bg-white shadow-lg shadow-orange-100/40 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-100/70">
      <div className="relative h-52 overflow-hidden">
        <img src={booking.image || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=90'} alt={booking.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <span className={`absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-2xl ${meta.tone} shadow-sm`}><Icon className="h-5 w-5" /></span>
        <span className={`absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClasses[displayStatus]}`}>{displayStatus}</span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">{displayType}</p>
            <h2 className="mt-2 text-xl font-black text-slate-950 group-hover:text-orange-600">{booking.title}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-500"><MapPin className="h-4 w-4 text-orange-500" />{booking.location || 'Location not set'}</p>
          </div>
          <p className="rounded-full bg-orange-50 px-3 py-1 text-sm font-black text-orange-700">{currencyFormat(booking.price || 0)}</p>
        </div>

        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-2xl bg-orange-50/70 p-3"><CalendarDays className="h-4 w-4 text-orange-500" /><p className="mt-2 font-black text-slate-800">{booking.date || 'Date pending'}</p></div>
          <div className="rounded-2xl bg-emerald-50/70 p-3"><Clock3 className="h-4 w-4 text-emerald-600" /><p className="mt-2 font-black text-slate-800">{booking.time || 'Time pending'}</p></div>
        </div>

        <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-slate-700"><ReceiptText className="mr-1 inline h-4 w-4 text-amber-600" /> Confirmation ID: {booking.confirmationId || 'Not added'}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => onEdit(booking)} className="rounded-full border border-orange-100 px-4 py-2 text-sm font-black text-orange-600 transition hover:bg-orange-50"><Edit3 className="mr-1 inline h-4 w-4" />Edit</button>
          <button type="button" onClick={() => onCancel(booking.id)} disabled={displayStatus === 'Cancelled'} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
          <button type="button" onClick={() => onDelete(booking.id)} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-50"><Trash2 className="mr-1 inline h-4 w-4" />Delete</button>
        </div>
      </div>
    </article>
  );
}

function BookingsPage() {
  const { trips } = useTrips();
  const { bookings, isLoading, isSubmitting, error, createBooking, updateBooking, cancelBooking, deleteBooking } = useBookings();
  const [activeTab, setActiveTab] = useState('All');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const normalizedBookings = useMemo(() => bookings.map((booking) => ({ ...booking, type: normalizeType(booking.type || booking.bookingType), status: normalizeStatus(booking.status) })), [bookings]);
  const filteredBookings = useMemo(() => {
    if (activeTab === 'All') return normalizedBookings;
    return normalizedBookings.filter((booking) => booking.type === activeTab || booking.status === activeTab);
  }, [activeTab, normalizedBookings]);

  const stats = useMemo(() => [
    { label: 'Total Bookings', value: normalizedBookings.length, icon: Ticket, tone: 'bg-orange-50 text-orange-600' },
    { label: 'Upcoming Bookings', value: normalizedBookings.filter((booking) => booking.status === 'Upcoming').length, icon: CalendarDays, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Completed Bookings', value: normalizedBookings.filter((booking) => booking.status === 'Completed').length, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Cancelled Bookings', value: normalizedBookings.filter((booking) => booking.status === 'Cancelled').length, icon: XCircle, tone: 'bg-rose-50 text-rose-700' },
  ], [normalizedBookings]);

  const nearestBooking = useMemo(() => normalizedBookings
    .filter((booking) => booking.status === 'Upcoming')
    .sort((a, b) => getBookingDate(a) - getBookingDate(b))[0], [normalizedBookings]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function validateForm() {
    if (!formData.title.trim()) return 'Booking title is required.';
    if (!formData.date) return 'Booking date is required.';
    if (!formData.type) return 'Booking type is required.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      if (editingBookingId) {
        await updateBooking(editingBookingId, formToPayload(formData));
        setSuccess('Booking updated successfully.');
      } else {
        await createBooking(formToPayload(formData));
        setSuccess('Booking added successfully.');
      }
      setFormData(initialForm);
      setEditingBookingId(null);
      setShowAddPanel(false);
    } catch (apiError) {
      setFormError(apiError?.response?.data?.message || apiError?.message || 'Unable to save booking.');
    }
  }

  async function handleCancel(bookingId) {
    setFormError('');
    setSuccess('');
    try {
      await cancelBooking(bookingId);
      setSuccess('Booking cancelled successfully.');
    } catch (apiError) {
      setFormError(apiError?.response?.data?.message || apiError?.message || 'Unable to cancel booking.');
    }
  }

  async function handleDelete(bookingId) {
    setFormError('');
    setSuccess('');
    try {
      await deleteBooking(bookingId);
      setSuccess('Booking deleted successfully.');
    } catch (apiError) {
      setFormError(apiError?.response?.data?.message || apiError?.message || 'Unable to delete booking.');
    }
  }

  function handleEdit(booking) {
    setEditingBookingId(booking.id);
    setFormData(bookingToForm(booking));
    setShowAddPanel(true);
    setFormError('');
    setSuccess('');
  }

  function handleAddBooking() {
    setEditingBookingId(null);
    setFormData(initialForm);
    setShowAddPanel((current) => !current);
  }

  return (
    <section className="relative grid gap-6 overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-96 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />

      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 p-6 shadow-2xl shadow-orange-100 sm:p-8 lg:p-10">
        <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=90" alt="Airplane booking management background" className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1.5px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-orange-950/45 to-orange-400/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(251,146,60,0.35),transparent_30%),radial-gradient(circle_at_86%_76%,rgba(16,185,129,0.24),transparent_28%)]" />
        <Plane className="absolute right-10 top-8 hidden h-24 w-24 rotate-12 text-white/50 md:block" />
        <div className="relative max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-100 shadow-sm backdrop-blur"><Sparkles className="h-4 w-4" />Booking cockpit</p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">Manage your bookings</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/85 sm:text-lg">Track hotels, flights, tours, and activities in one place.</p>
          <button type="button" onClick={handleAddBooking} className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-600"><Plus className="h-4 w-4" />Add Booking</button>
        </div>
      </section>

      {(error || formError || success || isLoading) && (
        <div className="grid gap-3">
          {isLoading && <p className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-600 shadow-soft">Loading bookings...</p>}
          {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}
          {formError && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{formError}</p>}
          {success && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{success}</p>}
        </div>
      )}

      {showAddPanel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-orange-100 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Quick add</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{editingBookingId ? 'Edit booking' : 'Add booking'}</h2>
            <form className="mt-5 grid gap-4 lg:grid-cols-3" onSubmit={handleSubmit}>
            <select name="tripId" value={formData.tripId} onChange={handleChange} className="form-control">
              <option value="">No trip linked</option>
              {trips.map((trip) => <option key={trip._id} value={trip._id}>{trip.title}</option>)}
            </select>
            <select name="type" value={formData.type} onChange={handleChange} className="form-control">
              <option>Hotels</option><option>Flights</option><option>Tours</option><option>Activities</option>
            </select>
            <select name="status" value={formData.status} onChange={handleChange} className="form-control">
              <option>Upcoming</option><option>Completed</option><option>Cancelled</option>
            </select>
            <input name="title" value={formData.title} onChange={handleChange} required className="form-control" placeholder="Booking title" />
            <input name="provider" value={formData.provider} onChange={handleChange} className="form-control" placeholder="Provider" />
            <input name="confirmationId" value={formData.confirmationId} onChange={handleChange} className="form-control" placeholder="Confirmation ID" />
            <input name="location" value={formData.location} onChange={handleChange} className="form-control" placeholder="Location" />
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-control" />
            <input type="time" name="time" value={formData.time} onChange={handleChange} className="form-control" />
            <input type="number" min="0" name="price" value={formData.price} onChange={handleChange} className="form-control" placeholder="Price" />
            <input name="image" value={formData.image} onChange={handleChange} className="form-control lg:col-span-2" placeholder="Image URL (optional)" />
            <div className="flex flex-wrap gap-3 lg:col-span-3">
              <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : editingBookingId ? 'Update Booking' : 'Add Booking'}</button>
              <button type="button" onClick={() => { setShowAddPanel(false); setEditingBookingId(null); setFormData(initialForm); }} className="btn-secondary">Cancel</button>
            </div>
            </form>
          </section>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {nearestBooking && (
        <section className="group relative min-h-96 overflow-hidden rounded-[2rem] shadow-2xl shadow-orange-100">
          <img src={nearestBooking.image || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=90'} alt={nearestBooking.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">Upcoming booking highlight</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{nearestBooking.title}</h2>
            <p className="mt-2 text-lg font-semibold text-white/80">{nearestBooking.type} • {nearestBooking.location}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white">{getCountdown(nearestBooking)}</span>
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-black text-white backdrop-blur">{nearestBooking.date} • {nearestBooking.time || 'Time pending'}</span>
              <span className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-black text-white">{nearestBooking.status}</span>
            </div>
          </div>
        </section>
      )}

      <section className="flex flex-wrap gap-2">
        {bookingTabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-2 text-sm font-black transition ${activeTab === tab ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-600 ring-1 ring-orange-100 hover:bg-orange-50 hover:text-orange-600'}`}>
            {tab}
          </button>
        ))}
      </section>

      {filteredBookings.length === 0 && !isLoading ? (
        <section className="rounded-[2rem] border border-dashed border-orange-200 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-10 text-center shadow-lg shadow-orange-100/40">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-white text-orange-500 shadow-xl shadow-orange-100"><CalendarDays className="h-10 w-10" /></div>
          <h2 className="mt-5 text-2xl font-black text-slate-950">No bookings yet</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Add hotels, flights, tours, and activities to track your trip in one place.</p>
          <button type="button" onClick={handleAddBooking} className="mt-5 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600">Add your first booking</button>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredBookings.map((booking) => <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} onEdit={handleEdit} onDelete={handleDelete} />)}
        </section>
      )}
    </section>
  );
}

export default BookingsPage;
