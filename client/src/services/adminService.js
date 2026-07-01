import {
  ADMIN_PERMISSIONS,
  hasAdminPermission,
  isAdminRole,
} from '../features/admin/adminConstants.js';
import { supabase } from './supabaseClient.js';
import { createServiceError, throwIfError } from './supabaseUtils.js';

const DEFAULT_LIMIT = 100;
const ADMIN_TABLES = {
  profiles: {
    order: 'created_at',
    read: ADMIN_PERMISSIONS.USERS_READ,
    write: ADMIN_PERMISSIONS.USERS_WRITE,
    search: ['name', 'role', 'status'],
  },
  trips: {
    order: 'created_at',
    read: ADMIN_PERMISSIONS.TRIPS_READ,
    write: ADMIN_PERMISSIONS.TRIPS_WRITE,
    search: ['title', 'city', 'country', 'status'],
  },
  trip_bookings: {
    order: 'created_at',
    read: ADMIN_PERMISSIONS.BOOKINGS_READ,
    write: ADMIN_PERMISSIONS.BOOKINGS_WRITE,
    search: ['title', 'provider', 'booking_type', 'reference_number'],
  },
  ai_usage_logs: {
    order: 'created_at',
    read: ADMIN_PERMISSIONS.AI_READ,
    write: ADMIN_PERMISSIONS.AI_WRITE,
    search: ['request_type', 'status', 'prompt', 'error'],
  },
  support_tickets: {
    order: 'created_at',
    read: ADMIN_PERMISSIONS.SUPPORT_READ,
    write: ADMIN_PERMISSIONS.SUPPORT_WRITE,
    search: ['title', 'message', 'status', 'priority'],
  },
  support_ticket_messages: {
    order: 'created_at',
    read: ADMIN_PERMISSIONS.SUPPORT_READ,
    write: ADMIN_PERMISSIONS.SUPPORT_WRITE,
    search: ['message', 'sender_role'],
  },
  reviews: {
    order: 'created_at',
    read: ADMIN_PERMISSIONS.REVIEWS_READ,
    write: ADMIN_PERMISSIONS.REVIEWS_WRITE,
    search: ['comment', 'status', 'moderation_notes'],
  },
  admin_notifications: {
    order: 'created_at',
    read: ADMIN_PERMISSIONS.NOTIFICATIONS_READ,
    write: ADMIN_PERMISSIONS.NOTIFICATIONS_WRITE,
    search: ['title', 'message', 'channel', 'status'],
  },
  admin_audit_logs: {
    order: 'created_at',
    read: ADMIN_PERMISSIONS.AUDIT_READ,
    write: ADMIN_PERMISSIONS.AUDIT_READ,
    search: ['action', 'entity_type', 'entity_id'],
  },
  content_items: {
    order: 'created_at',
    read: ADMIN_PERMISSIONS.CONTENT_READ,
    write: ADMIN_PERMISSIONS.CONTENT_WRITE,
    search: ['content_type', 'title', 'status'],
  },
  admin_settings: {
    order: 'updated_at',
    read: ADMIN_PERMISSIONS.SETTINGS_READ,
    write: ADMIN_PERMISSIONS.SETTINGS_WRITE,
    search: ['category', 'setting_key'],
  },
};

function getMessage(error, fallback) {
  return error?.message || fallback;
}

function sanitizeLimit(limit) {
  return Math.min(Math.max(Number(limit || DEFAULT_LIMIT), 1), 500);
}

function tableConfig(table) {
  const config = ADMIN_TABLES[table];
  if (!config)
    throw createServiceError({
      message: `Unsupported admin table: ${table}`,
      status: 400,
      code: 'INVALID_ADMIN_TABLE',
    });
  return config;
}

export { isAdminRole };

export async function requireAdminUser(permission = ADMIN_PERMISSIONS.DASHBOARD_READ) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  throwIfError(authError, 'Unable to verify admin session.');
  if (!authData.user)
    throw createServiceError({ message: 'Not authenticated', status: 401, code: 'AUTH_REQUIRED' });

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle();
  throwIfError(error, 'Unable to verify admin profile.');
  const admin = { ...data, email: authData.user.email };
  if (!hasAdminPermission(admin, permission))
    throw createServiceError({
      message: 'Admin permission required.',
      status: 403,
      code: 'ADMIN_REQUIRED',
    });
  return admin;
}

function applyFilters(query, filters = {}) {
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (key === 'from') query.gte('created_at', value);
    else if (key === 'to') query.lte('created_at', value);
    else query.eq(key, value);
  });
  return query;
}

function applySearch(query, config, search = '') {
  const term = search.trim();
  if (!term || !config.search?.length) return query;
  return query.or(config.search.map((column) => `${column}.ilike.%${term}%`).join(','));
}

