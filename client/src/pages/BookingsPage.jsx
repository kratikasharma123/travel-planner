import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  Hotel,
  Map,
  MapPin,
  Plane,
  Plus,
  ReceiptText,
  Sparkles,
  Ticket,
  Wallet,
  XCircle,
} from 'lucide-react';
import { currencyFormat } from '../utils/budgetCalculations.js';

const bookingTabs = ['All', 'Hotels', 'Flights', 'Tours', 'Activities', 'Upcoming', 'Completed', 'Cancelled'];

const dummyBookings = [
  {
    id: 'BK-TRP-2401',
    type: 'Hotels',
    title: 'Ubud Jungle Resort Stay',
    location: 'Ubud, Bali',
    date: '2026-08-12',
    time: '02:00 PM',
    status: 'Upcoming',
    price: 420,
    confirmationId: 'HSF-98241',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=90',
  },
  {
    id: 'BK-TRP-2402',
    type: 'Flights',
    title: 'Delhi to Dubai Flight',
    location: 'Indira Gandhi Airport → DXB',
    date: '2026-08-10',
    time: '08:45 AM',
    status: 'Upcoming',
    price: 310,
    confirmationId: 'AIR-77Q9Z',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=90',
  },
  {
    id: 'BK-TRP-2403',
    type: 'Tours',
    title: 'Kyoto Temples Walking Tour',
    location: 'Kyoto, Japan',
    date: '2026-07-22',
    time: '10:30 AM',
    status: 'Completed',
    price: 85,
    confirmationId: 'TOUR-KY77',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=90',
  },
  {
    id: 'BK-TRP-2404',
    type: 'Activities',
    title: 'Desert Safari & Dinner',
    location: 'Dubai Desert Conservation Reserve',
    date: '2026-09-03',
    time: '04:15 PM',
    status: 'Upcoming',
    price: 145,
    confirmationId: 'ACT-DXB45',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=90',
  },
  {
    id: 'BK-TRP-2405',
    type: 'Hotels',
    title: 'Santorini Cave Suite',
    location: 'Oia, Greece',
    date: '2026-06-16',
    time: '03:00 PM',
    status: 'Cancelled',
    price: 680,
    confirmationId: 'HOT-OIA22',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=90',
  },
];

const bookingTypeMeta = {
  Hotels: { icon: Hotel, tone: 'bg-orange-50 text-orange-600' },
  Flights: { icon: Plane, tone: 'bg-emerald-50 text-emerald-700' },
  Tours: { icon: Map, tone: 'bg-amber-50 text-amber-700' },
  Activities: { icon: Compass, tone: 'bg-teal-50 text-teal-700' },
};

const statusClasses = {
  Upcoming: 'bg-orange-50 text-orange-700 ring-orange-100',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Cancelled: 'bg-rose-50 text-rose-700 ring-rose-100',
};

function getBookingDate(booking) {
  return new Date(`${booking.date}T${booking.time.replace(' ', '')}`);
}

function getCountdown(booking) {
  const now = new Date();
  const diff = getBookingDate(booking) - now;
  if (diff <= 0) return booking.status === 'Completed' ? 'Completed' : 'Today';
  const days = Math.ceil(diff / 86400000);
  return `${days} day${days === 1 ? '' : 's'} to go`;
}

