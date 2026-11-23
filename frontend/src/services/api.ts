import axios from 'axios';

export const TOKEN_KEY = 'notes_app_token';
export const AUTH_EXPIRED_EVENT = 'notes:auth-expired';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const isLoginCall = axios.isAxiosError(error) && /\/auth\/(login|signup)/.test(error.config?.url ?? '');
    if (axios.isAxiosError(error) && error.response?.status === 401 && !isLoginCall) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; details?: unknown } | undefined;
    if (Array.isArray(data?.details) && data.details.length > 0) {
      return data.details.join('. ');
    }
    if (data?.message) {
      return data.message;
    }
    if (!error.response) {
      return 'Cannot reach the server. Check your connection and try again.';
    }
  }
  return fallback;
};

export default api;
