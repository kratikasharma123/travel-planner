import { useCallback, useEffect, useState } from 'react';
import * as dashboardService from '../services/dashboardService.js';

function getErrorMessage(apiError, fallback) {
  return apiError?.response?.data?.message || apiError?.message || fallback;
}

const emptySummary = {
  totalTrips: 0,
  savedPlacesCount: 0,
  bookingsCount: 0,
  totalBudget: 0,
  upcomingTrips: [],
  upcomingTripsCount: 0,
  recentTrips: [],
  nextTrip: null,
  daysUntilDeparture: null,
};

export function useTripDashboard() {
  const [trips, setTrips] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [analyticsRows, setAnalyticsRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await dashboardService.getDashboardSummary();
      setTrips(data.trips);
      setSavedPlaces(data.savedPlaces);
      setBookings(data.bookings);
      setBudgets(data.budgets);
      setSummary(data.summary);
      setAnalyticsRows(data.analyticsRows);
      return data;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to load dashboard.'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(refreshDashboard);
  }, [refreshDashboard]);

  return {
    trips,
    savedPlaces,
    bookings,
    budgets,
    summary,
    analyticsRows,
    isLoading,
    error,
    refreshDashboard,
    refreshTrips: refreshDashboard,
  };
}
