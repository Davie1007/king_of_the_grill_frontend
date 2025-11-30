import axios from "axios";

export const API_BASE_URL = 'http://127.0.0.1:8000';
export const clientPOS = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

clientPOS.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function LocationClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onClick(lat, lng);
    },
  });
  return null;
}
