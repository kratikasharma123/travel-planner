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
    throw createServiceError({
      message: 'You must be logged in.',
      status: 401,
      code: 'AUTH_REQUIRED',
    });
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
    email: row?.email || authUser?.email || '',
    name: row?.name || authUser?.user_metadata?.name || '',
    role: row?.role || 'user',
    status: row?.status || 'active',
    permissions: row?.permissions || {},
    avatarUrl: row?.avatar_url || authUser?.user_metadata?.avatar_url || '',
    suspendedAt: row?.suspended_at,
    suspensionReason: row?.suspension_reason || '',
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
    isFavorite: Boolean(row.is_favorite),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function tripPayloadToRow(payload = {}, userId) {
  return {
    ...(userId ? { user_id: userId } : {}),
    ...(payload.destination !== undefined ? { destination_id: payload.destination || null } : {}),
    ...(payload.destinationId !== undefined
      ? { destination_id: payload.destinationId || null }
      : {}),
    ...(payload.customDestination !== undefined
      ? { custom_destination: payload.customDestination || {} }
      : {}),
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.startDate !== undefined ? { start_date: payload.startDate || null } : {}),
    ...(payload.endDate !== undefined ? { end_date: payload.endDate || null } : {}),
    ...(payload.durationDays !== undefined
      ? { duration_days: payload.durationDays ? Number(payload.durationDays) : null }
      : {}),
    ...(payload.travelerCount !== undefined
      ? { traveler_count: Number(payload.travelerCount || 1) }
      : {}),
    ...(payload.travelStyle !== undefined ? { travel_style: payload.travelStyle || '' } : {}),
    ...(payload.interests !== undefined ? { interests: payload.interests || [] } : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes || '' } : {}),
    ...(payload.city !== undefined ? { city: payload.city || '' } : {}),
    ...(payload.country !== undefined ? { country: payload.country || '' } : {}),
    ...(payload.budget !== undefined ? { budget: Number(payload.budget || 0) } : {}),
    ...(payload.weatherSummary !== undefined
      ? { weather_summary: payload.weatherSummary || {} }
      : {}),
    ...(payload.progress !== undefined ? { progress: Number(payload.progress || 0) } : {}),
    ...(payload.status !== undefined ? { status: payload.status || 'draft' } : {}),
    ...(payload.isFavorite !== undefined ? { is_favorite: Boolean(payload.isFavorite) } : {}),
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

export function mapSavedPlace(row) {
  if (!row) return null;

  const destination = mapDestination(row.destinations);
  const metadata = row.metadata || {};

  return {
    _id: row.id,
    id: row.id,
    user: row.user_id,
    destinationId: row.destination_id,
    destination,
    name: row.name || destination?.name || metadata.name || '',
    city: row.city || destination?.region || metadata.city || '',
    country: row.country || destination?.country || metadata.country || '',
    category: row.category || metadata.category || 'Destinations',
    notes: row.notes || destination?.description || '',
    imageUrl: row.image_url || destination?.imageUrl || metadata.imageUrl || '',
    rating: Number(row.rating || metadata.rating || 4.7),
    budgetLevel: row.budget_level || destination?.costLevel || metadata.budgetLevel || 'mid-range',
    bestTime: row.best_time || destination?.bestTimeToVisit || metadata.bestTime || '',
    tags: row.tags || destination?.tags || [],
    metadata,
    savedAt: row.saved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    raw: metadata.raw || null,
  };
}

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function savedPlacePayloadToRow(payload = {}, userId) {
  return {
    ...(userId ? { user_id: userId } : {}),
    ...(payload.destinationId !== undefined ? { destination_id: isUuid(payload.destinationId) ? payload.destinationId : null } : {}),
    ...(payload.name !== undefined ? { name: payload.name || '' } : {}),
    ...(payload.city !== undefined ? { city: payload.city || '' } : {}),
    ...(payload.country !== undefined ? { country: payload.country || '' } : {}),
    ...(payload.category !== undefined ? { category: payload.category || 'Destinations' } : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes || '' } : {}),
    ...(payload.imageUrl !== undefined ? { image_url: payload.imageUrl || '' } : {}),
    ...(payload.rating !== undefined ? { rating: Number(payload.rating || 0) } : {}),
    ...(payload.budgetLevel !== undefined ? { budget_level: payload.budgetLevel || '' } : {}),
    ...(payload.bestTime !== undefined ? { best_time: payload.bestTime || '' } : {}),
    ...(payload.tags !== undefined ? { tags: payload.tags || [] } : {}),
    ...(payload.metadata !== undefined ? { metadata: payload.metadata || {} } : {}),
  };
}

export function mapChatSession(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    user: row.user_id,
    tripId: row.trip_id,
    title: row.title,
    context: row.context || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapChatMessage(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    sessionId: row.session_id,
    user: row.user_id,
    role: row.role,
    content: row.content,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  };
}