export async function listAdminTable(table, options = {}) {
  const config = tableConfig(table);
  await requireAdminUser(config.read);
  const limit = sanitizeLimit(options.limit);
  const page = Math.max(Number(options.page || 1), 1);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from(table).select('*', { count: 'exact' });
  query = applyFilters(query, options.filters);
  query = applySearch(query, config, options.search || '');
  const { data, error, count } = await query
    .order(options.order || config.order, { ascending: Boolean(options.ascending) })
    .range(from, to);
  if (error) console.warn(getMessage(error, `Unable to load ${table}.`));

  return { records: data || [], total: count || 0, page, limit };
}

export async function getAdminDashboardData(options = {}) {
  await requireAdminUser(ADMIN_PERMISSIONS.DASHBOARD_READ);
  const limit = options.limit || 100;
  const [
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
  ] = await Promise.all([
    listAdminTable('profiles', { limit }),
    listAdminTable('trips', { limit }),
    listAdminTable('trip_bookings', { limit }),
    listAdminTable('ai_usage_logs', { limit }),
    listAdminTable('support_tickets', { limit }),
    listAdminTable('reviews', { limit }),
    listAdminTable('admin_notifications', { limit }),
    listAdminTable('admin_audit_logs', { limit }),
    listAdminTable('content_items', { limit }),
    listAdminTable('admin_settings', { limit }),
  ]);

  return {
    users: users.records,
    trips: trips.records,
    bookings: bookings.records,
    aiLogs: aiLogs.records,
    tickets: tickets.records,
    reviews: reviews.records,
    notifications: notifications.records,
    auditLogs: auditLogs.records,
    contentItems: contentItems.records,
    settings: settings.records,
  };
}

export async function createAuditLog(payload) {
  const admin = await requireAdminUser(ADMIN_PERMISSIONS.DASHBOARD_READ);
  const { error } = await supabase.from('admin_audit_logs').insert({
    admin_id: admin.id,
    action: payload.action,
    entity_type: payload.entityType || '',
    entity_id: payload.entityId || '',
    metadata: payload.metadata || {},
  });
  if (error) console.warn('Unable to write audit log', error.message);
}

export function userPayloadToRow(payload = {}) {
  return {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.role !== undefined ? { role: payload.role } : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(payload.permissions !== undefined ? { permissions: payload.permissions || {} } : {}),
    ...(payload.suspendedAt !== undefined ? { suspended_at: payload.suspendedAt } : {}),
    ...(payload.suspensionReason !== undefined
      ? { suspension_reason: payload.suspensionReason || '' }
      : {}),
    updated_at: new Date().toISOString(),
  };
}

export async function updateUserProfile(userId, payload) {
  await requireAdminUser(ADMIN_PERMISSIONS.USERS_WRITE);
  const row = userPayloadToRow(payload);
  const { data, error } = await supabase
    .from('profiles')
    .update(row)
    .eq('id', userId)
    .select('*')
    .single();
  throwIfError(error, 'Unable to update user.');
  await createAuditLog({
    action: 'update_user',
    entityType: 'profile',
    entityId: userId,
    metadata: row,
  });
  return { user: data };
}

export async function setUserStatus(userId, status, reason = '') {
  const payload = {
    status,
    suspendedAt: status === 'suspended' ? new Date().toISOString() : null,
    suspensionReason: reason,
  };
  return updateUserProfile(userId, payload);
}

function bookingPayloadToRow(payload = {}) {
  return {
    ...(payload.booking_type !== undefined ? { booking_type: payload.booking_type } : {}),
    ...(payload.bookingType !== undefined ? { booking_type: payload.bookingType } : {}),
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.provider !== undefined ? { provider: payload.provider || '' } : {}),
    ...(payload.reference_number !== undefined
      ? { reference_number: payload.reference_number || '' }
      : {}),
    ...(payload.referenceNumber !== undefined
      ? { reference_number: payload.referenceNumber || '' }
      : {}),
    ...(payload.start_at !== undefined ? { start_at: payload.start_at || null } : {}),
    ...(payload.startAt !== undefined ? { start_at: payload.startAt || null } : {}),
    ...(payload.end_at !== undefined ? { end_at: payload.end_at || null } : {}),
    ...(payload.endAt !== undefined ? { end_at: payload.endAt || null } : {}),
    ...(payload.details !== undefined ? { details: payload.details || {} } : {}),
    ...(payload.document_url !== undefined ? { document_url: payload.document_url || '' } : {}),
    ...(payload.documentUrl !== undefined ? { document_url: payload.documentUrl || '' } : {}),
  };
}

