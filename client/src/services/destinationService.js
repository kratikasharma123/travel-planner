import { supabase } from './supabaseClient.js';
import { buildPagination, mapDestination, normalizePaginationParams, throwIfError } from './supabaseUtils.js';

function applyDestinationFilters(query, params = {}) {
  if (params.country) query.ilike('country', `%${params.country}%`);
  if (params.region) query.ilike('region', `%${params.region}%`);
  if (params.costLevel) query.eq('cost_level', params.costLevel);
  if (params.tag) query.contains('tags', [params.tag]);
  if (params.search) query.or(`name.ilike.%${params.search}%,country.ilike.%${params.search}%,region.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  return query;
}

export async function listDestinations(params = {}) {
  const { page, limit, from, to } = normalizePaginationParams(params);

  let query = supabase
    .from('destinations')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .order('name', { ascending: true })
    .range(from, to);

  query = applyDestinationFilters(query, params);

  const { data, error, count } = await query;
  throwIfError(error, 'Unable to load destinations.');

  return {
    destinations: (data || []).map(mapDestination),
    pagination: buildPagination(page, limit, count || 0),
  };
}

export async function getDestination(destinationId) {
  const { data, error } = await supabase.from('destinations').select('*').eq('id', destinationId).eq('status', 'active').single();
  throwIfError(error, 'Destination not found.');

  return { destination: mapDestination(data) };
}
