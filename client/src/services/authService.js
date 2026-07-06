import { supabase } from './supabaseClient.js';
import { createServiceError, mapProfile, throwIfError } from './supabaseUtils.js';

async function getProfileForAuthUser(authUser) {
  if (!authUser) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();
  throwIfError(error, 'Unable to load profile.');

  if (authUser.email && data && data.email !== authUser.email) {
    await supabase.from('profiles').update({ email: authUser.email }).eq('id', authUser.id);
    return mapProfile({ ...data, email: authUser.email }, authUser);
  }

  return mapProfile(data, authUser);
}

export async function register(payload) {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        name: payload.name,
      },
    },
  });

  throwIfError(error, 'Registration failed. Please try again.');

  return {
    user: data.session ? await getProfileForAuthUser(data.user) : null,
    needsEmailConfirmation: Boolean(data.user && !data.session),
  };
}

export async function login(payload) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  throwIfError(error, 'Login failed. Please try again.');

  return { user: await getProfileForAuthUser(data.user) };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  throwIfError(error, 'Logout failed. Please try again.');

  return { user: null };
}

export async function requestPasswordReset(email) {
  const redirectTo = `${window.location.origin}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  throwIfError(error, 'Unable to send password reset email.');
  return { success: true };
}

export async function resetPassword(password) {
  const { data, error } = await supabase.auth.updateUser({ password });
  throwIfError(error, 'Unable to update password.');
  return { user: await getProfileForAuthUser(data.user) };
}

export async function getCurrentUser() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  throwIfError(sessionError, 'Unable to refresh user session.');

  if (!sessionData.session) {
    throw createServiceError({ message: 'Not authenticated', status: 401, code: 'AUTH_REQUIRED' });
  }

  const { data, error } = await supabase.auth.getUser();
  throwIfError(error, 'Unable to refresh user session.');

  return { user: await getProfileForAuthUser(data.user) };
}
