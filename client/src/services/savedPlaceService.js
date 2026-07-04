import { supabase } from './supabaseClient.js';
import {
  buildPagination,
  getCurrentUserId,
  mapSavedPlace,
  normalizePaginationParams,
  savedPlacePayloadToRow,
  throwIfError,
} from './supabaseUtils.js';

const savedPlaceSelect = `
  *,
  destinations (*)
`;

function applySavedPlaceFilters(query, params = {}) {
  if (params.category && params.category !== 'All') query.eq('category', params.category);
  if (params.destinationId) query.eq('destination_id', params.destinationId);
  if (params.tag) query.contains('tags', [params.tag]);
  if (params.search) {
    query.or(`name.ilike.%${params.search}%,city.ilike.%${params.search}%,country.ilike.%${params.search}%,category.ilike.%${params.search}%,notes.ilike.%${params.search}%`);
  }
  return query;
}

export async function listSavedPlaces(params = {}) {
  const userId = await getCurrentUserId();
  const { page, limit, from, to } = normalizePaginationParams(params);

  let query = supabase
    .from('saved_places')
    .select(savedPlaceSelect, { count: 'exact' })
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
    .range(from, to);

  query = applySavedPlaceFilters(query, params);

  const { data, error, count } = await query;
  throwIfError(error, 'Unable to load saved places.');

  return {
    savedPlaces: (data || []).map(mapSavedPlace),
    pagination: buildPagination(page, limit, count || 0),
  };
}

export async function savePlace(payload) {
  const userId = await getCurrentUserId();
  const row = savedPlacePayloadToRow(payload, userId);

  const { data, error } = await supabase
    .from('saved_places')
    .upsert(row, payload.destinationId ? { onConflict: 'user_id,destination_id' } : { onConflict: 'user_id,name,country' })
    .select(savedPlaceSelect)
    .single();

  throwIfError(error, 'Unable to save place.');
  return { savedPlace: mapSavedPlace(data) };
}

export async function updateSavedPlace(savedPlaceId, payload) {
  const userId = await getCurrentUserId();
  const row = {
    ...savedPlacePayloadToRow(payload),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('saved_places')
    .update(row)
    .eq('id', savedPlaceId)
    .eq('user_id', userId)
    .select(savedPlaceSelect)
    .single();

  throwIfError(error, 'Unable to update saved place.');
  return { savedPlace: mapSavedPlace(data) };
}

export async function removeSavedPlace(savedPlaceId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('saved_places')
    .delete()
    .eq('id', savedPlaceId)
    .eq('user_id', userId)
    .select(savedPlaceSelect)
    .single();

  throwIfError(error, 'Unable to remove saved place.');
  return { savedPlace: mapSavedPlace(data) };
}

export async function removeSavedPlaceByDestination(destinationId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('saved_places')
    .delete()
    .eq('destination_id', destinationId)
    .eq('user_id', userId)
    .select(savedPlaceSelect)
    .maybeSingle();

  throwIfError(error, 'Unable to remove saved place.');
  return { savedPlace: mapSavedPlace(data) };
}