function BookingCard({ booking, onCancel }) {
  const meta = bookingTypeMeta[booking.type] || bookingTypeMeta.Activities;
  const Icon = meta.icon;

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-orange-100 bg-white shadow-lg shadow-orange-100/40 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-100/70">
      <div className="relative h-52 overflow-hidden">
        <img src={booking.image} alt={booking.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <span className={`absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-2xl ${meta.tone} shadow-sm`}><Icon className="h-5 w-5" /></span>
        <span className={`absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClasses[booking.status]}`}>{booking.status}</span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">{booking.type}</p>
            <h2 className="mt-2 text-xl font-black text-slate-950 group-hover:text-orange-600">{booking.title}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-500"><MapPin className="h-4 w-4 text-orange-500" />{booking.location}</p>
          </div>
          <p className="rounded-full bg-orange-50 px-3 py-1 text-sm font-black text-orange-700">{currencyFormat(booking.price)}</p>
        </div>

        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-2xl bg-orange-50/70 p-3"><CalendarDays className="h-4 w-4 text-orange-500" /><p className="mt-2 font-black text-slate-800">{booking.date}</p></div>
          <div className="rounded-2xl bg-emerald-50/70 p-3"><Clock3 className="h-4 w-4 text-emerald-600" /><p className="mt-2 font-black text-slate-800">{booking.time}</p></div>
        </div>

        <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-slate-700"><ReceiptText className="mr-1 inline h-4 w-4 text-amber-600" /> Confirmation ID: {booking.confirmationId}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-orange-600">View Details</button>
          <button type="button" className="rounded-full border border-orange-100 px-4 py-2 text-sm font-black text-orange-600 transition hover:bg-orange-50">Edit</button>
          <button type="button" onClick={() => onCancel(booking.id)} disabled={booking.status === 'Cancelled'} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
        </div>
      </div>
    </article>
  );
}

function BookingsPage() {
  const [bookings, setBookings] = useState(dummyBookings);
  const [activeTab, setActiveTab] = useState('All');
  const [showAddPanel, setShowAddPanel] = useState(false);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'All') return bookings;
    return bookings.filter((booking) => booking.type === activeTab || booking.status === activeTab);
  }, [activeTab, bookings]);

  const stats = useMemo(() => [
    { label: 'Total Bookings', value: bookings.length, icon: Ticket, tone: 'bg-orange-50 text-orange-600' },
    { label: 'Upcoming Bookings', value: bookings.filter((booking) => booking.status === 'Upcoming').length, icon: CalendarDays, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Completed Bookings', value: bookings.filter((booking) => booking.status === 'Completed').length, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Cancelled Bookings', value: bookings.filter((booking) => booking.status === 'Cancelled').length, icon: XCircle, tone: 'bg-rose-50 text-rose-700' },
  ], [bookings]);

  const nearestBooking = useMemo(() => bookings
    .filter((booking) => booking.status === 'Upcoming')
    .sort((a, b) => getBookingDate(a) - getBookingDate(b))[0], [bookings]);

  function handleCancel(bookingId) {
    setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status: 'Cancelled' } : booking));
  }

  function handleAddBooking() {
    setShowAddPanel((current) => !current);
  }

  return (
    <section className="relative grid gap-6 overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-96 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />

      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 p-6 shadow-2xl shadow-orange-100 sm:p-8 lg:p-10">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=90"
          alt="Airplane booking management background"
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1.5px]"
        />
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

      {showAddPanel && (
        <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Quick add</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Booking form coming next</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">This CTA is wired as a UI panel for now. Backend booking form can be connected here later.</p>
        </section>
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
          <img src={nearestBooking.image} alt={nearestBooking.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">Upcoming booking highlight</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{nearestBooking.title}</h2>
            <p className="mt-2 text-lg font-semibold text-white/80">{nearestBooking.type} • {nearestBooking.location}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white">{getCountdown(nearestBooking)}</span>
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-black text-white backdrop-blur">{nearestBooking.date} • {nearestBooking.time}</span>
              <span className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-black text-white">{nearestBooking.status}</span>
            </div>
            <button type="button" className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-orange-500 hover:text-white">View Booking</button>
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

      {filteredBookings.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-orange-200 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-10 text-center shadow-lg shadow-orange-100/40">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-white text-orange-500 shadow-xl shadow-orange-100"><CalendarDays className="h-10 w-10" /></div>
          <h2 className="mt-5 text-2xl font-black text-slate-950">No bookings yet</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Add hotels, flights, tours, and activities to track your trip in one place.</p>
          <button type="button" onClick={handleAddBooking} className="mt-5 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600">Add your first booking</button>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredBookings.map((booking) => <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />)}
        </section>
      )}
    </section>
  );
}

export default BookingsPage;
