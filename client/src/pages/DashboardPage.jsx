import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../hooks/useAuth.js';
import { useTripDashboard } from '../hooks/useTripDashboard.js';
import { currencyFormat } from '../utils/budgetCalculations.js';

const destinationCards = [
  {
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=90',
  },
  {
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=90',
  },
  {
    name: 'Santorini',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=90',
  },
  {
    name: 'Dubai',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=90',
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=90',
  },
  {
    name: 'Maldives',
    country: 'Maldives',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=90',
  },
  {
    name: 'Marrakech',
    country: 'Morocco',
    image: 'https://images.unsplash.com/photo-1548018560-c7196548e84d?auto=format&fit=crop&w=600&q=90',
  },
  {
    name: 'New Zealand',
    country: 'Oceania',
    image: 'https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=600&q=90',
  },
];

const budgetRows = [
  { name: 'Flights', value: 28, color: '#FB923C' },
  { name: 'Hotels', value: 24, color: '#38BDF8' },
  { name: 'Food', value: 16, color: '#22C55E' },
  { name: 'Transport', value: 12, color: '#A855F7' },
  { name: 'Activities', value: 12, color: '#F43F5E' },
  { name: 'Others', value: 8, color: '#64748B' },
];

function normalizeWishlist(items = []) {
  return items
    .map((item) => {
      if (typeof item !== 'string') return item;
      return destinationCards.find((destination) => destination.name === item) || { name: item, country: '', image: '' };
    })
    .filter(Boolean);
}

function getStoredFavoriteDestinations() {
  return normalizeWishlist(JSON.parse(window.localStorage.getItem('tripsafar-favorite-destinations') || '[]'));
}

