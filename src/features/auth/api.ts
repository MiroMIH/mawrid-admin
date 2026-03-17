import { apiClient } from '../../api/client';
import type { ApiResponse, User } from '../../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload);
    return res.data.data;
  },
  logout: async () => {
    await apiClient.post('/auth/logout');
  },
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/users/me');
    return res.data.data;
  },
};
