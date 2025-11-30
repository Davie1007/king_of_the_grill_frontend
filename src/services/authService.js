import { client } from './apiClient';

/**
 * Logs in using username + password.
 * Expects Laravel backend route: POST /api/login { username, password }
 */
export async function loginUser(username, password) {
  const res = await client.post('/api/auth/token', { username, password });

  const { access_token } = res.data;
  if (access_token) {
    localStorage.setItem('access_token', access_token);
  }

  return res.data;
}

/** Logout and clear session */
export function logoutUser() {
  localStorage.removeItem('access_token');
  window.location.href = '/login';
}

/** Simple auth state check */
export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}
