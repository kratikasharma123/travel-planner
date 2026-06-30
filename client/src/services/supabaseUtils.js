import { supabase } from './supabaseClient.js';

export function createServiceError(error, fallback = 'Something went wrong') {
  if (!error) return new Error(fallback);

  const message = error.message || fallback;
  const serviceError = new Error(message);
  serviceError.cause = error;
  serviceError.code = error.code;
  serviceError.status = error.status;
  serviceError.response = {
    status: error.status,
    data: {
      message,
      error: {
        code: error.code,
        details: error.details || null,
      },
    },
  };

  return serviceError;
}

export function throwIfError(error, fallback) {
  if (error) {
    throw createServiceError(error, fallback);
  }
}

export async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  throwIfError(error, 'Unable to read current session.');

  if (!data.user) {
    throw createServiceError({ message: 'You must be logged in.', status: 401, code: 'AUTH_REQUIRED' });
  }

  return data.user.id;
}

export function buildPagination(page = 1, limit = 20, total = 0) {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}

export function normalizePaginationParams(params = {}) {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 20);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return { page, limit, from, to };
}

export function mapProfile(row, authUser) {
  if (!row && !authUser) return null;

  return {
    id: row?.id || authUser?.id,
    email: authUser?.email || row?.email || '',
    name: row?.name || authUser?.user_metadata?.name || '',
    role: row?.role || 'user',
    status: row?.status || 'active',
    travelPreferences: row?.travel_preferences || {},
    createdAt: row?.created_at,
    updatedAt: row?.updated_at,
    lastLoginAt: row?.last_login_at,
  };
}

export function mapDestination(row) {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    country: row.country,
    region: row.region || '',
    description: row.description || '',
    bestTimeToVisit: row.best_time_to_visit || '',
    costLevel: row.cost_level || 'mid-range',
    tags: row.tags || [],
    popularAttractions: row.popular_attractions || [],
    safetyNotes: row.safety_notes || '',
    familySuitabilityNotes: row.family_suitability_notes || '',
    imageUrl: row.image_url || '',
    status: row.status || 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTrip(row) {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    user: row.user_id,
    destination: mapDestination(row.destinations),
    customDestination: row.custom_destination || {},
    title: row.title,
    startDate: row.start_date,
    endDate: row.end_date,
    durationDays: row.duration_days,
    travelerCount: row.traveler_count,
    travelStyle: row.travel_style || '',
    interests: row.interests || [],
    notes: row.notes || '',
    status: row.status || 'draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function tripPayloadToRow(payload = {}, userId) {
  return {
    ...(userId ? { user_id: userId } : {}),
    ...(payload.destination !== undefined ? { destination_id: payload.destination || null } : {}),
    ...(payload.destinationId !== undefined ? { destination_id: payload.destinationId || null } : {}),
    ...(payload.customDestination !== undefined ? { custom_destination: payload.customDestination || {} } : {}),
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.startDate !== undefined ? { start_date: payload.startDate || null } : {}),
    ...(payload.endDate !== undefined ? { end_date: payload.endDate || null } : {}),
    ...(payload.durationDays !== undefined ? { duration_days: payload.durationDays ? Number(payload.durationDays) : null } : {}),
    ...(payload.travelerCount !== undefined ? { traveler_count: Number(payload.travelerCount || 1) } : {}),
    ...(payload.travelStyle !== undefined ? { travel_style: payload.travelStyle || '' } : {}),
    ...(payload.interests !== undefined ? { interests: payload.interests || [] } : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes || '' } : {}),
    ...(payload.status !== undefined ? { status: payload.status || 'draft' } : {}),
  };
}

export function mapBudget(row) {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    user: row.user_id,
    trip: row.trip_id,
    tripId: row.trip_id,
    name: row.name || 'Trip Budget',
    category: row.category || 'general',
    description: row.description || '',
    totalBudget: Number(row.total_budget || row.total_estimate || 0),
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    savingsTarget: Number(row.savings_target || 0),
    fixedCosts: Number(row.fixed_costs || 0),
    variableCosts: Number(row.variable_costs || 0),
    oneTimeCosts: Number(row.one_time_costs || 0),
    recurringCosts: Number(row.recurring_costs || 0),
    currency: row.currency || 'USD',
    categories: row.categories || {},
    totalEstimate: Number(row.total_estimate || 0),
    confidenceLevel: row.confidence_level || 'low',
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSavedTrip(row) {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    user: row.user_id,
    trip: mapTrip(row.trips) || row.trip_id,
    savedTitle: row.saved_title || '',
    notes: row.notes || '',
    tags: row.tags || [],
    folder: row.folder || '',
    savedAt: row.saved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
