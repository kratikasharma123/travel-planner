import { supabase } from './supabaseClient.js';
import { buildPagination, getCurrentUserId, mapTrip, normalizePaginationParams, throwIfError, tripPayloadToRow } from './supabaseUtils.js';

const tripSelect = `
  *,
  destinations (*)
`;

function applyTripFilters(query, params = {}) {
  if (params.status) query.eq('status', params.status);
  if (params.destination) query.eq('destination_id', params.destination);
  if (params.search) query.ilike('title', `%${params.search}%`);
  return query;
}

export async function listTrips(params = {}) {
  const userId = await getCurrentUserId();
  const { page, limit, from, to } = normalizePaginationParams(params);

  let query = supabase
    .from('trips')
    .select(tripSelect, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  query = applyTripFilters(query, params);

  const { data, error, count } = await query;
  throwIfError(error, 'Unable to load trips.');

  return {
    trips: (data || []).map(mapTrip),
    pagination: buildPagination(page, limit, count || 0),
  };
}

export async function createTrip(payload) {
  const userId = await getCurrentUserId();
  const row = tripPayloadToRow(payload, userId);

  const { data, error } = await supabase.from('trips').insert(row).select(tripSelect).single();
  throwIfError(error, 'Unable to create trip.');

  return { trip: mapTrip(data) };
}

export async function getTrip(tripId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('trips').select(tripSelect).eq('id', tripId).eq('user_id', userId).single();
  throwIfError(error, 'Trip not found.');

  return { trip: mapTrip(data) };
}

export async function updateTrip(tripId, payload) {
  const userId = await getCurrentUserId();
  const row = {
    ...tripPayloadToRow(payload),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('trips')
    .update(row)
    .eq('id', tripId)
    .eq('user_id', userId)
    .select(tripSelect)
    .single();

  throwIfError(error, 'Unable to update trip.');

  return { trip: mapTrip(data) };
}

export async function archiveTrip(tripId) {
  return updateTrip(tripId, { status: 'archived' });
}
