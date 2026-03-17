import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories.api';
import { CATEGORY_KEYS } from './categoryKeys';
import type {
  CategoryAttributeRequest,
  CategoryCreateRequest,
  CategoryRenameRequest,
} from '../types/category.types';

/* ── Queries ── */

export function useCategoryTree() {
  return useQuery({
    queryKey: CATEGORY_KEYS.tree(),
    queryFn: categoriesApi.getTree,
    staleTime: 30_000,
  });
}

export function useCategoryDetail(id: number | null) {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(id ?? 0),
    queryFn: () => categoriesApi.getById(id!),
    enabled: id != null,
    staleTime: 15_000,
  });
}

export function useCategoryStats(id: number | null) {
  return useQuery({
    queryKey: CATEGORY_KEYS.stats(id ?? 0),
    queryFn: () => categoriesApi.getStats(id!),
    enabled: id != null,
    staleTime: 15_000,
  });
}

export function useCategoryAttributes(id: number | null) {
  return useQuery({
    queryKey: CATEGORY_KEYS.attributes(id ?? 0),
    queryFn: () => categoriesApi.getAttributes(id!),
    enabled: id != null,
    staleTime: 15_000,
  });
}

/* ── Mutations ── */

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
}

export function useCreateCategory() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (req: CategoryCreateRequest) => categoriesApi.createCategory(req),
    onSuccess: invalidate,
  });
}

export function useRenameCategory() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryRenameRequest }) =>
      categoriesApi.renameCategory(id, payload),
    onSuccess: invalidate,
  });
}

export function useToggleActive() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: number) => categoriesApi.toggleActive(id),
    onSuccess: invalidate,
  });
}

export function useMoveCategory() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, newParentId }: { id: number; newParentId: number }) =>
      categoriesApi.moveCategory(id, newParentId),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all }),
  });
}

export function useMarkLeaf() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: number) => categoriesApi.markLeaf(id),
    onSuccess: invalidate,
  });
}

export function useUnmarkLeaf() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: number) => categoriesApi.unmarkLeaf(id),
    onSuccess: invalidate,
  });
}

export function useAddAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, payload }: { categoryId: number; payload: CategoryAttributeRequest }) =>
      categoriesApi.addAttribute(categoryId, payload),
    onSuccess: (_, { categoryId }) => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.attributes(categoryId) });
    },
  });
}

export function useUpdateAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      attrId,
      payload,
    }: {
      categoryId: number;
      attrId: number;
      payload: CategoryAttributeRequest;
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
