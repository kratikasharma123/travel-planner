export function countBy(records = [], key) {
  return records.reduce((acc, record) => {
    const value = record?.[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export function rowsFromCounts(counts = {}, nameKey = 'name', valueKey = 'value') {
  return Object.entries(counts).map(([name, value]) => ({ [nameKey]: name, [valueKey]: value }));
}

export function monthRows(records = [], dateKey = 'createdAt', valueKey = 'count') {
  const counts = records.reduce((acc, record) => {
    const month = (record?.[dateKey] || '').slice(0, 7) || 'Unscheduled';
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, [valueKey]: value }));
}

export function dayRows(records = [], dateKey = 'created_at', valueKey = 'count') {
  const counts = records.reduce((acc, record) => {
    const day = (record?.[dateKey] || '').slice(0, 10) || 'Unscheduled';
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, value]) => ({ day, [valueKey]: value }));
}

export function getBookingValue(booking = {}) {
  const details = booking.details || {};
  return Number(booking.price || details.amount || details.price || details.total || details.value || 0);
}

export function getBudgetValue(budget = {}) {
  return Number(budget.total_budget || budget.total_estimate || budget.totalBudget || budget.totalEstimate || 0);
}

export function getExpenseValue(expense = {}) {
  return Number(expense.amount || 0);
}

export function sumBy(records = [], getValue) {
  return records.reduce((total, record) => total + Number(getValue(record) || 0), 0);
}

export function buildAdminMetrics({
  users = [],
  trips = [],
  bookings = [],
  budgets = [],
  expenses = [],
  aiLogs = [],
  reviews = [],
  notifications = [],
  destinations = [],
}) {
  const bookingRevenue = sumBy(bookings, getBookingValue);
  const budgetValue = sumBy(budgets, getBudgetValue);
  const expenseValue = sumBy(expenses, getExpenseValue);

  return {
    totalUsers: users.length,
    activeUsers: users.filter((user) => (user.status || 'active') === 'active').length,
    totalTrips: trips.length,
    bookings: bookings.length,
    destinations: destinations.length,
    revenue: bookingRevenue || budgetValue || expenseValue,
    bookingRevenue,
    budgetValue,
    expenseValue,
    aiRequests: aiLogs.length,
    pendingReviews: reviews.filter(
      (review) => review.status === 'pending' || review.status === 'reported'
    ).length,
    reports: [users, trips, bookings, budgets, expenses, aiLogs, reviews, notifications, destinations].filter(
      (records) => records.length > 0
    ).length,
    notifications: notifications.length,
    failedAiRequests: aiLogs.filter((log) => log.status === 'failed').length,
    averageAiLatency: aiLogs.length
      ? Math.round(sumBy(aiLogs, (log) => log.latency_ms) / aiLogs.length)
      : 0,
  };
}

export function popularDestinations(trips = []) {
  return rowsFromCounts(
    trips.reduce((acc, trip) => {
      const name = trip.city || trip.country || trip.custom_destination?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {}),
    'destination',
    'trips'
  ).sort((a, b) => b.trips - a.trips);
}
