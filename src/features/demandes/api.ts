import { apiClient } from '../../api/client';
import type {
  ApiResponse,
  PaginatedResponse,
  DemandeSummary,
  DemandeDetail,
  ScoreBreakdown,
  DemandeStats,
  DemandeStatus,
} from '../../types';

export const demandesApi = {
  listAll: async (params: {
    status?: DemandeStatus;
    page?: number;
    size?: number;
    sort?: string;
  }) => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<DemandeSummary>>>(
      '/admin/demandes',
      { params },
    );
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<DemandeDetail>>(`/admin/demandes/${id}`);
    return res.data.data;
  },

  getScores: async (id: string) => {
    const res = await apiClient.get<ApiResponse<ScoreBreakdown[]>>(`/admin/demandes/${id}/scores`);
    return res.data.data;
  },

  getStats: async () => {
    const res = await apiClient.get<ApiResponse<DemandeStats>>('/admin/demandes/stats');
    return res.data.data;
  },

  forceClose: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<DemandeDetail>>(`/admin/demandes/${id}/force-close`);
    return res.data.data;
  },

  expire: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<DemandeDetail>>(`/admin/demandes/${id}/expire`);
    return res.data.data;
  },

  recategorize: async (id: string, newCategoryId: number) => {
    const res = await apiClient.patch<ApiResponse<DemandeDetail>>(
      `/admin/demandes/${id}/recategorize`,
      { newCategoryId },
    );
    return res.data.data;
  },
};
