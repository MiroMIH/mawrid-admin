import { apiClient } from '../../api/client';
import type { ApiResponse, User, PaginatedResponse } from '../../types';

export const usersApi = {
  listUsers: async (params: { page?: number; size?: number }) => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', { params });
    return res.data.data;
  },
  toggleUser: async (userId: number) => {
    const res = await apiClient.patch<ApiResponse<{ enabled: boolean }>>(`/admin/users/${userId}/toggle-enabled`);
    return res.data.data;
  },
};
