import { supabase } from './supabaseClient.js';
import { createServiceError, getCurrentUserId, mapProfile, throwIfError } from './supabaseUtils.js';

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
    email: authData.user?.email || '',
    name: payload.name ?? authData.user?.user_metadata?.name ?? '',
    ...(payload.travelPreferences !== undefined ? { travel_preferences: payload.travelPreferences } : {}),
    ...(payload.avatarUrl !== undefined ? { avatar_url: payload.avatarUrl || '' } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' }).select('*').single();
  throwIfError(error, 'Profile update failed. Please try again.');

  return { user: mapProfile(data, authData.user) };
}

function getAvatarExtension(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'webp') return extension;
  return 'jpg';
}

function isStorageNotConfigured(error) {
  const message = `${error?.message || ''} ${error?.error_description || ''}`.toLowerCase();
  const status = error?.statusCode || error?.status;

  return (
    status === 400 ||
    status === 404 ||
    status === 403 ||
    message.includes('bucket not found') ||
    message.includes('not found') ||
    message.includes('row-level security') ||
    message.includes('violates row-level security') ||
    message.includes('unauthorized')
  );
}

export async function uploadProfileAvatar(file) {
  const userId = await getCurrentUserId();
  const extension = getAvatarExtension(file);
  const path = `${userId}/avatar.${extension}`;
  const knownAvatarPaths = ['jpg', 'jpeg', 'png', 'webp'].map((item) => `${userId}/avatar.${item}`);

  const { error: removeError } = await supabase.storage.from('profile-images').remove(knownAvatarPaths);
  if (removeError && !isStorageNotConfigured(removeError)) {
    throw createServiceError(removeError, 'Unable to replace old profile image.');
  }

  const { error: uploadError } = await supabase.storage.from('profile-images').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    if (isStorageNotConfigured(uploadError)) {
      // TODO: Supabase Storage upload logic will work here after the profile-images bucket and policies are configured.
      return { avatarUrl: '', storageConfigured: false };
    }

    throw createServiceError(uploadError, 'Profile photo upload failed. Please try again.');
  }

  const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
  const avatarUrl = `${data.publicUrl}?updated=${Date.now()}`;
  const profile = await updateProfile({ avatarUrl });

  return { avatarUrl, storageConfigured: true, user: profile.user };
}

export async function updatePreferences(preferences) {
  return updateProfile({ travelPreferences: preferences });
}
