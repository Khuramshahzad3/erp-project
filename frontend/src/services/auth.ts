import apiClient from './api/axiosInstance';
import type { LoginCredentials, AuthResponse, UserProfile } from '../types/api.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
  },

  me: async (): Promise<{ data: UserProfile }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