export function mapItinerary(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    tripId: row.trip_id,
    user: row.user_id,
    title: row.title,
    source: row.source,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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
  const details = row.details || {};
  const bookingType = row.booking_type || row.type || 'activity';
  const status = row.status || details.status || 'upcoming';
  const startAt = row.start_at || row.booking_date || null;

  return {
    _id: row.id,
    id: row.id,
    tripId: row.trip_id,
    trip: mapTrip(row.trips) || row.trip_id,
    user: row.user_id,
    bookingType,
    type: details.displayType || bookingType,
    title: row.title,
    provider: row.provider || '',
    referenceNumber: row.reference_number || row.confirmation_id || '',
    confirmationId: row.reference_number || row.confirmation_id || '',
    startAt,
    endAt: row.end_at,
    date: details.date || (startAt ? startAt.slice(0, 10) : ''),
    time: details.time || (startAt ? new Date(startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
    location: row.location || details.location || '',
    status,
    price: Number(row.price || details.price || 0),
    details,
    documentUrl: row.document_url || '',
    image: row.image_url || details.image || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function bookingPayloadToRow(payload = {}, userId) {
  const row = {
    ...(userId ? { user_id: userId } : {}),
    ...(payload.tripId !== undefined ? { trip_id: payload.tripId || null } : {}),
    ...(payload.bookingType !== undefined || payload.type !== undefined ? { booking_type: payload.bookingType || payload.type || 'activity' } : {}),
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.provider !== undefined ? { provider: payload.provider || '' } : {}),
    ...(payload.referenceNumber !== undefined || payload.confirmationId !== undefined
      ? { reference_number: payload.referenceNumber || payload.confirmationId || '' }
      : {}),
    ...(payload.endAt !== undefined ? { end_at: payload.endAt || null } : {}),
    ...(payload.location !== undefined ? { location: payload.location || '' } : {}),
    ...(payload.status !== undefined ? { status: payload.status || 'upcoming' } : {}),
    ...(payload.price !== undefined ? { price: Number(payload.price || 0) } : {}),
    ...(payload.documentUrl !== undefined ? { document_url: payload.documentUrl || '' } : {}),
    ...(payload.image !== undefined || payload.imageUrl !== undefined ? { image_url: payload.image || payload.imageUrl || '' } : {}),
  };

  if (payload.startAt !== undefined || payload.date !== undefined || payload.time !== undefined) {
    const date = payload.date || '';
    const time = payload.time || '';
    row.start_at = payload.startAt || (date ? new Date(`${date}T${time || '00:00'}`).toISOString() : null);
  }

  if (payload.details !== undefined || payload.date !== undefined || payload.time !== undefined || payload.location !== undefined || payload.price !== undefined || payload.image !== undefined || payload.imageUrl !== undefined || payload.type !== undefined) {
    row.details = {
      ...(payload.details || {}),
      ...(payload.date !== undefined ? { date: payload.date || '' } : {}),
      ...(payload.time !== undefined ? { time: payload.time || '' } : {}),
      ...(payload.location !== undefined ? { location: payload.location || '' } : {}),
      ...(payload.price !== undefined ? { price: Number(payload.price || 0) } : {}),
      ...(payload.image !== undefined || payload.imageUrl !== undefined ? { image: payload.image || payload.imageUrl || '' } : {}),
      ...(payload.displayType !== undefined || payload.type !== undefined ? { displayType: payload.displayType || payload.type || '' } : {}),
    };
  }

  return row;
}

export function mapChecklistItem(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    tripId: row.trip_id,
    user: row.user_id,
    category: row.category || 'Travel Essentials',
    title: row.title,
    isComplete: Boolean(row.is_complete),
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTravelDocument(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    tripId: row.trip_id,
    user: row.user_id,
    documentType: row.document_type,
    title: row.title,
    filePath: row.file_path || '',
    fileName: row.file_name || '',
    mimeType: row.mime_type || '',
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapNotification(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    tripId: row.trip_id,
    user: row.user_id,
    notificationType: row.notification_type,
    title: row.title,
    message: row.message || '',
    remindAt: row.remind_at,
    isRead: Boolean(row.is_read),
    priority: row.priority || 'medium',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSavedLocation(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    tripId: row.trip_id,
    user: row.user_id,
    locationType: row.location_type,
    name: row.name,
    address: row.address || '',
    lat: row.lat,
    lng: row.lng,
    notes: row.notes || '',
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDestinationRecommendation(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    user: row.user_id,
    tripId: row.trip_id,
    destinationName: row.destination_name,
    country: row.country || '',
    city: row.city || '',
    imageUrl: row.image_url || '',
    estimatedBudget: Number(row.estimated_budget || 0),
    bestTimeToVisit: row.best_time_to_visit || '',
    rating: Number(row.rating || 0),
    popularAttractions: row.popular_attractions || [],
    travelTips: row.travel_tips || [],
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
