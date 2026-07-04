import { supabase } from './supabaseClient.js';
import {
  bookingPayloadToRow,
  buildPagination,
  getCurrentUserId,
  mapBooking,
  normalizePaginationParams,
  throwIfError,
} from './supabaseUtils.js';

const bookingSelect = `
  *,
  trips (*, destinations (*))
`;

function applyBookingFilters(query, params = {}) {
  if (params.tripId) query.eq('trip_id', params.tripId);
  if (params.bookingType && params.bookingType !== 'all') query.eq('booking_type', params.bookingType);
  if (params.status && params.status !== 'all') query.eq('status', params.status);
  if (params.search) {
    query.or(`title.ilike.%${params.search}%,provider.ilike.%${params.search}%,reference_number.ilike.%${params.search}%,location.ilike.%${params.search}%`);
  }
  return query;
}

export async function listBookings(params = {}) {
  const userId = await getCurrentUserId();
  const { page, limit, from, to } = normalizePaginationParams({ page: params.page || 1, limit: params.limit || 100 });

  let query = supabase
    .from('bookings')
    .select(bookingSelect, { count: 'exact' })
    .eq('user_id', userId)
    .order('start_at', { ascending: true, nullsFirst: false })
    .range(from, to);

  query = applyBookingFilters(query, params);

  const { data, error, count } = await query;
  throwIfError(error, 'Unable to load bookings.');

  return {
    bookings: (data || []).map(mapBooking),
    pagination: buildPagination(page, limit, count || 0),
  };
}

export async function createBooking(payload) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingPayloadToRow(payload, userId))
    .select(bookingSelect)
    .single();

  throwIfError(error, 'Unable to create booking.');
  return { booking: mapBooking(data) };
}

export async function updateBooking(bookingId, payload) {
  const userId = await getCurrentUserId();
  const row = {
    ...bookingPayloadToRow(payload),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('bookings')
    .update(row)
    .eq('id', bookingId)
    .eq('user_id', userId)
    .select(bookingSelect)
    .single();

  throwIfError(error, 'Unable to update booking.');
  return { booking: mapBooking(data) };
}

export async function cancelBooking(bookingId) {
  return updateBooking(bookingId, { status: 'cancelled' });
}

export async function deleteBooking(bookingId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)
    .eq('user_id', userId)
    .select(bookingSelect)
    .single();

  throwIfError(error, 'Unable to delete booking.');
  return { booking: mapBooking(data) };
}
