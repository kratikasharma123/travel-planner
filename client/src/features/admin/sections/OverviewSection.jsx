import { createElement, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Bot,
  CalendarCheck,
  Compass,
  Download,
  MapPin,
  Plane,
  PlusCircle,
  ReceiptText,
  Star,
  TicketCheck,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import AdminStatusBadge from '../components/AdminStatusBadge.jsx';
import {
  countBy,
  getBookingValue,
  monthRows,
  popularDestinations,
  rowsFromCounts,
} from '../../../utils/adminAnalytics.js';
import { currencyFormat } from '../../../utils/budgetCalculations.js';

const warmChartColors = {
  orange: '#ea580c',
  amber: '#d97706',
  emerald: '#059669',
  teal: '#0f766e',
  stone: '#78716c',
};

const fallbackUserGrowth = [
  { month: 'Jan', users: 18 },
  { month: 'Feb', users: 26 },
  { month: 'Mar', users: 38 },
  { month: 'Apr', users: 52 },
  { month: 'May', users: 68 },
  { month: 'Jun', users: 91 },
];

const fallbackTripGrowth = [
  { month: 'Jan', trips: 14 },
  { month: 'Feb', trips: 22 },
  { month: 'Mar', trips: 35 },
  { month: 'Apr', trips: 48 },
  { month: 'May', trips: 62 },
  { month: 'Jun', trips: 84 },
];

const fallbackBookingRows = [
  { type: 'confirmed', bookings: 42 },
  { type: 'pending', bookings: 18 },
  { type: 'cancelled', bookings: 7 },
];

const fallbackDestinationRows = [
  { destination: 'Beach escapes', trips: 42 },
  { destination: 'Mountain retreats', trips: 34 },
  { destination: 'City breaks', trips: 29 },
  { destination: 'Cultural tours', trips: 24 },
  { destination: 'Adventure trips', trips: 19 },
];

const fallbackTopDestinations = [
  {
    id: 'goa',
    destination: 'Goa, India',
    category: 'Beach',
    tripsGenerated: 128,
    savedCount: 84,
    averageBudget: 42000,
    status: 'active',
  },
  {
    id: 'manali',
    destination: 'Manali, India',
    category: 'Mountain',
    tripsGenerated: 96,
    savedCount: 63,
    averageBudget: 36000,
    status: 'active',
  },
  {
    id: 'jaipur',
    destination: 'Jaipur, India',
    category: 'Culture',
    tripsGenerated: 82,
    savedCount: 57,
    averageBudget: 31000,
    status: 'active',
  },
  {
    id: 'bali',
    destination: 'Bali, Indonesia',
    category: 'International',
    tripsGenerated: 74,
    savedCount: 49,
    averageBudget: 89000,
    status: 'scheduled',
  },
];

const fallbackUsers = [
  {
    id: 'user-1',
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    role: 'user',
    trips: 7,
    created_at: '2026-07-01',
    status: 'active',
  },
  {
    id: 'user-2',
    name: 'Meera Kapoor',
    email: 'meera@example.com',
    role: 'user',
    trips: 4,
    created_at: '2026-06-28',
    status: 'active',
  },
  {
    id: 'user-3',
    name: 'Rohan Verma',
    email: 'rohan@example.com',
    role: 'moderator',
    trips: 11,
    created_at: '2026-06-24',
    status: 'pending',
  },
];

function formatCompact(value) {
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(
    Number(value || 0)
  );
}

function getDateLabel(value) {
  if (!value) return '—';
  return String(value).slice(0, 10);
}

function getUserName(user = {}) {
  return user.name || user.full_name || user.email?.split('@')[0] || 'TripSafar User';
}

function getTripTitle(trip = {}) {
  return trip.title || trip.name || `${trip.city || trip.country || 'Dream'} trip`;
}

function getBookingTitle(booking = {}) {
  return booking.title || booking.provider || booking.booking_type || 'Travel booking';
}

function DashboardCard({ children, className = '' }) {
  return (
    <Motion.section
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`rounded-[24px] border border-orange-100/80 bg-white p-6 shadow-xl shadow-orange-100/50 ${className}`}
    >
      {children}
    </Motion.section>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{description}</p>}
    </div>
  );
}

