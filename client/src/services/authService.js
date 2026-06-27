import apiClient from './apiClient.js';

function unwrap(response) {
  return response.data.data;
}

export async function register(payload) {
  const response = await apiClient.post('/auth/register', payload);
  return unwrap(response);
}

export async function login(payload) {
  const response = await apiClient.post('/auth/login', payload);
  return unwrap(response);
}

export async function logout() {
  const response = await apiClient.post('/auth/logout');
  return unwrap(response);
}

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me');
  return unwrap(response);
}
