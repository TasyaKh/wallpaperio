import axios from 'axios';
import SettingsUtils from '../utils/SettingsUtils';

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = SettingsUtils.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; 