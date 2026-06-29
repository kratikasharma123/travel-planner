import { supabase } from './supabaseClient.js';
import { getCurrentUserId, mapProfile, throwIfError } from './supabaseUtils.js';

export async function getProfile() {
  const userId = await getCurrentUserId();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  throwIfError(authError, 'Unable to load profile.');

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  throwIfError(error, 'Unable to load profile.');

  return { user: mapProfile(data, authData.user) };
}

export async function updateProfile(payload) {
  const userId = await getCurrentUserId();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  throwIfError(authError, 'Unable to refresh user session.');

  const updates = {
    id: userId,
    name: payload.name ?? authData.user?.user_metadata?.name ?? '',
    ...(payload.travelPreferences !== undefined ? { travel_preferences: payload.travelPreferences } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' }).select('*').single();
  throwIfError(error, 'Profile update failed. Please try again.');

  return { user: mapProfile(data, authData.user) };
}

export async function updatePreferences(preferences) {
  return updateProfile({ travelPreferences: preferences });
}
