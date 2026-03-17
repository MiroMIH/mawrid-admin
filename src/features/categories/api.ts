import { apiClient } from '../../api/client';
import type { ApiResponse, Category, Attribute, CategoryStats, PaginatedResponse } from '../../types';

export const categoriesApi = {
  getTree: async () => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories/tree');
    return res.data.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return res.data.data;
  },
  getAttributes: async (id: number) => {
    const res = await apiClient.get<ApiResponse<Attribute[]>>(`/categories/${id}/attributes`);
    return res.data.data;
  },

  // Admin
  adminSearch: async (params: {
    q?: string;
    depth?: number;
    nodeType?: string;
    active?: boolean;
    page?: number;
    size?: number;
  }) => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<Category>>>('/admin/categories/search', { params });
    return res.data.data;
  },
  createCategory: async (payload: { name: string; parentId?: number }) => {
    const res = await apiClient.post<ApiResponse<Category>>('/admin/categories', payload);
    return res.data.data;
  },
  renameCategory: async (id: number, payload: { name: string; forceRename?: boolean }) => {
    const res = await apiClient.patch<ApiResponse<Category>>(`/admin/categories/${id}/rename`, payload);
    return res.data.data;
  },
  markAsLeaf: async (id: number) => {
    const res = await apiClient.patch<ApiResponse<Category>>(`/admin/categories/${id}/mark-leaf`);
    return res.data.data;
  },
  unmarkLeaf: async (id: number) => {
    const res = await apiClient.patch<ApiResponse<Category>>(`/admin/categories/${id}/unmark-leaf`);
    return res.data.data;
  },
  moveCategory: async (id: number, newParentId: number) => {
    const res = await apiClient.post<ApiResponse<Category>>(`/admin/categories/${id}/move`, { newParentId });
    return res.data.data;
  },
  toggleActive: async (id: number) => {
    const res = await apiClient.patch<ApiResponse<Category>>(`/admin/categories/${id}/toggle-active`);
    return res.data.data;
  },
  deleteCategory: async (id: number) => {
    await apiClient.delete(`/admin/categories/${id}`);
  },
  getCategoryStats: async (id: number) => {
    const res = await apiClient.get<ApiResponse<CategoryStats>>(`/admin/categories/${id}/stats`);
    return res.data.data;
  },

  // Attributes
  addAttribute: async (categoryId: number, payload: {
    key: string;
    label: string;
    type: string;
    required: boolean;
    displayOrder: number;
    options?: string[];
  }) => {
    const res = await apiClient.post<ApiResponse<Attribute>>(`/admin/categories/${categoryId}/attributes`, payload);
    return res.data.data;
  },
  updateAttribute: async (categoryId: number, attrId: number, payload: {
    key: string;
    label: string;
    type: string;
    required: boolean;
    displayOrder: number;
    options?: string[];
  }) => {
    const res = await apiClient.patch<ApiResponse<Attribute>>(`/admin/categories/${categoryId}/attributes/${attrId}`, payload);
    return res.data.data;
  },
  deleteAttribute: async (categoryId: number, attrId: number) => {
    await apiClient.delete(`/admin/categories/${categoryId}/attributes/${attrId}`);
  },
};
