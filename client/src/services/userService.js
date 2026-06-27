import apiClient from './apiClient.js';

function unwrap(response) {
  return response.data.data;
}

export async function getProfile() {
  const response = await apiClient.get('/users/profile');
  return unwrap(response);
}

export async function updateProfile(payload) {
  const response = await apiClient.patch('/users/profile', payload);
  return unwrap(response);
}

export async function updatePreferences(payload) {
  const response = await apiClient.patch('/users/preferences', payload);
  return unwrap(response);
}
