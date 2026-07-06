import { useMemo, useState } from 'react';
import { useLocation, useOutletContext, useSearchParams } from 'react-router-dom';
import { dateCell, statusColumn } from '../features/admin/adminColumns.jsx';
import {
  ADMIN_PERMISSIONS,
  getVisibleAdminTabs,
} from '../features/admin/adminConstants.js';
import AdminErrorState from '../features/admin/components/AdminErrorState.jsx';
import AdminRecordSection from '../features/admin/sections/AdminRecordSection.jsx';
import OverviewSection from '../features/admin/sections/OverviewSection.jsx';
import UsersSection from '../features/admin/sections/UsersSection.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useAdmin } from '../hooks/useAdmin.js';
import { downloadCsv } from '../utils/adminExport.js';
import { currencyFormat } from '../utils/budgetCalculations.js';

const tripColumns = [
  { key: 'title', label: 'Trip' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'budget', label: 'Budget', render: (row) => currencyFormat(row.budget || 0) },
  { key: 'traveler_count', label: 'Travelers' },
  statusColumn(),
];

const destinationColumns = [
  { key: 'name', label: 'Destination' },
  { key: 'country', label: 'Country' },
  { key: 'region', label: 'Region' },
  {
    key: 'cost_level',
    label: 'Cost',
    render: (row) => <span className="font-bold capitalize">{row.cost_level || 'mid-range'}</span>,
  },
  {
    key: 'tags',
    label: 'Tags',
    render: (row) => (row.tags || []).slice(0, 3).join(', ') || '—',
  },
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

const auditColumns = [
  { key: 'action', label: 'Action' },
  { key: 'entity_type', label: 'Entity' },
  { key: 'entity_id', label: 'Record' },
  { key: 'created_at', label: 'Created', render: (row) => row.created_at?.slice(0, 16) || '—' },
];

const initialDestinationForm = {
  name: '',
  country: '',
  region: '',
  description: '',
  best_time_to_visit: '',
  cost_level: 'mid-range',
  tags: '',
  popular_attractions: '',
  safety_notes: '',
  family_suitability_notes: '',
  image_url: '',
  status: 'active',
};

const bookingTypeOptions = ['flight', 'hotel', 'activity', 'transport', 'tour'];
const bookingStatusOptions = ['upcoming', 'completed', 'cancelled'];

const initialBookingForm = {
  user_id: '',
  trip_id: '',
  booking_type: 'activity',
  title: '',
  provider: '',
  reference_number: '',
  start_at: '',
  end_at: '',
  location: '',
  status: 'upcoming',
  price: 0,
  details: '',
  document_url: '',
  image_url: '',
};

function toDateTimeInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function detailsToText(details) {
  if (!details) return '';
  if (typeof details === 'string') return details;
  if (typeof details.notes === 'string') return details.notes;
  return Object.entries(details)
    .map(([key, value]) => `${key.replaceAll('_', ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n');
}

function bookingToForm(row = {}, users = [], trips = []) {
  return {
    ...initialBookingForm,
    user_id: row.user_id || users[0]?.id || '',
    trip_id: row.trip_id || trips[0]?.id || '',
    booking_type: row.booking_type || 'activity',
    title: row.title || '',
    provider: row.provider || '',
    reference_number: row.reference_number || '',
    start_at: toDateTimeInput(row.start_at),
    end_at: toDateTimeInput(row.end_at),
    location: row.location || '',
    status: row.status || 'upcoming',
    price: row.price || 0,
    details: detailsToText(row.details),
    document_url: row.document_url || '',
    image_url: row.image_url || '',
  };
}

function bookingFormToPayload(form) {
  return {
    user_id: form.user_id || null,
    trip_id: form.trip_id || null,
    booking_type: form.booking_type,
    title: form.title,
    provider: form.provider,
    reference_number: form.reference_number,
    start_at: form.start_at ? new Date(form.start_at).toISOString() : null,
    end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
    location: form.location,
    status: form.status,
    price: Number(form.price || 0),
    details: form.details.trim() ? { notes: form.details.trim() } : {},
    document_url: form.document_url,
    image_url: form.image_url,
  };
}

function BookingRecordForm({
  row,
  users = [],
  trips = [],
  error,
  createError,
  editError,
  isMutating,
  submitLabel,
  onCancel,
  onSubmit,
  onCreate,
}) {
  const [form, setForm] = useState(() => bookingToForm(row, users, trips));

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await (onSubmit || onCreate)(bookingFormToPayload(form));
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {(error || createError || editError) && (
        <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{error || createError || editError}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          User
          <select
            required
            value={form.user_id}
            onChange={(event) => updateField('user_id', event.target.value)}
            className="form-control"
          >
            <option value="">Select user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email || user.id}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Trip
          <select
            value={form.trip_id}
            onChange={(event) => updateField('trip_id', event.target.value)}
            className="form-control"
          >
            <option value="">No linked trip</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.title || trip.id}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Booking type
          <select
            value={form.booking_type}
            onChange={(event) => updateField('booking_type', event.target.value)}
            className="form-control"
          >
            {bookingTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Status
          <select
            value={form.status}
            onChange={(event) => updateField('status', event.target.value)}
            className="form-control"
          >
            {bookingStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-1 text-sm font-bold text-stone-700 md:col-span-2">
          Title
          <input
            required
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            className="form-control"
            placeholder="Airport transfer or hotel stay"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Provider
          <input
            value={form.provider}
            onChange={(event) => updateField('provider', event.target.value)}
            className="form-control"
            placeholder="Air India, Marriott, local guide..."
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Reference number
          <input
            value={form.reference_number}
            onChange={(event) => updateField('reference_number', event.target.value)}
            className="form-control"
            placeholder="PNR / confirmation ID"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Price
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => updateField('price', event.target.value)}
            className="form-control"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Start date & time
          <input
            type="datetime-local"
            value={form.start_at}
            onChange={(event) => updateField('start_at', event.target.value)}
            className="form-control"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          End date & time
          <input
            type="datetime-local"
            value={form.end_at}
            onChange={(event) => updateField('end_at', event.target.value)}
            className="form-control"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Location
          <input
            value={form.location}
            onChange={(event) => updateField('location', event.target.value)}
            className="form-control"
            placeholder="City, airport, hotel, or meeting point"
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm font-bold text-stone-700">
        Additional details
        <textarea
          value={form.details}
          onChange={(event) => updateField('details', event.target.value)}
          rows={3}
          className="form-control"
          placeholder="Seat numbers, room type, inclusions, notes..."
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Document URL
          <input
            type="url"
            value={form.document_url}
            onChange={(event) => updateField('document_url', event.target.value)}
            className="form-control"
            placeholder="https://..."
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Image URL
          <input
            type="url"
            value={form.image_url}
            onChange={(event) => updateField('image_url', event.target.value)}
            className="form-control"
            placeholder="https://..."
          />
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isMutating} className="btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function DestinationCreateForm({ createError, isMutating, onCancel, onCreate }) {
  const [form, setForm] = useState(initialDestinationForm);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onCreate(form);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {createError && (
        <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{createError}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Destination name
          <input
            required
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            className="form-control"
            placeholder="Goa"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Country
          <input
            required
            value={form.country}
            onChange={(event) => updateField('country', event.target.value)}
            className="form-control"
            placeholder="India"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Region / City
          <input
            value={form.region}
            onChange={(event) => updateField('region', event.target.value)}
            className="form-control"
            placeholder="West India"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Cost level
          <select
            value={form.cost_level}
            onChange={(event) => updateField('cost_level', event.target.value)}
            className="form-control"
          >
            <option value="budget">Budget</option>
            <option value="mid-range">Mid-range</option>
            <option value="luxury">Luxury</option>
          </select>
        </label>
      </div>

      <label className="grid gap-1 text-sm font-bold text-stone-700">
        Description
        <textarea
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          rows={3}
          className="form-control"
          placeholder="Short destination overview..."
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Best time to visit
          <input
            value={form.best_time_to_visit}
            onChange={(event) => updateField('best_time_to_visit', event.target.value)}
            className="form-control"
            placeholder="November to February"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Image URL
          <input
            type="url"
            value={form.image_url}
            onChange={(event) => updateField('image_url', event.target.value)}
            className="form-control"
            placeholder="https://..."
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Tags
          <input
            value={form.tags}
            onChange={(event) => updateField('tags', event.target.value)}
            className="form-control"
            placeholder="beach, nightlife, family"
          />
          <span className="text-xs font-semibold text-stone-400">Comma separated</span>
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Popular attractions
          <input
            value={form.popular_attractions}
            onChange={(event) => updateField('popular_attractions', event.target.value)}
            className="form-control"
            placeholder="Baga Beach, Fort Aguada"
          />
          <span className="text-xs font-semibold text-stone-400">Comma separated</span>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Safety notes
          <textarea
            value={form.safety_notes}
            onChange={(event) => updateField('safety_notes', event.target.value)}
            rows={2}
            className="form-control"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          Family suitability notes
          <textarea
            value={form.family_suitability_notes}
            onChange={(event) => updateField('family_suitability_notes', event.target.value)}
            rows={2}
            className="form-control"
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm font-bold text-stone-700 md:max-w-xs">
        Status
        <select
          value={form.status}
          onChange={(event) => updateField('status', event.target.value)}
          className="form-control"
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isMutating} className="btn-primary">
          Add destination
        </button>
      </div>
    </form>
  );
}

const reportColumns = [
  { key: 'report', label: 'Report' },
  { key: 'category', label: 'Category' },
  { key: 'count', label: 'Records' },
  { key: 'total_value', label: 'Value', render: (row) => row.total_value ?? 0 },
  { key: 'summary', label: 'Summary' },
  statusColumn(),
  { key: 'updated_at', label: 'Latest activity', render: (row) => dateCell(row.updated_at) },
];

const reportDatasetMap = {
  users: { filename: 'admin-report-users', label: 'Export users', dataKey: 'users' },
  trips: { filename: 'admin-report-trips', label: 'Export trips', dataKey: 'trips' },
  bookings: { filename: 'admin-report-bookings', label: 'Export bookings', dataKey: 'bookings' },
  budgets: { filename: 'admin-report-budgets-expenses', label: 'Export budgets', dataKey: 'budgets' },
  ai: { filename: 'admin-report-ai-usage', label: 'Export AI', dataKey: 'aiLogs' },
  reviews: { filename: 'admin-report-reviews', label: 'Export reviews', dataKey: 'reviews' },
  notifications: { filename: 'admin-report-notifications', label: 'Export notifications', dataKey: 'notifications' },
  destinations: { filename: 'admin-report-destinations', label: 'Export destinations', dataKey: 'destinations' },
};

function ReportsSection({ reports, reportData, globalSearch = '' }) {
  const rows = reports || [];

  function handleDatasetExport(reportId) {
    const config = reportDatasetMap[reportId];
    if (!config) return;
    const records = config.dataKey === 'budgets'
      ? [...(reportData.budgets || []), ...(reportData.expenses || [])]
      : config.dataKey === 'notifications'
        ? [...(reportData.notifications || []), ...(reportData.tripNotifications || [])]
        : reportData[config.dataKey] || [];
    downloadCsv(config.filename, records);
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rows.slice(0, 8).map((row) => (
          <article key={row.id} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">{row.category}</p>
                <h3 className="mt-2 text-xl font-black text-slate-950">{row.report}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${row.status === 'attention' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {row.status}
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-slate-950">{row.count}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{row.summary}</p>
            <button type="button" onClick={() => handleDatasetExport(row.id)} className="mt-4 rounded-full border border-orange-100 px-4 py-2 text-xs font-black text-orange-600 transition hover:bg-orange-50">
              {reportDatasetMap[row.id]?.label || 'Export data'}
            </button>
          </article>
        ))}
      </div>

      <AdminRecordSection
        eyebrow="Reports & analytics"
        title="Export-ready real reports"
        description="Reports are generated from live Supabase users, trips, bookings, budgets, AI usage, notifications, reviews, and destinations."
        table="admin_audit_logs"
        rows={rows}
        columns={reportColumns}
        searchFields={['report', 'category', 'summary', 'status']}
        filename="admin-reports"
        updateRecord={() => Promise.resolve()}
        deleteRecord={() => Promise.resolve()}
        isMutating={false}
        writePermission={ADMIN_PERMISSIONS.REPORTS_READ}
        hideActions
        globalSearch={globalSearch}
      />
    </section>
  );
}

const ADMIN_ROUTE_TAB_MAP = {
  users: 'users',
  trips: 'trips',
  bookings: 'bookings',
  content: 'destinations',
  'ai-conversations': 'ai',
};

function AdminPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { adminSearch = '' } = useOutletContext() || {};
  const { user } = useAuth();
  const visibleTabs = useMemo(() => getVisibleAdminTabs(user), [user]);
  const pathSegment = location.pathname.replace(/^\/admin\/?/, '').split('/')[0];
  const canAccessContent = visibleTabs.some((tab) => tab.key === 'content');
  const routeTab = pathSegment === 'destinations' && canAccessContent
    ? 'destinations'
    : ADMIN_ROUTE_TAB_MAP[pathSegment] || pathSegment;
  const requestedTab = routeTab || searchParams.get('tab');
  const activeTab = (requestedTab === 'destinations' && canAccessContent) || visibleTabs.some((tab) => tab.key === requestedTab)
    ? requestedTab
    : visibleTabs[0]?.key || 'overview';
  const admin = useAdmin();
  const {
    users,
    trips,
    bookings,
    aiLogs,
    reviews,
    notifications,
    auditLogs,
    destinations,
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
          reviews={reviews}
          notifications={notifications}
          auditLogs={auditLogs}
          metrics={metrics}
        />
      )}
      {activeTab === 'users' && (
        <UsersSection users={users} updateUser={updateUser} isMutating={isMutating} globalSearch={adminSearch} />
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
          globalSearch={adminSearch}
          defaultCreateValue={{
            user_id: users[0]?.id || '',
            title: 'New trip',
            city: '',
            country: '',
            traveler_count: 1,
            budget: 0,
            status: 'draft',
          }}
        />
      )}
      {activeTab === 'bookings' && (
        <AdminRecordSection
          eyebrow="Booking management"
          title="Bookings"
          description="Manage flights, hotels, activities, and transportation records."
          table="bookings"
          rows={bookings}
          columns={bookingColumns}
          searchFields={['booking_type', 'title', 'provider', 'reference_number', 'location', 'status']}
          filterKey="booking_type"
          filterOptions={['flight', 'hotel', 'activity', 'transport', 'tour']}
          statusOptions={['upcoming', 'completed', 'cancelled']}
          filename="admin-bookings"
          writePermission={ADMIN_PERMISSIONS.BOOKINGS_WRITE}
          updateRecord={updateRecord}
          deleteRecord={deleteRecord}
          createRecord={createRecord}
          isMutating={isMutating}
          globalSearch={adminSearch}
          defaultCreateValue={bookingToForm({}, users, trips)}
          renderCreateForm={(formProps) => (
            <BookingRecordForm {...formProps} row={{}} users={users} trips={trips} submitLabel="Create booking" />
          )}
          renderEditForm={(formProps) => (
            <BookingRecordForm {...formProps} users={users} trips={trips} submitLabel="Save changes" />
          )}
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
          globalSearch={adminSearch}
          defaultCreateValue={{
            user_id: users[0]?.id || '',
            trip_id: trips[0]?.id || '',
            request_type: 'chat',
            prompt: 'Manual admin log',
            status: 'success',
            token_estimate: 0,
            latency_ms: 0,
          }}
        />
      )}
      {activeTab === 'destinations' && (
        <AdminRecordSection
          key={searchParams.get('create') === '1' ? 'destinations-create' : 'destinations'}
          eyebrow="Destination management"
          title="Destinations"
          description="Add and manage public destination records shown on the traveler destination pages."
          table="destinations"
          rows={destinations}
          columns={destinationColumns}
          searchFields={['name', 'country', 'region', 'cost_level', 'status', 'tags']}
          filterKey="cost_level"
          filterOptions={['budget', 'mid-range', 'luxury']}
          statusOptions={['active', 'archived']}
          filename="admin-destinations"
          writePermission={ADMIN_PERMISSIONS.CONTENT_WRITE}
          updateRecord={updateRecord}
          deleteRecord={deleteRecord}
          createRecord={createRecord}
          isMutating={isMutating}
          globalSearch={adminSearch}
          createButtonLabel="Add Destination"
          createDescription="Fill destination details. Name and country are required."
          defaultCreateOpen={searchParams.get('create') === '1'}
          renderCreateForm={(formProps) => <DestinationCreateForm {...formProps} />}
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
          globalSearch={adminSearch}
        />
      )}
    </section>
  );
}

export default AdminPage;
