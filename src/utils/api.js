import axios from 'axios';
export const API_BASE_URL = 'http://127.0.0.1:8000';
export const client = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export default client;
