import { supabase } from './supabaseClient.js';
import {
  getCurrentUserId,
  mapBooking,
  mapChatMessage,
  mapChatSession,
  mapChecklistItem,
  mapDestinationRecommendation,
  mapItinerary,
  mapItineraryItem,
  mapNotification,
  mapTravelDocument,
  throwIfError,
} from './supabaseUtils.js';

function basePayload(payload = {}, userId) {
  return { ...(userId ? { user_id: userId } : {}), ...(payload.tripId !== undefined ? { trip_id: payload.tripId || null } : {}) };
}

export async function listChatSessions() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('ai_chat_sessions').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
  throwIfError(error, 'Unable to load chat sessions.');
  return { sessions: (data || []).map(mapChatSession) };
}

export async function createChatSession(payload = {}) {
  const userId = await getCurrentUserId();
  const row = { ...basePayload(payload, userId), title: payload.title || 'Travel chat', context: payload.context || {} };
  const { data, error } = await supabase.from('ai_chat_sessions').insert(row).select('*').single();
  throwIfError(error, 'Unable to create chat session.');
  return { session: mapChatSession(data) };
}

export async function listChatMessages(sessionId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('ai_chat_messages').select('*').eq('session_id', sessionId).eq('user_id', userId).order('created_at');
  throwIfError(error, 'Unable to load chat messages.');
  return { messages: (data || []).map(mapChatMessage) };
}

export async function createChatMessage(payload) {
  const userId = await getCurrentUserId();
  const row = { session_id: payload.sessionId, user_id: userId, role: payload.role, content: payload.content, metadata: payload.metadata || {} };
  const { data, error } = await supabase.from('ai_chat_messages').insert(row).select('*').single();
  throwIfError(error, 'Unable to save chat message.');
  return { message: mapChatMessage(data) };
}

export async function listItineraries(tripId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('trip_itineraries').select('*').eq('trip_id', tripId).eq('user_id', userId).order('created_at', { ascending: false });
  throwIfError(error, 'Unable to load itineraries.');
  return { itineraries: (data || []).map(mapItinerary) };
}

export async function createItinerary(payload) {
  const userId = await getCurrentUserId();
  const row = { trip_id: payload.tripId, user_id: userId, title: payload.title || 'AI Itinerary', source: payload.source || 'ai', status: payload.status || 'saved' };
  const { data, error } = await supabase.from('trip_itineraries').insert(row).select('*').single();
  throwIfError(error, 'Unable to create itinerary.');
  return { itinerary: mapItinerary(data) };
}

export async function listItineraryItems(itineraryId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('itinerary_items').select('*').eq('itinerary_id', itineraryId).eq('user_id', userId).order('day_number').order('sort_order');
  throwIfError(error, 'Unable to load itinerary items.');
  return { items: (data || []).map(mapItineraryItem) };
}

export async function createItineraryItems(itinerary, items = []) {
  const userId = await getCurrentUserId();
  const rows = items.map((item) => ({
    itinerary_id: itinerary.id || itinerary._id,
    trip_id: itinerary.tripId,
    user_id: userId,
    day_number: item.dayNumber,
    time_block: item.timeBlock,
    title: item.title,
    description: item.description || '',
    location_name: item.locationName || '',
    category: item.category || 'activity',
    estimated_cost: Number(item.estimatedCost || 0),
    sort_order: item.sortOrder || 0,
    metadata: item.metadata || {},
  }));
  const { data, error } = await supabase.from('itinerary_items').insert(rows).select('*');
  throwIfError(error, 'Unable to save itinerary items.');
  return { items: (data || []).map(mapItineraryItem) };
}

export async function updateItineraryItem(itemId, payload) {
  const userId = await getCurrentUserId();
  const row = {
    ...(payload.dayNumber !== undefined ? { day_number: payload.dayNumber } : {}),
    ...(payload.timeBlock !== undefined ? { time_block: payload.timeBlock } : {}),
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.description !== undefined ? { description: payload.description || '' } : {}),
    ...(payload.locationName !== undefined ? { location_name: payload.locationName || '' } : {}),
    ...(payload.category !== undefined ? { category: payload.category || 'activity' } : {}),
    ...(payload.estimatedCost !== undefined ? { estimated_cost: Number(payload.estimatedCost || 0) } : {}),
    ...(payload.sortOrder !== undefined ? { sort_order: payload.sortOrder || 0 } : {}),
  };
  const { data, error } = await supabase.from('itinerary_items').update(row).eq('id', itemId).eq('user_id', userId).select('*').single();
  throwIfError(error, 'Unable to update itinerary item.');
  return { item: mapItineraryItem(data) };
}