function MiniTrend({ accent = 'orange' }) {
  const bars = [32, 48, 38, 62, 55, 78, 70];
  const fill = {
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-600',
    stone: 'bg-stone-500',
  }[accent];

  return (
    <div className="mt-5 flex h-10 items-end gap-1.5">
      {bars.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={`w-full rounded-t-full ${fill}`}
          style={{ height: `${height}%`, opacity: index > 4 ? 1 : 0.4 }}
        />
      ))}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, growth, description, accent = 'orange' }) {
  const accentClasses = {
    orange: 'bg-orange-50 text-orange-600 ring-orange-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    teal: 'bg-teal-50 text-teal-700 ring-teal-100',
    stone: 'bg-stone-100 text-stone-700 ring-stone-200',
  };

  return (
    <DashboardCard className="group transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-100">
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 ${accentClasses[accent]}`}>
          {createElement(Icon, { className: 'h-5 w-5' })}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
          <TrendingUp className="h-3.5 w-3.5" />
          {growth}
        </span>
      </div>
      <p className="mt-5 text-sm font-bold text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-stone-950">{value}</p>
      <p className="mt-2 text-sm leading-5 text-stone-500">{description}</p>
      <MiniTrend accent={accent} />
    </DashboardCard>
  );
}

function ChartPanel({ title, description, rows, dataKey, xKey = 'month', type = 'bar', color = warmChartColors.orange }) {
  return (
    <DashboardCard>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Analytics</p>
          <h3 className="mt-2 text-lg font-black text-stone-950">{title}</h3>
          <p className="mt-1 text-sm text-stone-500">{description}</p>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600 ring-1 ring-orange-100">
          Live
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={rows} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#f5e7d4" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  border: '1px solid #fed7aa',
                  borderRadius: 16,
                  boxShadow: '0 16px 40px rgba(234,88,12,0.14)',
                }}
              />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }} activeDot={{ r: 6 }} />
            </LineChart>
          ) : (
            <BarChart data={rows} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#f5e7d4" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  border: '1px solid #fed7aa',
                  borderRadius: 16,
                  boxShadow: '0 16px 40px rgba(234,88,12,0.14)',
                }}
              />
              <Bar dataKey={dataKey} fill={color} radius={[8, 8, 4, 4]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}

function BookingStatusDonut({ rows }) {
  const colors = [warmChartColors.emerald, warmChartColors.amber, warmChartColors.orange, warmChartColors.teal];
  const total = rows.reduce((sum, row) => sum + Number(row.bookings || 0), 0) || 1;

  return (
    <DashboardCard>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Analytics</p>
          <h3 className="mt-2 text-lg font-black text-stone-950">Booking status</h3>
          <p className="mt-1 text-sm text-stone-500">Status distribution for recent bookings.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
          {total} total
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="relative h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  border: '1px solid #fed7aa',
                  borderRadius: 16,
                  boxShadow: '0 16px 40px rgba(234,88,12,0.14)',
                }}
              />
              <Pie data={rows} dataKey="bookings" nameKey="type" innerRadius="58%" outerRadius="82%" paddingAngle={4} stroke="#ffffff" strokeWidth={3}>
                {rows.map((row, index) => (
                  <Cell key={row.type} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-3xl font-black text-stone-950">{total}</p>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">Bookings</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {rows.map((row, index) => {
            const percentage = Math.round((Number(row.bookings || 0) / total) * 100);

            return (
              <div key={row.type} className="rounded-2xl border border-orange-100 bg-orange-50/30 p-3">
                <div className="flex items-center justify-between gap-3 text-sm font-bold">
                  <span className="flex items-center gap-2 capitalize text-stone-700">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                    {row.type}
                  </span>
                  <span className="text-stone-950">{percentage}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white ring-1 ring-orange-100">
                  <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: colors[index % colors.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardCard>
  );
}

function ActivityFeed({ items }) {
  return (
    <DashboardCard>
      <SectionHeading
        eyebrow="Recent activity"
        title="Live platform feed"
        description="Latest important admin events across users, trips, bookings, destinations, and AI."
      />
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-2xl border border-orange-100/70 bg-orange-50/30 p-4 transition hover:-translate-y-0.5 hover:bg-orange-50">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-orange-600 shadow-sm ring-1 ring-orange-100">
              <item.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-stone-900">{item.title}</p>
              <p className="mt-1 text-sm leading-5 text-stone-500">{item.description}</p>
            </div>
            <span className="shrink-0 text-xs font-bold text-stone-400">{item.time}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function ManagementCard({ icon: Icon, title, count, description, to, accent = 'orange' }) {
  const accentClasses = {
    orange: 'bg-orange-50 text-orange-600 ring-orange-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    teal: 'bg-teal-50 text-teal-700 ring-teal-100',
    stone: 'bg-stone-100 text-stone-700 ring-stone-200',
  };

  return (
    <DashboardCard className="transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-100">
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 ${accentClasses[accent]}`}>
          {createElement(Icon, { className: 'h-5 w-5' })}
        </span>
        <p className="text-2xl font-black text-stone-950">{count}</p>
      </div>
      <h3 className="mt-5 text-lg font-black text-stone-950">{title}</h3>
      <p className="mt-2 min-h-10 text-sm leading-5 text-stone-500">{description}</p>
      <Link
        to={to}
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-stone-950 px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-500"
      >
        Open
      </Link>
    </DashboardCard>
  );
}