function contentPayloadToRow(payload = {}) {
  return {
    ...(payload.content_type !== undefined ? { content_type: payload.content_type } : {}),
    ...(payload.contentType !== undefined ? { content_type: payload.contentType } : {}),
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.body !== undefined ? { body: payload.body || '' } : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(payload.metadata !== undefined ? { metadata: payload.metadata || {} } : {}),
  };
}

function notificationPayloadToRow(payload = {}) {
  return {
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.message !== undefined ? { message: payload.message || '' } : {}),
    ...(payload.channel !== undefined ? { channel: payload.channel } : {}),
    ...(payload.scheduled_at !== undefined ? { scheduled_at: payload.scheduled_at || null } : {}),
    ...(payload.scheduledAt !== undefined ? { scheduled_at: payload.scheduledAt || null } : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(payload.metadata !== undefined ? { metadata: payload.metadata || {} } : {}),
  };
}

function settingsPayloadToRow(payload = {}) {
  return {
    category: payload.category || 'system',
    setting_key: payload.settingKey || payload.setting_key,
    setting_value: payload.settingValue || payload.setting_value || {},
  };
}

function tablePayloadToRow(table, payload) {
  if (table === 'profiles') return userPayloadToRow(payload);
  if (table === 'trip_bookings') return bookingPayloadToRow(payload);
  if (table === 'content_items') return contentPayloadToRow(payload);
  if (table === 'admin_notifications') return notificationPayloadToRow(payload);
  if (table === 'admin_settings') return settingsPayloadToRow(payload);
  return { ...payload };
}

export async function createAdminRecord(table, payload) {
  const config = tableConfig(table);
  await requireAdminUser(config.write);
  const admin = await requireAdminUser(config.write);
  const baseRow = tablePayloadToRow(table, payload);
  const row =
    table === 'admin_notifications'
      ? { ...baseRow, created_by: admin.id }
      : table === 'content_items'
        ? { ...baseRow, created_by: admin.id }
        : baseRow;
  const { data, error } = await supabase.from(table).insert(row).select('*').single();
  throwIfError(error, `Unable to create ${table}.`);
  await createAuditLog({
    action: `create_${table}`,
    entityType: table,
    entityId: data.id,
    metadata: row,
  });
  return { record: data };
}

export async function updateAdminRecord(table, id, payload) {
  const config = tableConfig(table);
  await requireAdminUser(config.write);
  const row = { ...tablePayloadToRow(table, payload), updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from(table).update(row).eq('id', id).select('*').single();
  throwIfError(error, `Unable to update ${table}.`);
  await createAuditLog({
    action: `update_${table}`,
    entityType: table,
    entityId: id,
    metadata: row,
  });
  return { record: data };
}

export async function deleteAdminRecord(table, id) {
  const config = tableConfig(table);
  await requireAdminUser(config.write);
  const { error } = await supabase.from(table).delete().eq('id', id);
  throwIfError(error, `Unable to delete ${table}.`);
  await createAuditLog({ action: `delete_${table}`, entityType: table, entityId: id });
}

export async function upsertAdminSetting(payload) {
  const admin = await requireAdminUser(ADMIN_PERMISSIONS.SETTINGS_WRITE);
  const row = { ...settingsPayloadToRow(payload), updated_by: admin.id };
  const { data, error } = await supabase
    .from('admin_settings')
    .upsert(row, { onConflict: 'category,setting_key' })
    .select('*')
    .single();
  throwIfError(error, 'Unable to save setting.');
  await createAuditLog({
    action: 'save_setting',
    entityType: 'admin_settings',
    entityId: data.id,
    metadata: payload,
  });
  return { setting: data };
}

export async function replyToSupportTicket(ticketId, message) {
  const admin = await requireAdminUser(ADMIN_PERMISSIONS.SUPPORT_WRITE);
  const { data, error } = await supabase
    .from('support_ticket_messages')
    .insert({ ticket_id: ticketId, sender_id: admin.id, sender_role: admin.role, message })
    .select('*')
    .single();
  throwIfError(error, 'Unable to reply to support ticket.');
  await createAuditLog({
    action: 'reply_support_ticket',
    entityType: 'support_tickets',
    entityId: ticketId,
  });
  return { message: data };
}

export async function logAiUsage(payload = {}) {
  const { data: authData } = await supabase.auth.getUser();
  const row = {
    user_id: authData?.user?.id || null,
    trip_id: payload.tripId || null,
    session_id: payload.sessionId || null,
    request_type: payload.requestType || 'chat',
    prompt: payload.prompt || '',
    response_summary: payload.responseSummary || '',
    token_estimate: Number(payload.tokenEstimate || 0),
    status: payload.status || 'success',
    latency_ms: Number(payload.latencyMs || 0),
    error: payload.error || '',
  };
  const { error } = await supabase.from('ai_usage_logs').insert(row);
  if (error) console.warn('Unable to log AI usage', error.message);
}
