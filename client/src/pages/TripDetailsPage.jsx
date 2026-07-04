import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Compass, Heart, MapPin, Plane, Sparkles, Users, Wallet } from 'lucide-react';
import { currencyFormat } from '../utils/budgetCalculations.js';

const fallbackTripImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=90';

function getDestinationName(trip) {
  return trip?.destination?.name || trip?.customDestination?.name || trip?.city || 'Destination not set';
}

function getProgress(trip) {
  if (trip?.status === 'completed') return 100;
  if (trip?.status === 'active') return 76;
  if (trip?.status === 'saved') return 58;
  return 36;
}

function TripDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const trip = location.state?.trip;

  if (!trip) {
    return (
      <section className="rounded-[2rem] border border-orange-100 bg-white p-8 text-center shadow-xl shadow-orange-100/40">
        <Compass className="mx-auto h-14 w-14 text-orange-500" />
        <h1 className="mt-4 text-2xl font-black text-slate-950">Trip details unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">Open this page from a trip card so TripSafar can load the selected trip.</p>
        <Link to="/my-trips" className="mt-5 inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white">Back to My Trips</Link>
      </section>
    );
  }

  const progress = getProgress(trip);

  return (
    <section className="grid gap-6">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-700 ring-1 ring-orange-100 transition hover:bg-orange-50 hover:text-orange-600">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <section className="relative min-h-[28rem] overflow-hidden rounded-[2rem] shadow-2xl shadow-orange-100">
        <img src={fallbackTripImage} alt={trip.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-100 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Trip details
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">{trip.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-lg font-semibold text-white/80"><MapPin className="h-5 w-5 text-orange-300" />{getDestinationName(trip)}</p>
          <div className="mt-6 max-w-2xl">
            <div className="flex justify-between text-xs font-black uppercase tracking-[0.16em] text-white/60"><span>Planning progress</span><span>{progress}%</span></div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-orange-500" style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/planner" state={{ trip }} className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600"><Plane className="h-4 w-4" />Continue Planning</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Dates', value: `${trip.startDate || 'Flexible'}${trip.endDate ? ` → ${trip.endDate}` : ''}`, icon: CalendarDays },
          { label: 'Travelers', value: `${trip.travelerCount || 1} travelers`, icon: Users },
          { label: 'Budget', value: currencyFormat(trip.budget || 0), icon: Wallet },
          { label: 'Status', value: trip.status || 'draft', icon: Heart },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40">
              <Icon className="h-6 w-6 text-orange-500" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
              <p className="mt-1 font-black text-slate-950">{item.value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <article className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Trip notes</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Plan context</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">{trip.notes || 'No notes added yet. Continue planning to add itinerary details, preferences, and AI suggestions.'}</p>
        </article>
        <article className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-6 shadow-xl shadow-orange-100/40">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Interests</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(trip.interests?.length ? trip.interests : ['AI-ready', 'Flexible', 'Travel']).map((interest) => (
              <span key={interest} className="rounded-full bg-white px-4 py-2 text-sm font-black text-orange-600 shadow-sm ring-1 ring-orange-100">{interest}</span>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}

export default TripDetailsPage;