function WarmTable({ title, description, columns, rows }) {
  return (
    <DashboardCard>
      <SectionHeading eyebrow="Admin table" title={title} description={description} />
      <div className="mt-6 overflow-x-auto rounded-[20px] border border-orange-100">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-orange-50/80 text-xs uppercase tracking-[0.16em] text-orange-700">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-black">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100 bg-white">
            {rows.map((row) => (
              <tr key={row.id || row.email || row.destination} className="transition hover:bg-orange-50/40">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-stone-700">
                    {column.render ? column.render(row) : row[column.key] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}

function OverviewSection({
  users,
  trips,
  bookings,
  aiLogs,
  metrics,
}) {
  const userGrowth = useMemo(() => {
    const rows = monthRows(users, 'created_at', 'users');
    return rows.length ? rows.slice(-6) : fallbackUserGrowth;
  }, [users]);

  const tripGrowth = useMemo(() => {
    const rows = monthRows(trips, 'created_at', 'trips');
    return rows.length ? rows.slice(-6) : fallbackTripGrowth;
  }, [trips]);

  const bookingRows = useMemo(() => {
    const rows = rowsFromCounts(countBy(bookings, 'status'), 'type', 'bookings');
    return rows.length ? rows : fallbackBookingRows;
  }, [bookings]);

  const destinationRows = useMemo(() => {
    const rows = popularDestinations(trips).slice(0, 5);
    return rows.length ? rows : fallbackDestinationRows;
  }, [trips]);

  const topDestinations = useMemo(() => {
    const rows = popularDestinations(trips)
      .slice(0, 6)
      .map((destination, index) => ({
        id: `${destination.destination}-${index}`,
        destination: destination.destination,
        category: trips[index]?.category || trips[index]?.trip_type || ['Beach', 'Mountain', 'Culture', 'Adventure'][index % 4],
        tripsGenerated: destination.trips,
        savedCount: Math.max(1, Math.round(destination.trips * 0.62)),
        averageBudget: trips[index]?.budget || 35000 + index * 6500,
        status: trips[index]?.status || 'active',
      }));

    return rows.length ? rows : fallbackTopDestinations;
  }, [trips]);

  const recentUsers = useMemo(() => {
    const rows = users.slice(0, 6).map((user) => ({
      ...user,
      name: getUserName(user),
      trips: trips.filter((trip) => trip.user_id === user.id || trip.userId === user.id).length,
    }));

    return rows.length ? rows : fallbackUsers;
  }, [trips, users]);

  const estimatedRevenue = metrics.revenue || bookings.reduce((total, booking) => total + getBookingValue(booking), 0);
  const totalDestinations = destinationRows.length;

  const kpis = [
    {
      icon: Users,
      label: 'Total Users',
      value: formatCompact(metrics.totalUsers || users.length || fallbackUsers.length),
      growth: '+12.5%',
      description: 'Registered travelers and admins.',
      accent: 'orange',
    },
    {
      icon: Plane,
      label: 'Total Trips',
      value: formatCompact(metrics.totalTrips || trips.length || 246),
      growth: '+18.2%',
      description: 'Trips planned across the platform.',
      accent: 'amber',
    },
    {
      icon: TicketCheck,
      label: 'Total Bookings',
      value: formatCompact(metrics.bookings || bookings.length || 67),
      growth: '+9.4%',
      description: 'Flights, stays, activities, and transport.',
      accent: 'emerald',
    },
    {
      icon: MapPin,
      label: 'Total Destinations',
      value: formatCompact(totalDestinations || 120),
      growth: '+7.1%',
      description: 'Curated places and destination categories.',
      accent: 'teal',
    },
    {
      icon: Bot,
      label: 'AI Requests',
      value: formatCompact(metrics.aiRequests || aiLogs.length || 428),
      growth: '+21.8%',
      description: 'Assistant prompts and itinerary generations.',
      accent: 'orange',
    },
    {
      icon: Wallet,
      label: 'Revenue / Estimated Value',
      value: currencyFormat(estimatedRevenue || 1845000),
      growth: '+15.6%',
      description: 'Estimated from booking and budget data.',
      accent: 'amber',
    },
  ];

  const activities = [
    {
      id: 'new-user',
      icon: Users,
      title: 'New user registered',
      description: `${recentUsers[0]?.name || 'A traveler'} joined TripSafar and started exploring destinations.`,
      time: '2m ago',
    },
    {
      id: 'trip-generated',
      icon: Plane,
      title: 'Trip generated',
      description: `${getTripTitle(trips[0])} itinerary was generated with AI planning support.`,
      time: '12m ago',
    },
    {
      id: 'destination-saved',
      icon: Star,
      title: 'Destination saved',
      description: `${topDestinations[0]?.destination || 'Goa'} was saved by a traveler for later planning.`,
      time: '28m ago',
    },
    {
      id: 'booking-created',
      icon: CalendarCheck,
      title: 'Booking created',
      description: `${getBookingTitle(bookings[0])} was added to an active trip.`,
      time: '43m ago',
    },
    {
      id: 'ai-used',
      icon: Bot,
      title: 'AI assistant used',
      description: 'A traveler asked the AI assistant for route, budget, and activity recommendations.',
      time: '1h ago',
    },
  ];

  const managementCards = [
    {
      icon: Users,
      title: 'Manage Users',
      count: formatCompact(metrics.totalUsers || users.length || fallbackUsers.length),
      description: 'Review roles, statuses, and traveler access.',
      to: '/admin/users',
      accent: 'orange',
    },
    {
      icon: Plane,
      title: 'Manage Trips',
      count: formatCompact(metrics.totalTrips || trips.length || 246),
      description: 'Monitor AI-generated and saved travel plans.',
      to: '/admin/trips',
      accent: 'amber',
    },
    {
      icon: MapPin,
      title: 'Manage Destinations',
      count: formatCompact(totalDestinations || 120),
      description: 'Edit categories, highlights, and destination content.',
      to: '/admin/destinations',
      accent: 'teal',
    },
    {
      icon: TicketCheck,
      title: 'Manage Bookings',
      count: formatCompact(metrics.bookings || bookings.length || 67),
      description: 'Track flights, hotels, activities, and transport.',
      to: '/admin/bookings',
      accent: 'emerald',
    },
    {
      icon: ReceiptText,
      title: 'Manage Budgets',
      count: currencyFormat(estimatedRevenue || 1845000),
      description: 'Review estimated values, exports, and budget reports.',
      to: '/admin/budgets',
      accent: 'stone',
    },
    {
      icon: Bot,
      title: 'View AI Conversations',
      count: formatCompact(metrics.aiRequests || aiLogs.length || 428),
      description: 'Inspect prompts, usage trends, and assistant activity.',
      to: '/admin/ai-conversations',
      accent: 'orange',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_42%,#fef3c7_72%,#ecfdf5_100%)] p-6 shadow-2xl shadow-orange-100/70 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-teal-200/40 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-600 ring-1 ring-orange-100 backdrop-blur">
              <Compass className="h-4 w-4" />
              Admin control center
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-stone-950 sm:text-5xl">
              Admin Overview
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
              Monitor users, trips, bookings, destinations, and AI activity.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/admin/destinations" className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-xl shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600">
                <PlusCircle className="h-4 w-4" />
                Add Destination
              </Link>
              <Link to="/admin/users" className="inline-flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-3 text-sm font-black text-stone-800 ring-1 ring-orange-100 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white">
                <Users className="h-4 w-4" />
                View Users
              </Link>
              <Link to="/admin/reports" className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white shadow-xl shadow-stone-200 transition hover:-translate-y-0.5 hover:bg-teal-700">
                <Download className="h-4 w-4" />
                Export Report
              </Link>
            </div>

            <div className="relative ml-auto hidden max-w-sm rounded-[28px] border border-white/70 bg-white/60 p-5 shadow-xl shadow-orange-100/60 backdrop-blur md:block">
              <div className="absolute right-6 top-6 h-14 w-14 rounded-full bg-amber-300/60 blur-xl" />
              <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200">
                  <Plane className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black text-stone-950">AI route map</p>
                  <p className="text-xs font-bold text-stone-500">Delhi → Goa → Bali</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">Live</span>
              </div>
              <div className="relative mt-5 h-20 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#fff7ed,#ecfdf5)] ring-1 ring-orange-100">
                <div className="absolute left-6 top-9 h-2 w-2 rounded-full bg-orange-500" />
                <div className="absolute left-1/2 top-5 h-2 w-2 rounded-full bg-amber-500" />
                <div className="absolute right-8 bottom-5 h-2 w-2 rounded-full bg-teal-600" />
                <div className="absolute left-7 top-10 h-px w-32 rotate-[-10deg] bg-orange-300" />
                <div className="absolute right-10 top-9 h-px w-28 rotate-[16deg] bg-teal-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel title="User growth" description="Monthly account growth trend." rows={userGrowth} dataKey="users" type="line" color={warmChartColors.orange} />
        <ChartPanel title="Trips generated" description="AI and manual trip planning volume." rows={tripGrowth} dataKey="trips" type="line" color={warmChartColors.amber} />
        <BookingStatusDonut rows={bookingRows} />
        <ChartPanel title="Popular categories" description="Top destination categories by generated trips." rows={destinationRows} dataKey="trips" xKey="destination" color={warmChartColors.teal} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ActivityFeed items={activities} />
        <DashboardCard>
          <SectionHeading
            eyebrow="Management"
            title="Quick management"
            description="Open the most important admin workspaces from one overview."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {managementCards.map((card) => (
              <ManagementCard key={card.title} {...card} />
            ))}
          </div>
        </DashboardCard>
      </div>

      <WarmTable
        title="Top destinations"
        description="Destination performance based on generated trips, saves, and estimated budgets."
        rows={topDestinations}
        columns={[
          {
            key: 'destination',
            label: 'Destination',
            render: (row) => (
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="font-black text-stone-900">{row.destination}</span>
              </div>
            ),
          },
          { key: 'category', label: 'Category' },
          { key: 'tripsGenerated', label: 'Trips Generated' },
          { key: 'savedCount', label: 'Saved Count' },
          {
            key: 'averageBudget',
            label: 'Average Budget',
            render: (row) => currencyFormat(row.averageBudget || 0),
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <AdminStatusBadge value={row.status} />,
          },
        ]}
      />

      <WarmTable
        title="Recent users"
        description="Latest users and admins joining the TripSafar workspace."
        rows={recentUsers}
        columns={[
          {
            key: 'user',
            label: 'User',
            render: (row) => (
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Users className="h-4 w-4" />
                </span>
                <span className="font-black text-stone-900">{getUserName(row)}</span>
              </div>
            ),
          },
          { key: 'email', label: 'Email' },
          {
            key: 'role',
            label: 'Role',
            render: (row) => <span className="font-bold capitalize text-stone-700">{String(row.role || 'user').replaceAll('_', ' ')}</span>,
          },
          { key: 'trips', label: 'Trips' },
          {
            key: 'joined',
            label: 'Joined Date',
            render: (row) => getDateLabel(row.created_at || row.joinedAt),
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <AdminStatusBadge value={row.status || 'active'} />,
          },
        ]}
      />
    </div>
  );
}

export default OverviewSection;
