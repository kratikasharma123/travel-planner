import { supabase } from './supabaseClient.js';
import { buildPagination, getCurrentUserId, mapTrip, normalizePaginationParams, throwIfError, tripPayloadToRow } from './supabaseUtils.js';

const tripSelect = `
  *,
  destinations (*)
`;

function applyTripFilters(query, params = {}) {
  if (params.status) query.eq('status', params.status);
  if (params.destination) query.eq('destination_id', params.destination);
  if (params.country) query.ilike('country', `%${params.country}%`);
  if (params.city) query.ilike('city', `%${params.city}%`);
  if (params.travelStyle) query.eq('travel_style', params.travelStyle);
  if (params.startDate) query.gte('start_date', params.startDate);
  if (params.endDate) query.lte('end_date', params.endDate);
  if (params.search) query.or(`title.ilike.%${params.search}%,city.ilike.%${params.search}%,country.ilike.%${params.search}%,notes.ilike.%${params.search}%`);
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

export async function deleteTrip(tripId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('trips').delete().eq('id', tripId).eq('user_id', userId).select(tripSelect).single();
  throwIfError(error, 'Unable to delete trip.');
  return { trip: mapTrip(data) };
}

export async function duplicateTrip(tripId) {
  const { trip } = await getTrip(tripId);
  return createTrip({
    title: `${trip.title} Copy`,
    customDestination: trip.customDestination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    durationDays: trip.durationDays,
    travelerCount: trip.travelerCount,
    travelStyle: trip.travelStyle,
    interests: trip.interests,
    notes: trip.notes,
    city: trip.city,
    country: trip.country,
    budget: trip.budget,
    status: 'draft',
  });
}

export async function archiveTrip(tripId) {
  return updateTrip(tripId, { status: 'archived' });
}

export async function toggleFavoriteTrip(tripId, isFavorite) {
  return updateTrip(tripId, { isFavorite });
}
