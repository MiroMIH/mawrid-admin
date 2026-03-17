import { apiClient } from '@/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type {
  CategoryTreeNode,
  CategoryResponse,
  CategoryAttributeResponse,
  CategoryStatsResponse,
  CategoryCreateRequest,
  CategoryRenameRequest,
  CategoryAttributeRequest,
} from '../types/category.types';

/** Full typed API layer for the categories feature. */
export const categoriesApi = {
  /** GET /categories/tree — full recursive tree */
  getTree: async (): Promise<CategoryTreeNode[]> => {
    const res = await apiClient.get<ApiResponse<CategoryTreeNode[]>>('/categories/tree');
    return res.data.data;
  },

  /** GET /categories/:id */
  getById: async (id: number): Promise<CategoryResponse> => {
    const res = await apiClient.get<ApiResponse<CategoryResponse>>(`/categories/${id}`);
    return res.data.data;
  },

  /** GET /categories/:id/attributes — all (own + inherited) */
  getAttributes: async (id: number): Promise<CategoryAttributeResponse[]> => {
    const res = await apiClient.get<ApiResponse<CategoryAttributeResponse[]>>(
      `/categories/${id}/attributes`,
    );
    return res.data.data;
  },

  /** GET /admin/categories/:id/stats */
  getStats: async (id: number): Promise<CategoryStatsResponse> => {
    const res = await apiClient.get<ApiResponse<CategoryStatsResponse>>(
      `/admin/categories/${id}/stats`,
    );
    return res.data.data;
  },

  /** GET /admin/categories/search */
  search: async (params: {
    q?: string;
    depth?: number;
    nodeType?: string;
    active?: boolean;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<CategoryResponse>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<CategoryResponse>>>(
      '/admin/categories/search',
      { params },
    );
    return res.data.data;
  },

  /** POST /admin/categories */
  createCategory: async (data: CategoryCreateRequest): Promise<CategoryResponse> => {
    const res = await apiClient.post<ApiResponse<CategoryResponse>>('/admin/categories', data);
    return res.data.data;
  },

  /** PATCH /admin/categories/:id/rename */
  renameCategory: async (id: number, data: CategoryRenameRequest): Promise<CategoryResponse> => {
    const res = await apiClient.patch<ApiResponse<CategoryResponse>>(
      `/admin/categories/${id}/rename`,
      data,
    );
    return res.data.data;
  },

  /** PATCH /admin/categories/:id/toggle-active */
  toggleActive: async (id: number): Promise<CategoryResponse> => {
    const res = await apiClient.patch<ApiResponse<CategoryResponse>>(
      `/admin/categories/${id}/toggle-active`,
    );
    return res.data.data;
  },

  /** POST /admin/categories/:id/move */
  moveCategory: async (id: number, newParentId: number): Promise<CategoryResponse> => {
    const res = await apiClient.post<ApiResponse<CategoryResponse>>(
      `/admin/categories/${id}/move`,
      { newParentId },
    );
    return res.data.data;
  },

  /** DELETE /admin/categories/:id */
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },

  /** PATCH /admin/categories/:id/mark-leaf */
  markLeaf: async (id: number): Promise<CategoryResponse> => {
    const res = await apiClient.patch<ApiResponse<CategoryResponse>>(
      `/admin/categories/${id}/mark-leaf`,
    );
    return res.data.data;
  },

  /** PATCH /admin/categories/:id/unmark-leaf */
  unmarkLeaf: async (id: number): Promise<CategoryResponse> => {
    const res = await apiClient.patch<ApiResponse<CategoryResponse>>(
      `/admin/categories/${id}/unmark-leaf`,
    );
    return res.data.data;
  },

  /** POST /admin/categories/:id/attributes */
  addAttribute: async (
    categoryId: number,
    data: CategoryAttributeRequest,
  ): Promise<CategoryAttributeResponse> => {
    const res = await apiClient.post<ApiResponse<CategoryAttributeResponse>>(
      `/admin/categories/${categoryId}/attributes`,
      data,
    );
    return res.data.data;
  },

  /** PATCH /admin/categories/:id/attributes/:attrId */
  updateAttribute: async (
    categoryId: number,
    attrId: number,
    data: CategoryAttributeRequest,
  ): Promise<CategoryAttributeResponse> => {
    const res = await apiClient.patch<ApiResponse<CategoryAttributeResponse>>(
      `/admin/categories/${categoryId}/attributes/${attrId}`,
      data,
    );
    return res.data.data;
  },

  /** DELETE /admin/categories/:id/attributes/:attrId */
  deleteAttribute: async (categoryId: number, attrId: number): Promise<void> => {
    await apiClient.delete(`/admin/categories/${categoryId}/attributes/${attrId}`);
  },
};
