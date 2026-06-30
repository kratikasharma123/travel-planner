import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import TripStatCard from '../features/travelAssistant/components/TripStatCard.jsx';
import WeatherMapPanels from '../features/travelAssistant/components/WeatherMapPanels.jsx';
import { useTripDashboard } from '../hooks/useTripDashboard.js';
import { currencyFormat } from '../utils/budgetCalculations.js';

function DashboardPage() {
  const { trips, weather, summary, analyticsRows, isLoading, error } = useTripDashboard();
  const budget = summary.budgetSummary;

  return (
    <section className="page-stack">
      <div className="app-card">
        <p className="section-eyebrow">Travel dashboard</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Your AI travel workspace</h1>
            <p className="section-description">Track trips, budgets, weather, alerts, and recent travel activity from one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/planner" className="btn-primary">Plan trip</Link>
            <Link to="/assistant" className="btn-secondary">Ask AI</Link>
          </div>
        </div>
        {error && <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
        {isLoading && <p className="mt-4 text-sm text-slate-600">Loading dashboard...</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TripStatCard label="Upcoming Trips" value={summary.upcoming.length} icon="🧳" helper="Trips starting soon" />
        <TripStatCard label="Active Trips" value={summary.active.length} icon="✈️" helper="Currently in progress" />
        <TripStatCard label="Completed Trips" value={summary.completed.length} icon="✅" helper="Finished or archived" />
        <TripStatCard label="Days Until Departure" value={summary.daysUntilDeparture ?? '—'} icon="📅" helper={summary.nextTrip?.title || 'No upcoming trip'} />
        <TripStatCard label="Total Budget" value={currencyFormat(budget.totalBudget)} icon="💼" />
        <TripStatCard label="Total Expenses" value={currencyFormat(budget.totalCost)} icon="💳" />
        <TripStatCard label="Remaining" value={currencyFormat(budget.remainingBudget)} icon="💵" />
        <TripStatCard label="Utilization" value={`${budget.utilization.toFixed(1)}%`} icon="📊" />
      </div>

      <section className="app-card">
        <p className="section-eyebrow">Dashboard analytics</p>
        <h2 className="section-title">Monthly trips</h2>
        <div className="mt-5 h-72">
          {analyticsRows.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">Create trips to populate analytics.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="trips" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="app-card">
        <p className="section-eyebrow">Recent activities</p>
        <h2 className="section-title">Trip timeline</h2>
        <div className="mt-5 grid gap-3">
          {trips.slice(0, 5).map((trip) => <div key={trip._id} className="rounded-2xl bg-slate-50 p-4 text-sm"><span className="font-bold text-slate-950">{trip.title}</span><span className="text-slate-600"> • {trip.status} • {trip.startDate || 'Flexible dates'}</span></div>)}
          {trips.length === 0 && <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">No trips yet. Create one in My Trips or Planner.</p>}
        </div>
      </section>

      <WeatherMapPanels weather={weather} locations={[]} />
    </section>
  );
}

export default DashboardPage;
