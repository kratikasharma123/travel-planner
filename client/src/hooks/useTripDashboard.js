import { useEffect, useMemo, useState } from 'react';
import * as budgetService from '../services/budgetService.js';
import { getWeatherSummaryForTrip } from '../services/weatherService.js';
import { getBudgetSummary } from '../utils/budgetCalculations.js';
import { useTrips } from './useTrips.js';

function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export function useTripDashboard() {
  const { trips, isLoading, error, refreshTrips } = useTrips();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    budgetService.listBudgets().then((data) => setBudgets(data.budgets)).catch(() => setBudgets([]));
    budgetService.listExpenses({ limit: 1000 }).then((data) => setExpenses(data.expenses)).catch(() => setExpenses([]));
  }, []);

  useEffect(() => {
    const nextTrip = trips.find((trip) => daysUntil(trip.startDate) >= 0) || trips[0];
    if (nextTrip) getWeatherSummaryForTrip(nextTrip).then(setWeather);
  }, [trips]);

  const summary = useMemo(() => {
    const upcoming = trips.filter((trip) => daysUntil(trip.startDate) >= 0 && trip.status !== 'completed' && trip.status !== 'archived');
    const active = trips.filter((trip) => trip.status === 'active');
    const completed = trips.filter((trip) => trip.status === 'completed' || trip.status === 'archived');
    const budgetSummary = getBudgetSummary({ totalBudget: budgets.reduce((sum, budget) => sum + Number(budget.totalBudget || 0), 0) }, expenses);
    const nextTrip = upcoming.sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))[0];
    return { upcoming, active, completed, budgetSummary, nextTrip, daysUntilDeparture: daysUntil(nextTrip?.startDate) };
  }, [trips, budgets, expenses]);

  const analyticsRows = useMemo(() => {
    const byMonth = trips.reduce((record, trip) => {
      const month = (trip.startDate || trip.createdAt || '').slice(0, 7) || 'Unscheduled';
      record[month] = (record[month] || 0) + 1;
      return record;
    }, {});
    return Object.entries(byMonth).map(([month, count]) => ({ month, trips: count }));
  }, [trips]);

  return { trips, budgets, expenses, weather, summary, analyticsRows, isLoading, error, refreshTrips };
}
