import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Central event emitter/handler for API errors so that UI components can listen and trigger toast notifications
type ErrorListener = (message: string, type: 'error' | 'warning') => void;
const listeners = new Set<ErrorListener>();

export const subscribeToApiErrors = (listener: ErrorListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyError = (message: string, type: 'error' | 'warning' = 'error') => {
  listeners.forEach((listener) => listener(message, type));
};

const API_BASE_URL = (import.meta.env.VITE_API_URL as string);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach authentication token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('erp_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardized Error Handling
apiClient.interceptors.response.use(
  (response) => {
    // Return the standard inner data object
    return response;
  },
  (error: AxiosError<any>) => {
    if (!error.response) {
      notifyError('Network error: Unable to connect to the server. Please check your internet connection.');
      return Promise.reject(new Error('Network connection error'));
    }

    const { status, data } = error.response;
    const serverMessage = data?.error?.message || data?.message;

    let userFriendlyMessage = 'An unexpected error occurred';

    switch (status) {
      case 400:
        userFriendlyMessage = serverMessage || 'Invalid request details. Please check your inputs.';
        break;
      case 401:
        userFriendlyMessage = serverMessage || 'Session expired. Please log in again.';
        // Clear token on token expiration/unauthorized
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
        // Redirect to login if not already there
        if (!window.location.pathname.endsWith('/login')) {
          window.location.href = '/login';
        }
        break;
      case 403:
        userFriendlyMessage = serverMessage || 'You do not have permission to perform this action.';
        break;
      case 404:
        userFriendlyMessage = serverMessage || 'Requested resource could not be found.';
        break;
      case 409:
        userFriendlyMessage = serverMessage || 'Conflict occurred: This item might already exist.';
        break;
      case 422:
        userFriendlyMessage = serverMessage || 'Validation failed. Please verify your form data.';
        break;
      case 429:
        userFriendlyMessage = 'Too many requests. Please wait a moment before trying again.';
        break;
      case 500:
        userFriendlyMessage = 'Server error. Our engineers have been notified. Please try again later.';
        break;
      default:
        userFriendlyMessage = serverMessage || 'Something went wrong. Please try again.';
    }

    // Trigger toast notification
    notifyError(userFriendlyMessage);

    // Create a normalized error object to propagate to React Query
    const normalizedError = {
      status,
      code: data?.error?.code || 'API_ERROR',
      message: userFriendlyMessage,
      details: data?.error?.details || null,
    };

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
