import { supabase } from './supabaseClient.js';
import { getCurrentUserId, mapBooking, mapBudget, mapSavedPlace, mapTrip, throwIfError } from './supabaseUtils.js';

const tripSelect = `*, destinations (*)`;

function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function buildAnalyticsRows(trips = []) {
  const byMonth = trips.reduce((record, trip) => {
    const month = (trip.startDate || trip.createdAt || '').slice(0, 7) || 'Unscheduled';
    record[month] = (record[month] || 0) + 1;
    return record;
  }, {});

  return Object.entries(byMonth).map(([month, count]) => ({ month, trips: count }));
}

export async function getDashboardSummary() {
  const userId = await getCurrentUserId();

  const [tripsResult, savedPlacesResult, bookingsResult, budgetsResult] = await Promise.all([
    supabase.from('trips').select(tripSelect).eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('saved_places').select('*, destinations (*)').eq('user_id', userId).order('saved_at', { ascending: false }),
    supabase.from('bookings').select('*, trips (*, destinations (*))').eq('user_id', userId).order('start_at', { ascending: true, nullsFirst: false }),
    supabase.from('budgets').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  throwIfError(tripsResult.error, 'Unable to load dashboard trips.');
  throwIfError(savedPlacesResult.error, 'Unable to load dashboard saved places.');
  throwIfError(bookingsResult.error, 'Unable to load dashboard bookings.');
  throwIfError(budgetsResult.error, 'Unable to load dashboard budgets.');

  const trips = (tripsResult.data || []).map(mapTrip);
  const savedPlaces = (savedPlacesResult.data || []).map(mapSavedPlace);
  const bookings = (bookingsResult.data || []).map(mapBooking);
  const budgets = (budgetsResult.data || []).map(mapBudget);
  const upcomingTrips = trips
    .filter((trip) => daysUntil(trip.startDate) >= 0 && trip.status !== 'completed' && trip.status !== 'archived')
    .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
  const recentTrips = trips.slice(0, 4);
  const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.totalBudget || budget.totalEstimate || 0), 0);

  return {
    trips,
    savedPlaces,
    bookings,
    budgets,
    analyticsRows: buildAnalyticsRows(trips),
    summary: {
      totalTrips: trips.length,
      savedPlacesCount: savedPlaces.length,
      bookingsCount: bookings.length,
      totalBudget,
      upcomingTrips,
      upcomingTripsCount: upcomingTrips.length,
      recentTrips,
      nextTrip: upcomingTrips[0] || trips[0] || null,
      daysUntilDeparture: daysUntil((upcomingTrips[0] || trips[0])?.startDate),
    },
  };
}
