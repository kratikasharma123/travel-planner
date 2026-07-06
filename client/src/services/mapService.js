const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function displayNameParts(displayName = '') {
  return displayName
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeNominatimResult(result = {}, fallbackType = 'attraction') {
  const parts = displayNameParts(result.display_name || '');
  const name = result.name || parts[0] || result.display_name || 'Travel location';
  return {
    name,
    address: result.display_name || name,
    lat: toNumber(result.lat),
    lng: toNumber(result.lon),
    locationType: fallbackType,
    metadata: {
      placeId: String(result.place_id || result.osm_id || ''),
      osmType: result.osm_type || '',
      category: result.category || '',
      source: 'openstreetmap_nominatim',
    },
  };
}

async function searchNominatim(query, limit = 6) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    limit: String(limit),
    addressdetails: '1',
  });
  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`OpenStreetMap search failed (${response.status}).`);
  return response.json();
}

export async function geocodeLocation(query) {
  if (!query) return null;
  const results = await searchNominatim(query, 1);
  return results?.[0] ? normalizeNominatimResult(results[0]) : null;
}

export async function searchTravelLocations(query, context = {}) {
  if (!query?.trim()) return [];
  const destination = context.destination ? ` ${context.destination}` : '';
  const country = context.country ? ` ${context.country}` : '';
  const results = await searchNominatim(`${query}${destination}${country}`.trim(), 6);
  return (results || []).map((result) => normalizeNominatimResult(result, context.locationType || 'attraction'));
}

export async function resolveLocations(locations = []) {
  const resolved = [];
  for (const location of locations) {
    if (toNumber(location.lat) !== null && toNumber(location.lng) !== null) {
      resolved.push({ ...location, lat: toNumber(location.lat), lng: toNumber(location.lng) });
      continue;
    }

    const query = [location.name, location.address].filter(Boolean).join(', ');
    try {
      const geocoded = await geocodeLocation(query);
      resolved.push(geocoded ? { ...location, ...geocoded, _id: location._id, id: location.id } : location);
    } catch {
      resolved.push(location);
    }
  }
  return resolved;
}

export function optimizeSavedRoute(locations = []) {
  return [...locations].sort((a, b) => (a.locationType || '').localeCompare(b.locationType || ''));
}
