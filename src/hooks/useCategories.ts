import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../features/categories/api';

export const CATEGORY_KEYS = {
  tree: ['categories', 'tree'] as const,
  search: (params: object) => ['categories', 'search', params] as const,
  attributes: (id: number) => ['categories', id, 'attributes'] as const,
  stats: (id: number) => ['categories', id, 'stats'] as const,
};

export function useCategoryTree() {
  return useQuery({
    queryKey: CATEGORY_KEYS.tree,
    queryFn: categoriesApi.getTree,
    staleTime: 30000,
  });
}

export function useCategorySearch(params: {
  q?: string;
  depth?: number;
  nodeType?: string;
  active?: boolean;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: CATEGORY_KEYS.search(params),
    queryFn: () => categoriesApi.adminSearch(params),
    staleTime: 10000,
  });
}

export function useCategoryAttributes(id: number) {
  return useQuery({
    queryKey: CATEGORY_KEYS.attributes(id),
    queryFn: () => categoriesApi.getAttributes(id),
    enabled: !!id,
  });
}

export function useCategoryStats(id: number) {
  return useQuery({
    queryKey: CATEGORY_KEYS.stats(id),
    queryFn: () => categoriesApi.getCategoryStats(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.tree });
      qc.invalidateQueries({ queryKey: ['categories', 'search'] });
    },
  });
}

export function useRenameCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name: string; forceRename?: boolean } }) =>
      categoriesApi.renameCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.tree });
      qc.invalidateQueries({ queryKey: ['categories', 'search'] });
    },
  });
}

export function useMarkAsLeaf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.markAsLeaf,
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORY_KEYS.tree }),
  });
}

export function useUnmarkLeaf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.unmarkLeaf,
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORY_KEYS.tree }),
  });
}

export function useMoveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newParentId }: { id: number; newParentId: number }) =>
      categoriesApi.moveCategory(id, newParentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.tree });
      qc.invalidateQueries({ queryKey: ['categories', 'search'] });
    },
  });
}

export function useToggleCategoryActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.toggleActive,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.tree });
      qc.invalidateQueries({ queryKey: ['categories', 'search'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.tree });
      qc.invalidateQueries({ queryKey: ['categories', 'search'] });
    },
  });
}

export function useAddAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, payload }: {
      categoryId: number;
      payload: { key: string; label: string; type: string; required: boolean; displayOrder: number; options?: string[] };
    }) => categoriesApi.addAttribute(categoryId, payload),
    onSuccess: (_, { categoryId }) => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.attributes(categoryId) });
    },
  });
}

export function useUpdateAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, attrId, payload }: {
      categoryId: number;
      attrId: number;
      payload: { key: string; label: string; type: string; required: boolean; displayOrder: number; options?: string[] };
    }) => categoriesApi.updateAttribute(categoryId, attrId, payload),
    onSuccess: (_, { categoryId }) => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.attributes(categoryId) });
    },
  });
}

export function useDeleteAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, attrId }: { categoryId: number; attrId: number }) =>
      categoriesApi.deleteAttribute(categoryId, attrId),
    onSuccess: (_, { categoryId }) => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.attributes(categoryId) });
    },
  });
}
