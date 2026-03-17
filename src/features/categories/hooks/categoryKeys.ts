/** Centralised TanStack Query key factory for the categories feature. */
export const CATEGORY_KEYS = {
  all: ['categories'] as const,
  tree: () => [...CATEGORY_KEYS.all, 'tree'] as const,
  detail: (id: number) => [...CATEGORY_KEYS.all, 'detail', id] as const,
  attributes: (id: number) => [...CATEGORY_KEYS.all, 'attributes', id] as const,
  stats: (id: number) => [...CATEGORY_KEYS.all, 'stats', id] as const,
  search: (params: object) => [...CATEGORY_KEYS.all, 'search', params] as const,
};
