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
    city: row.city || row.custom_destination?.city || '',
    country: row.country || row.custom_destination?.country || '',
    budget: Number(row.budget || 0),
    weatherSummary: row.weather_summary || {},
    progress: Number(row.progress || 0),
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
    ...(payload.city !== undefined ? { city: payload.city || '' } : {}),
    ...(payload.country !== undefined ? { country: payload.country || '' } : {}),
    ...(payload.budget !== undefined ? { budget: Number(payload.budget || 0) } : {}),
    ...(payload.weatherSummary !== undefined ? { weather_summary: payload.weatherSummary || {} } : {}),
    ...(payload.progress !== undefined ? { progress: Number(payload.progress || 0) } : {}),
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

export function mapChatSession(row) {
  if (!row) return null;
  return { _id: row.id, id: row.id, user: row.user_id, tripId: row.trip_id, title: row.title, context: row.context || {}, createdAt: row.created_at, updatedAt: row.updated_at };
}

export function mapChatMessage(row) {
  if (!row) return null;
  return { _id: row.id, id: row.id, sessionId: row.session_id, user: row.user_id, role: row.role, content: row.content, metadata: row.metadata || {}, createdAt: row.created_at };
}

export function mapItinerary(row) {
  if (!row) return null;
  return { _id: row.id, id: row.id, tripId: row.trip_id, user: row.user_id, title: row.title, source: row.source, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}

export function mapItineraryItem(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    itineraryId: row.itinerary_id,
    tripId: row.trip_id,
    user: row.user_id,
    dayNumber: row.day_number,
    timeBlock: row.time_block,
    title: row.title,
    description: row.description || '',
    locationName: row.location_name || '',
    category: row.category || 'activity',
    estimatedCost: Number(row.estimated_cost || 0),
    sortOrder: row.sort_order || 0,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBooking(row) {
  if (!row) return null;
  return { _id: row.id, id: row.id, tripId: row.trip_id, user: row.user_id, bookingType: row.booking_type, title: row.title, provider: row.provider || '', referenceNumber: row.reference_number || '', startAt: row.start_at, endAt: row.end_at, details: row.details || {}, documentUrl: row.document_url || '', createdAt: row.created_at, updatedAt: row.updated_at };
}

export function mapChecklistItem(row) {
  if (!row) return null;
  return { _id: row.id, id: row.id, tripId: row.trip_id, user: row.user_id, category: row.category || 'Travel Essentials', title: row.title, isComplete: Boolean(row.is_complete), sortOrder: row.sort_order || 0, createdAt: row.created_at, updatedAt: row.updated_at };
}

export function mapTravelDocument(row) {
  if (!row) return null;
  return { _id: row.id, id: row.id, tripId: row.trip_id, user: row.user_id, documentType: row.document_type, title: row.title, filePath: row.file_path || '', fileName: row.file_name || '', mimeType: row.mime_type || '', notes: row.notes || '', createdAt: row.created_at, updatedAt: row.updated_at };
}

export function mapNotification(row) {
  if (!row) return null;
  return { _id: row.id, id: row.id, tripId: row.trip_id, user: row.user_id, notificationType: row.notification_type, title: row.title, message: row.message || '', remindAt: row.remind_at, isRead: Boolean(row.is_read), priority: row.priority || 'medium', createdAt: row.created_at, updatedAt: row.updated_at };
}

export function mapSavedLocation(row) {
  if (!row) return null;
  return { _id: row.id, id: row.id, tripId: row.trip_id, user: row.user_id, locationType: row.location_type, name: row.name, address: row.address || '', lat: row.lat, lng: row.lng, notes: row.notes || '', metadata: row.metadata || {}, createdAt: row.created_at, updatedAt: row.updated_at };
}

export function mapDestinationRecommendation(row) {
  if (!row) return null;
  return { _id: row.id, id: row.id, user: row.user_id, tripId: row.trip_id, destinationName: row.destination_name, country: row.country || '', city: row.city || '', imageUrl: row.image_url || '', estimatedBudget: Number(row.estimated_budget || 0), bestTimeToVisit: row.best_time_to_visit || '', rating: Number(row.rating || 0), popularAttractions: row.popular_attractions || [], travelTips: row.travel_tips || [], metadata: row.metadata || {}, createdAt: row.created_at, updatedAt: row.updated_at };
}
