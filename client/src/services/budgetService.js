import { supabase } from './supabaseClient.js';
import { createServiceError, getCurrentUserId, mapBudget, throwIfError } from './supabaseUtils.js';

function calculateTotal(categories = {}) {
  return Object.values(categories).reduce((total, value) => total + Number(value || 0), 0);
}

async function ensureOwnTrip(userId, tripId) {
  const { data, error } = await supabase.from('trips').select('id').eq('id', tripId).eq('user_id', userId).maybeSingle();
  throwIfError(error, 'Unable to verify trip ownership.');

  if (!data) {
    throw createServiceError({ message: 'Trip not found.', status: 404, code: 'TRIP_NOT_FOUND' });
  }
}

export async function getBudget(tripId) {
  const userId = await getCurrentUserId();
  await ensureOwnTrip(userId, tripId);

  const { data, error } = await supabase.from('budgets').select('*').eq('trip_id', tripId).eq('user_id', userId).maybeSingle();
  throwIfError(error, 'Unable to load budget.');

  if (!data) {
    throw createServiceError({ message: 'Budget not found.', status: 404, code: 'BUDGET_NOT_FOUND' });
  }

  return { budget: mapBudget(data) };
}

export async function updateBudget(tripId, payload) {
  const userId = await getCurrentUserId();
  await ensureOwnTrip(userId, tripId);

  const categories = payload.categories || {};
  const row = {
    user_id: userId,
    trip_id: tripId,
    currency: (payload.currency || 'USD').toUpperCase(),
    categories,
    total_estimate: calculateTotal(categories),
    confidence_level: payload.confidenceLevel || 'low',
    notes: payload.notes || '',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('budgets')
    .upsert(row, { onConflict: 'user_id,trip_id' })
    .select('*')
    .single();

  throwIfError(error, 'Unable to save budget.');

  return { budget: mapBudget(data) };
}

export async function deleteBudget(budgetId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('budgets').delete().eq('id', budgetId).eq('user_id', userId).select('*').single();
  throwIfError(error, 'Unable to delete budget.');

  return { budget: mapBudget(data) };
}
