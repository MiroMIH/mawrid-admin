import { apiClient } from '../../api/client';
import type { ApiResponse, DashboardStats, MatchingSimulation } from '../../types';

export const statsApi = {
  getDashboardStats: async () => {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/admin/stats');
    return res.data.data;
  },
  simulateMatching: async (payload: MatchingSimulation) => {
    const res = await apiClient.post<ApiResponse<unknown>>('/admin/matching/simulate', payload);
    return res.data.data;
  },
};
