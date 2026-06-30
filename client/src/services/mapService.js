export async function searchTravelLocations(query) {
  const apiKey = import.meta.env.VITE_MAPS_API_KEY;
  if (!apiKey || !query) {
    return [
      { name: query || 'Central attraction', address: 'Map API key not configured', lat: null, lng: null, locationType: 'attraction' },
    ];
  }

  return [
    { name: query, address: 'Map provider integration ready', lat: null, lng: null, locationType: 'attraction' },
  ];
}

export function optimizeSavedRoute(locations = []) {
  return [...locations].sort((a, b) => (a.locationType || '').localeCompare(b.locationType || ''));
}
