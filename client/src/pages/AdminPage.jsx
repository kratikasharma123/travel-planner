import { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { dateCell, statusColumn } from '../features/admin/adminColumns.jsx';
import {
  ADMIN_PERMISSIONS,
  getVisibleAdminTabs,
} from '../features/admin/adminConstants.js';
import AdminErrorState from '../features/admin/components/AdminErrorState.jsx';
import AdminStatusBadge from '../features/admin/components/AdminStatusBadge.jsx';
import AdminRecordSection from '../features/admin/sections/AdminRecordSection.jsx';
import OverviewSection from '../features/admin/sections/OverviewSection.jsx';
import UsersSection from '../features/admin/sections/UsersSection.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useAdmin } from '../hooks/useAdmin.js';
import { currencyFormat } from '../utils/budgetCalculations.js';

const tripColumns = [
  { key: 'title', label: 'Trip' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'budget', label: 'Budget', render: (row) => currencyFormat(row.budget || 0) },
  { key: 'traveler_count', label: 'Travelers' },
  statusColumn(),
];

const bookingColumns = [
  { key: 'booking_type', label: 'Type' },
  { key: 'title', label: 'Title' },
  { key: 'provider', label: 'Provider' },
  { key: 'reference_number', label: 'Reference' },
  { key: 'start_at', label: 'Date', render: (row) => dateCell(row.start_at) },
];

const aiColumns = [
  { key: 'request_type', label: 'Type' },
  statusColumn(),
  { key: 'token_estimate', label: 'Tokens' },
  { key: 'latency_ms', label: 'Latency', render: (row) => `${row.latency_ms || 0}ms` },
  { key: 'prompt', label: 'Prompt', render: (row) => (row.prompt || '—').slice(0, 80) },
  { key: 'created_at', label: 'Created', render: (row) => dateCell(row.created_at) },
];

const contentColumns = [
  { key: 'content_type', label: 'Type' },
  { key: 'title', label: 'Title' },
  statusColumn(),
  { key: 'updated_at', label: 'Updated', render: (row) => dateCell(row.updated_at) },
];

const notificationColumns = [
  { key: 'title', label: 'Title' },
  { key: 'channel', label: 'Channel' },
  statusColumn(),
  { key: 'scheduled_at', label: 'Scheduled', render: (row) => dateCell(row.scheduled_at) },
];

const ticketColumns = [
  { key: 'title', label: 'Title' },
  {
    key: 'priority',
    label: 'Priority',
    render: (row) => <AdminStatusBadge value={row.priority} />,
  },
  statusColumn(),
  { key: 'category', label: 'Category' },
  { key: 'created_at', label: 'Created', render: (row) => dateCell(row.created_at) },
];

const reviewColumns = [
  { key: 'rating', label: 'Rating', render: (row) => `${row.rating || 0}/5` },
  { key: 'comment', label: 'Comment', render: (row) => (row.comment || '—').slice(0, 100) },
  statusColumn(),
  { key: 'created_at', label: 'Created', render: (row) => dateCell(row.created_at) },
];

const settingColumns = [
  { key: 'category', label: 'Category' },
  { key: 'setting_key', label: 'Key' },
  {
    key: 'setting_value',
    label: 'Value',
    render: (row) => JSON.stringify(row.setting_value || {}).slice(0, 80),
  },
  { key: 'updated_at', label: 'Updated', render: (row) => dateCell(row.updated_at) },
];

const auditColumns = [
  { key: 'action', label: 'Action' },
  { key: 'entity_type', label: 'Entity' },
  { key: 'entity_id', label: 'Record' },
  { key: 'created_at', label: 'Created', render: (row) => row.created_at?.slice(0, 16) || '—' },
];

function ReportsSection({ users, trips, bookings, aiLogs, tickets, reviews }) {
  const rows = [
    { id: 'users', report: 'Users', count: users.length, status: 'ready' },
    { id: 'trips', report: 'Trips', count: trips.length, status: 'ready' },
    { id: 'bookings', report: 'Bookings', count: bookings.length, status: 'ready' },
    { id: 'ai', report: 'AI Usage', count: aiLogs.length, status: 'ready' },
    { id: 'support', report: 'Support Tickets', count: tickets.length, status: 'ready' },
    { id: 'reviews', report: 'Reviews', count: reviews.length, status: 'ready' },
  ];
  return (
    <AdminRecordSection
      eyebrow="Reports & analytics"
      title="Export-ready reports"
      description="CSV exports are available now. PDF and Excel can be enabled later with provider/package configuration."
      table="admin_audit_logs"
      rows={rows}
      columns={[
        { key: 'report', label: 'Report' },
        { key: 'count', label: 'Records' },
        statusColumn(),
      ]}
      searchFields={['report', 'status']}
      filename="admin-reports"
      updateRecord={() => Promise.resolve()}
      deleteRecord={() => Promise.resolve()}
      isMutating={false}
      writePermission={ADMIN_PERMISSIONS.REPORTS_READ}
      hideActions
    />
  );
}

const ADMIN_ROUTE_TAB_MAP = {
  users: 'users',
  trips: 'trips',
  destinations: 'content',
  bookings: 'bookings',
  budgets: 'reports',
  'ai-conversations': 'ai',
};

function AdminPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const visibleTabs = useMemo(() => getVisibleAdminTabs(user), [user]);
  const pathSegment = location.pathname.replace(/^\/admin\/?/, '').split('/')[0];
  const routeTab = ADMIN_ROUTE_TAB_MAP[pathSegment] || pathSegment;
  const requestedTab = routeTab || searchParams.get('tab');
  const activeTab = visibleTabs.some((tab) => tab.key === requestedTab)
    ? requestedTab
    : visibleTabs[0]?.key || 'overview';
  const admin = useAdmin();
  const {
    users,
    trips,
    bookings,
    aiLogs,
    tickets,
    reviews,
    notifications,
    auditLogs,
    contentItems,
    settings,
    metrics,
    isLoading,
    isMutating,
    error,
    refreshAdmin,
    updateUser,
    updateRecord,
    deleteRecord,
    createRecord,
  } = admin;

  return (
    <section className="space-y-6">
      {(isLoading || error) && (
        <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40">
          {isLoading && <p className="text-sm font-bold text-stone-600">Loading admin data...</p>}
          <AdminErrorState message={error} onRetry={refreshAdmin} />
        </div>
      )}

      {activeTab === 'overview' && (
        <OverviewSection
          users={users}
          trips={trips}
          bookings={bookings}
          aiLogs={aiLogs}
          tickets={tickets}
          reviews={reviews}
          notifications={notifications}
          auditLogs={auditLogs}
          metrics={metrics}
        />
      )}
      {activeTab === 'users' && (
        <UsersSection users={users} updateUser={updateUser} isMutating={isMutating} />
      )}
      {activeTab === 'trips' && (
        <AdminRecordSection
          eyebrow="Trip management"
          title="Trips"
          description="Approve, archive, and manage user-created travel plans."
          table="trips"
          rows={trips}
          columns={tripColumns}
          searchFields={['title', 'city', 'country', 'status']}
          filterOptions={['draft', 'saved', 'active', 'completed', 'archived']}
          statusOptions={['draft', 'saved', 'active', 'completed', 'archived']}
          filename="admin-trips"
          writePermission={ADMIN_PERMISSIONS.TRIPS_WRITE}
          updateRecord={updateRecord}
          deleteRecord={deleteRecord}
          createRecord={createRecord}
          isMutating={isMutating}
        />
      )}
      {activeTab === 'bookings' && (
        <AdminRecordSection
          eyebrow="Booking management"
          title="Bookings"
          description="Manage flights, hotels, activities, and transportation records."
          table="trip_bookings"
          rows={bookings}
          columns={bookingColumns}
          searchFields={['booking_type', 'title', 'provider', 'reference_number']}
          filterKey="booking_type"
          filterOptions={['flight', 'hotel', 'activity', 'transport']}
          filename="admin-bookings"
          writePermission={ADMIN_PERMISSIONS.BOOKINGS_WRITE}
          updateRecord={updateRecord}
          deleteRecord={deleteRecord}
          createRecord={createRecord}
          isMutating={isMutating}
        />
      )}
      {activeTab === 'ai' && (
        <AdminRecordSection
          eyebrow="AI assistant management"
          title="AI usage logs"
          description="Monitor prompts, token estimates, latency, and failed assistant requests."
          table="ai_usage_logs"
          rows={aiLogs}
          columns={aiColumns}
          searchFields={['request_type', 'status', 'prompt', 'error']}
          filterOptions={['success', 'failed']}
          filename="admin-ai-usage"
          writePermission={ADMIN_PERMISSIONS.AI_WRITE}
          updateRecord={updateRecord}
          deleteRecord={deleteRecord}
          createRecord={createRecord}
          isMutating={isMutating}
        />
      )}
      {activeTab === 'content' && (
        <AdminRecordSection
          eyebrow="Content management"
          title="Content items"
          description="Manage destinations, guides, blogs, FAQs, testimonials, promotions, banners, and categories."
          table="content_items"
          rows={contentItems}
          columns={contentColumns}
          searchFields={['content_type', 'title', 'status']}
          filterKey="content_type"
          filterOptions={['guide', 'blog', 'faq', 'testimonial', 'promotion', 'banner', 'category']}
          statusOptions={['draft', 'published', 'archived']}
          filename="admin-content"
          writePermission={ADMIN_PERMISSIONS.CONTENT_WRITE}
          updateRecord={updateRecord}
          deleteRecord={deleteRecord}
          createRecord={createRecord}
          isMutating={isMutating}
        />
      )}
      {activeTab === 'reports' && (
        <ReportsSection
          users={users}
          trips={trips}
          bookings={bookings}
          aiLogs={aiLogs}
          tickets={tickets}
          reviews={reviews}
        />
      )}
      {activeTab === 'notifications' && (
        <AdminRecordSection
          eyebrow="Notification center"
          title="Notifications"
          description="Create, schedule, send, and track push, email, and in-app notification records."
          table="admin_notifications"
          rows={notifications}
          columns={notificationColumns}
          searchFields={['title', 'message', 'channel', 'status']}
          filterKey="channel"
          filterOptions={['push', 'email', 'in-app']}
          statusOptions={['draft', 'scheduled', 'sent', 'failed']}
          filename="admin-notifications"
          writePermission={ADMIN_PERMISSIONS.NOTIFICATIONS_WRITE}
          updateRecord={updateRecord}
          deleteRecord={deleteRecord}
          createRecord={createRecord}
          isMutating={isMutating}
        />
      )}
      {activeTab === 'support' && (
        <AdminRecordSection
          eyebrow="Support ticket system"
          title="Tickets"
          description="Assign, prioritize, and resolve user support requests."
          table="support_tickets"
          rows={tickets}
          columns={ticketColumns}
          searchFields={['title', 'message', 'status', 'priority', 'category']}
          filterOptions={['open', 'pending', 'resolved', 'closed']}
          statusOptions={['open', 'pending', 'resolved', 'closed']}
          filename="admin-support-tickets"
          writePermission={ADMIN_PERMISSIONS.SUPPORT_WRITE}
          updateRecord={updateRecord}
          deleteRecord={deleteRecord}
          createRecord={createRecord}
          isMutating={isMutating}
        />
      )}
      {activeTab === 'reviews' && (
        <AdminRecordSection
          eyebrow="Review moderation"
          title="Reviews"
          description="Approve, reject, delete, and report user reviews and ratings."
          table="reviews"
          rows={reviews}
          columns={reviewColumns}
          searchFields={['comment', 'status', 'moderation_notes']}
          filterOptions={['pending', 'approved', 'rejected', 'reported']}
          statusOptions={['pending', 'approved', 'rejected', 'reported']}
          filename="admin-reviews"
          writePermission={ADMIN_PERMISSIONS.REVIEWS_WRITE}
          updateRecord={updateRecord}
          deleteRecord={deleteRecord}
          createRecord={createRecord}
          isMutating={isMutating}
        />
      )}
      {activeTab === 'settings' && (
        <AdminRecordSection
          eyebrow="Settings panel"
          title="System, AI, email, security, and storage settings"
          description="Store provider-independent configuration records. Secrets such as AI or SMTP keys must stay outside the public client."
          table="admin_settings"
          rows={settings}
          columns={settingColumns}
          searchFields={['category', 'setting_key']}
          filterKey="category"
          filterOptions={['system', 'ai', 'email', 'security', 'storage']}
          filename="admin-settings"
          writePermission={ADMIN_PERMISSIONS.SETTINGS_WRITE}
          updateRecord={updateRecord}
          deleteRecord={deleteRecord}
          createRecord={createRecord}
          isMutating={isMutating}
        />
      )}
      {activeTab === 'audit' && (
        <AdminRecordSection
          eyebrow="Audit logs"
          title="Admin actions"
          description="Track logins, admin changes, deleted records, failed operations, and API errors where available."
          table="admin_audit_logs"
          rows={auditLogs}
          columns={auditColumns}
          searchFields={['action', 'entity_type', 'entity_id']}
          filterKey="entity_type"
          filename="admin-audit-logs"
          writePermission={ADMIN_PERMISSIONS.AUDIT_READ}
          updateRecord={updateRecord}
          deleteRecord={deleteRecord}
          createRecord={createRecord}
          isMutating={isMutating}
          hideActions
        />
      )}
    </section>
  );
}

export default AdminPage;
