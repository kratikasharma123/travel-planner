import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AdminSection from '../components/AdminSection.jsx';
import AdminStatCard from '../components/AdminStatCard.jsx';
import AdminTable from '../components/AdminTable.jsx';
import AdminStatusBadge from '../components/AdminStatusBadge.jsx';
import {
  countBy,
  dayRows,
  getBookingValue,
  monthRows,
  popularDestinations,
  rowsFromCounts,
} from '../../../utils/adminAnalytics.js';
import { currencyFormat } from '../../../utils/budgetCalculations.js';

function ChartPanel({ title, rows, dataKey, type = 'bar', xKey = 'month' }) {
  return (
    <AdminSection eyebrow="Analytics" title={title}>
      <div className="h-72">
        {rows.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey={dataKey} stroke="#06b6d4" strokeWidth={3} />
              </LineChart>
            ) : (
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Bar dataKey={dataKey} fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </AdminSection>
  );
}

function OverviewSection({
  users,
  trips,
  bookings,
  aiLogs,
  tickets,
  reviews,
  notifications,
  auditLogs,
  metrics,
}) {
  const userGrowth = useMemo(() => monthRows(users, 'created_at', 'users'), [users]);
  const tripGrowth = useMemo(() => monthRows(trips, 'created_at', 'trips'), [trips]);
  const aiUsage = useMemo(() => dayRows(aiLogs, 'created_at', 'requests'), [aiLogs]);
  const bookingRows = useMemo(
    () => rowsFromCounts(countBy(bookings, 'booking_type'), 'type', 'bookings'),
    [bookings]
  );
  const destinationRows = useMemo(() => popularDestinations(trips).slice(0, 8), [trips]);
  const revenueRows = useMemo(
    () =>
      monthRows(bookings, 'created_at', 'bookings').map((row) => ({
        ...row,
        revenue: bookings
          .filter((booking) => (booking.created_at || '').startsWith(row.month))
          .reduce((total, booking) => total + getBookingValue(booking), 0),
      })),
    [bookings]
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Total Users" value={metrics.totalUsers} icon="👥" />
        <AdminStatCard label="Active Users" value={metrics.activeUsers} icon="✅" />
        <AdminStatCard label="Trips" value={metrics.totalTrips} icon="🧳" />
        <AdminStatCard label="Bookings" value={metrics.bookings} icon="🎫" />
        <AdminStatCard
          label="Revenue"
          value={currencyFormat(metrics.revenue)}
          icon="💰"
          helper="Estimated from booking details"
        />
        <AdminStatCard label="AI Requests" value={metrics.aiRequests} icon="🤖" />
        <AdminStatCard label="Pending Reviews" value={metrics.pendingReviews} icon="⭐" />
        <AdminStatCard label="Support Tickets" value={metrics.supportTickets} icon="🎧" />
        <AdminStatCard label="Reports" value={metrics.reports} icon="📄" />
        <AdminStatCard label="Notifications" value={metrics.notifications} icon="🔔" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel title="User growth" rows={userGrowth} dataKey="users" />
        <ChartPanel title="Revenue trend" rows={revenueRows} dataKey="revenue" type="line" />
        <ChartPanel title="Daily AI usage" rows={aiUsage} dataKey="requests" xKey="day" />
        <ChartPanel title="Booking analytics" rows={bookingRows} dataKey="bookings" xKey="type" />
        <ChartPanel title="Monthly trips" rows={tripGrowth} dataKey="trips" />
        <ChartPanel
          title="Popular destinations"
          rows={destinationRows}
          dataKey="trips"
          xKey="destination"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSection eyebrow="Recent activity" title="Latest registrations">
          <AdminTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'role', label: 'Role' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <AdminStatusBadge value={row.status} />,
              },
              {
                key: 'created_at',
                label: 'Registered',
                render: (row) => row.created_at?.slice(0, 10) || '—',
              },
            ]}
            rows={users.slice(0, 8)}
          />
        </AdminSection>
        <AdminSection eyebrow="Recent activity" title="Support and reviews">
          <AdminTable
            columns={[
              {
                key: 'title',
                label: 'Item',
                render: (row) => row.title || row.comment || row.action || 'Activity',
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <AdminStatusBadge value={row.status || row.action} />,
              },
              {
                key: 'created_at',
                label: 'Created',
                render: (row) => row.created_at?.slice(0, 10) || '—',
              },
            ]}
            rows={[...tickets, ...reviews, ...notifications, ...auditLogs]
              .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
              .slice(0, 8)}
          />
        </AdminSection>
      </div>
    </>
  );
}

export default OverviewSection;
