import { apiClient } from '../../api/client';
import type { ApiResponse, User } from '../../types';
import type { LoginRequest, RegisterRequest, AuthTokenResponse } from './auth.types';

export const authApi = {
  login: async (payload: LoginRequest): Promise<AuthTokenResponse> => {
    const res = await apiClient.post<ApiResponse<AuthTokenResponse>>('/auth/login', payload);
    return res.data.data;
  },

  register: async (payload: Omit<RegisterRequest, 'confirmPassword'>): Promise<AuthTokenResponse> => {
    const res = await apiClient.post<ApiResponse<AuthTokenResponse>>('/auth/register', payload);
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/users/me');
    return res.data.data;
  },
};
