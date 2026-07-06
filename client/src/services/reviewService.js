import { supabase } from './supabaseClient.js';
import { getCurrentUserId, throwIfError } from './supabaseUtils.js';

function mapReview(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    tripId: row.trip_id,
    destinationId: row.destination_id,
    rating: Number(row.rating || 0),
    comment: row.comment || '',
    status: row.status || 'pending',
    moderationNotes: row.moderation_notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listDestinationReviews(destinationId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('destination_id', destinationId)
    .in('status', ['approved', 'pending', 'reported'])
    .order('created_at', { ascending: false });
  throwIfError(error, 'Unable to load reviews.');
  return { reviews: (data || []).map(mapReview) };
}

export async function createDestinationReview(destinationId, payload = {}) {
  const userId = await getCurrentUserId();
  const row = {
    user_id: userId,
    destination_id: destinationId,
    trip_id: payload.tripId || null,
    rating: Number(payload.rating || 5),
    comment: payload.comment || '',
    status: 'pending',
  };
  const { data, error } = await supabase.from('reviews').insert(row).select('*').single();
  throwIfError(error, 'Unable to save review.');
  return { review: mapReview(data) };
}