export async function deleteItineraryItem(itemId) {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('itinerary_items').delete().eq('id', itemId).eq('user_id', userId);
  throwIfError(error, 'Unable to delete itinerary item.');
}

function makeSimpleCrud(table, mapper, fallback) {
  return {
    list: async (tripId) => {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase.from(table).select('*').eq('trip_id', tripId).eq('user_id', userId).order('created_at', { ascending: false });
      throwIfError(error, `Unable to load ${fallback}.`);
      return { records: (data || []).map(mapper) };
    },
    create: async (payload) => {
      const userId = await getCurrentUserId();
      const row = { ...payloadToRow(table, payload), user_id: userId, trip_id: payload.tripId };
      const { data, error } = await supabase.from(table).insert(row).select('*').single();
      throwIfError(error, `Unable to create ${fallback}.`);
      return { record: mapper(data) };
    },
    update: async (id, payload) => {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase.from(table).update(payloadToRow(table, payload)).eq('id', id).eq('user_id', userId).select('*').single();
      throwIfError(error, `Unable to update ${fallback}.`);
      return { record: mapper(data) };
    },
    remove: async (id) => {
      const userId = await getCurrentUserId();
      const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId);
      throwIfError(error, `Unable to delete ${fallback}.`);
    },
  };
}

function payloadToRow(table, payload = {}) {
  if (table === 'trip_bookings') return { booking_type: payload.bookingType || 'activity', title: payload.title, provider: payload.provider || '', reference_number: payload.referenceNumber || '', start_at: payload.startAt || null, end_at: payload.endAt || null, details: payload.details || {}, document_url: payload.documentUrl || '' };
  if (table === 'travel_checklists') return { category: payload.category || 'Travel Essentials', title: payload.title, is_complete: Boolean(payload.isComplete), sort_order: payload.sortOrder || 0 };
  if (table === 'travel_documents') return { document_type: payload.documentType || 'Travel Document', title: payload.title, file_path: payload.filePath || '', file_name: payload.fileName || '', mime_type: payload.mimeType || '', notes: payload.notes || '' };
  if (table === 'trip_notifications') return { notification_type: payload.notificationType || 'reminder', title: payload.title, message: payload.message || '', remind_at: payload.remindAt || null, is_read: Boolean(payload.isRead), priority: payload.priority || 'medium' };
  return payload;
}

export const bookingsCrud = makeSimpleCrud('trip_bookings', mapBooking, 'bookings');
export const checklistsCrud = makeSimpleCrud('travel_checklists', mapChecklistItem, 'checklists');
export const documentsCrud = makeSimpleCrud('travel_documents', mapTravelDocument, 'documents');
export const notificationsCrud = makeSimpleCrud('trip_notifications', mapNotification, 'notifications');

export async function listDestinationRecommendations() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('destination_recommendations').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  throwIfError(error, 'Unable to load recommendations.');
  return { recommendations: (data || []).map(mapDestinationRecommendation) };
}

export async function saveDestinationRecommendations(recommendations = [], tripId = null) {
  const userId = await getCurrentUserId();
  const rows = recommendations.map((item) => ({ user_id: userId, trip_id: tripId, destination_name: item.destinationName, country: item.country || '', city: item.city || '', image_url: item.imageUrl || '', estimated_budget: Number(item.estimatedBudget || 0), best_time_to_visit: item.bestTimeToVisit || '', rating: Number(item.rating || 4.5), popular_attractions: item.popularAttractions || [], travel_tips: item.travelTips || [], metadata: item.metadata || {} }));
  const { data, error } = await supabase.from('destination_recommendations').insert(rows).select('*');
  throwIfError(error, 'Unable to save recommendations.');
  return { recommendations: (data || []).map(mapDestinationRecommendation) };
}