function BudgetTooltip({ active, payload, totalSpent }) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;
  const amount = totalSpent ? (totalSpent * item.value) / 100 : 0;

  return (
    <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm shadow-xl shadow-orange-100/70">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
        <p className="font-black text-[#222222]">{item.name}</p>
      </div>
      <p className="mt-2 text-lg font-black text-[#FB923C]">{item.value}%</p>
      <p className="text-xs font-bold text-[#222222]/45">Approx. {currencyFormat(amount)}</p>
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const { trips, summary, analyticsRows, isLoading, error } = useTripDashboard();
  const [favoriteDestinations, setFavoriteDestinations] = useState(getStoredFavoriteDestinations);
  const budget = summary.budgetSummary;
  const nextTrip = summary.nextTrip;

  function toggleFavoriteDestination(destination) {
    setFavoriteDestinations((current) => {
      const nextFavorites = current.some((item) => item.name === destination.name)
        ? current.filter((item) => item.name !== destination.name)
        : [...current, destination];

      window.localStorage.setItem('tripsafar-favorite-destinations', JSON.stringify(nextFavorites));
      window.dispatchEvent(new Event('tripsafar-favorites-updated'));
      return nextFavorites;
    });
  }

  const stats = [
    { label: 'Total Trips', value: trips.length, icon: '🧳', growth: '+12%', color: 'bg-[#FFFBF5] text-[#FB923C]' },
    { label: 'Destinations Visited', value: Math.max(trips.length, 8), icon: '🌍', growth: '+8%', color: 'bg-orange-50/70 text-[#FB923C]' },
    { label: 'Total Budget', value: currencyFormat(budget.totalBudget), icon: '💰', growth: '+5%', color: 'bg-amber-50 text-[#F59E0B]' },
    { label: 'AI Interactions', value: '128', icon: '🤖', growth: '+24%', color: 'bg-amber-50 text-[#F59E0B]' },
  ];

  return (
    <section className="grid min-w-0 gap-5 lg:gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid min-w-0 gap-5 lg:gap-6">
        <section className="relative min-h-[24rem] overflow-hidden rounded-[2rem] bg-white p-5 text-white shadow-soft ring-1 ring-black/5 sm:p-6 lg:p-8">
          <img
            src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=90"
            alt="Scenic mountain travel background"
            className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1.5px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
          <div className="relative max-w-2xl">
            <p className="text-2xl font-black uppercase tracking-[0.24em] text-white/75"> {user?.name?.split(' ')?.[0] || 'Traveler'}! ☀️</p>
            <h1 className="mt-4 text-xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Let’s make today an adventure!
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
              Build routes, discover destinations, track budgets, and continue your travel plans with AI.
            </p>
          </div>
         
        </section>

        {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}
        {isLoading && <p className="text-sm text-[#222222]/60">Loading dashboard...</p>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-[1.6rem] bg-white p-5 shadow-soft ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-4">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl text-xl ${stat.color}`}>
                  {stat.icon}
                </span>
                <span className="rounded-full bg-[#FFFBF5] px-3 py-1 text-xs font-black text-[#FB923C]">{stat.growth}</span>
              </div>
              <p className="mt-5 text-sm font-bold text-[#222222]/50">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-[#222222]">{stat.value}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-5 lg:gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-black/5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FB923C]">Analytics</p>
                <h2 className="mt-2 text-2xl font-black text-[#222222]">Monthly trips</h2>
              </div>
              <span className="rounded-full bg-[#FFFBF5] px-4 py-2 text-xs font-black text-[#FB923C]">2026</span>
            </div>
            <div className="mt-6 h-64 sm:h-72">
              {analyticsRows.length === 0 ? (
                <p className="rounded-2xl bg-[#FFFBF5] p-5 text-sm font-semibold text-[#222222]/60">Create trips to populate analytics.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsRows}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFFBF5" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="trips" fill="#FB923C" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-black/5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FB923C]">Budget overview</p>
            <h2 className="mt-2 text-2xl font-black text-[#222222]">Spending split</h2>
            <div className="mt-5 h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                  <Pie data={budgetRows} dataKey="value" innerRadius="52%" outerRadius="82%" paddingAngle={4}>
                    {budgetRows.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<BudgetTooltip totalSpent={budget.totalCost} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5 rounded-2xl bg-[#FFFBF5] p-4 text-sm font-bold text-[#FB923C]">
              You are on track! You have 66% of your budget remaining.
            </div>
          </section>
        </div>

        <section className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-black/5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FB923C]">Recent trips</p>
              <h2 className="mt-2 text-2xl font-black text-[#222222]">Travel activity</h2>
            </div>
            <Link to="/my-trips" className="text-sm font-black text-[#FB923C] hover:text-[#ea580c]">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {trips.slice(0, 4).map((trip) => (
              <div key={trip._id} className="grid gap-3 rounded-2xl border border-black/5 p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="flex items-center gap-3">
                  <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=80" alt="Trip" className="h-12 w-12 rounded-2xl object-cover" />
                  <div>
                    <p className="font-black text-[#222222]">{trip.title}</p>
                    <p className="text-sm text-[#222222]/45">{trip.startDate || 'Flexible dates'}</p>
                  </div>
                </div>
                <span className="w-fit rounded-full bg-[#FFFBF5] px-3 py-1 text-xs font-black uppercase text-[#FB923C]">{trip.status}</span>
                <span className="font-black text-[#222222]/75">{currencyFormat(trip.budget || 0)}</span>
              </div>
            ))}
            {trips.length === 0 && <p className="rounded-2xl bg-[#FFFBF5] p-5 text-sm font-semibold text-[#222222]/60">No trips yet. Create one in My Trips or Planner.</p>}
          </div>
        </section>
      </div>

      <aside className="grid min-w-0 content-start gap-5 lg:gap-6 2xl:sticky 2xl:top-24">
        <section className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-black/5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FB923C]">Upcoming trip</p>
          <div className="mt-4 overflow-hidden rounded-[1.7rem]">
            <img
              src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=700&q=90"
              alt="Upcoming trip destination"
              className="h-44 w-full object-cover"
            />
          </div>
          <h2 className="mt-5 text-2xl font-black text-[#222222]">{nextTrip?.title || 'Maldives escape'}</h2>
          <p className="mt-2 text-sm font-semibold text-[#222222]/45">{nextTrip?.startDate || '12 Aug - 18 Aug'} • 2 travelers</p>
          <div className="mt-5">
            <div className="flex justify-between text-xs font-black uppercase tracking-[0.16em] text-[#222222]/35">
              <span>Planning</span>
              <span>68%</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-[#FFFBF5]">
              <div className="h-3 w-[68%] rounded-full bg-[#FB923C]" />
            </div>
          </div>
          <Link to="/planner" className="mt-5 block rounded-2xl bg-[#FB923C] px-5 py-3 text-center text-sm font-black text-white">
            Continue planning
          </Link>
        </section>
      </aside>

      <section className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-black/5 sm:p-6 2xl:col-span-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FB923C]">Popular destinations</p>
            <h2 className="mt-2 text-2xl font-black text-[#222222]">Explore next</h2>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destinationCards.map((item) => {
            const isFavorite = favoriteDestinations.some((destination) => destination.name === item.name);

            return (
              <article key={item.name} className="group overflow-hidden rounded-[1.6rem] bg-[#FAFAF7] shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-44 overflow-hidden">
                  <Link
                    to="/destinations"
                    state={{ destination: item }}
                    aria-label={`Explore ${item.name}`}
                  >
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  </Link>
                  <button
                    className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full shadow-sm transition ${
                      isFavorite ? 'bg-[#FF7A59] text-white' : 'bg-white/90 text-[#FF7A59] hover:bg-[#FFFBF5]'
                    }`}
                    type="button"
                    onClick={() => toggleFavoriteDestination(item)}
                    aria-pressed={isFavorite}
                    aria-label={`${isFavorite ? 'Remove' : 'Favorite'} ${item.name}`}
                  >
                    {isFavorite ? '♥' : '♡'}
                  </button>
                </div>
                <div className="p-4">
                  <Link to="/destinations" state={{ destination: item }} className="font-black text-[#222222] hover:text-[#FB923C]">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm font-semibold text-[#222222]/45">{item.country}</p>
                  <Link
                    to="/my-trips"
                    state={{ destination: item }}
                    className="mt-4 inline-flex rounded-full bg-[#FFFBF5] px-4 py-2 text-xs font-black text-[#FB923C] transition hover:bg-[#FB923C] hover:text-white"
                  >
                    Plan this trip
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

export default DashboardPage;
