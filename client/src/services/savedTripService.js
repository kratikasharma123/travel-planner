import { supabase } from './supabaseClient.js';
import { buildPagination, getCurrentUserId, mapSavedTrip, normalizePaginationParams, throwIfError } from './supabaseUtils.js';

const savedTripSelect = `
  *,
  trips (
    *,
    destinations (*)
  )
`;

function applySavedTripFilters(query, params = {}) {
  if (params.folder) query.eq('folder', params.folder);
  if (params.tag) query.contains('tags', [params.tag]);
  if (params.search) query.or(`saved_title.ilike.%${params.search}%,notes.ilike.%${params.search}%,folder.ilike.%${params.search}%`);
  return query;
}

export async function listSavedTrips(params = {}) {
  const userId = await getCurrentUserId();
  const { page, limit, from, to } = normalizePaginationParams(params);

  let query = supabase
    .from('saved_trips')
    .select(savedTripSelect, { count: 'exact' })
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
    .range(from, to);

  query = applySavedTripFilters(query, params);

  const { data, error, count } = await query;
  throwIfError(error, 'Unable to load saved trips.');

  return {
    savedTrips: (data || []).map(mapSavedTrip),
    pagination: buildPagination(page, limit, count || 0),
  };
}

export async function saveTrip(payload) {
  const userId = await getCurrentUserId();
  const row = {
    user_id: userId,
    trip_id: payload.tripId,
    saved_title: payload.savedTitle || '',
    notes: payload.notes || '',
    tags: payload.tags || [],
    folder: payload.folder || '',
  };

  const { data, error } = await supabase.from('saved_trips').insert(row).select(savedTripSelect).single();
  throwIfError(error, 'Unable to save trip.');

  return { savedTrip: mapSavedTrip(data) };
}

export async function updateSavedTrip(savedTripId, payload) {
  const userId = await getCurrentUserId();
  const row = {
    ...(payload.savedTitle !== undefined ? { saved_title: payload.savedTitle || '' } : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes || '' } : {}),
    ...(payload.tags !== undefined ? { tags: payload.tags || [] } : {}),
    ...(payload.folder !== undefined ? { folder: payload.folder || '' } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('saved_trips')
    .update(row)
    .eq('id', savedTripId)
    .eq('user_id', userId)
    .select(savedTripSelect)
    .single();

  throwIfError(error, 'Unable to update saved trip.');

  return { savedTrip: mapSavedTrip(data) };
}

export async function removeSavedTrip(savedTripId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('saved_trips')
    .delete()
    .eq('id', savedTripId)
    .eq('user_id', userId)
    .select(savedTripSelect)
    .single();

  throwIfError(error, 'Unable to remove saved trip.');

  return { savedTrip: mapSavedTrip(data) };
}
