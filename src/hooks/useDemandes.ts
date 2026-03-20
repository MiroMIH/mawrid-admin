import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { demandesApi } from '../features/demandes/api';
import type { DemandeStatus } from '../types';

export const DEMANDE_KEYS = {
  all:    ['demandes'] as const,
  list:   (p: object) => ['demandes', 'list', p] as const,
  detail: (id: string) => ['demandes', 'detail', id] as const,
  scores: (id: string) => ['demandes', 'scores', id] as const,
  stats:  ['demandes', 'stats'] as const,
};

export function useDemandes(params: { status?: DemandeStatus; page?: number; size?: number; sort?: string }) {
  return useQuery({
    queryKey: DEMANDE_KEYS.list(params),
    queryFn: () => demandesApi.listAll(params),
    staleTime: 15_000,
  });
}

export function useDemandeDetail(id: string | null) {
  return useQuery({
    queryKey: DEMANDE_KEYS.detail(id!),
    queryFn: () => demandesApi.getById(id!),
    enabled: !!id,
  });
}

export function useDemandeScores(id: string | null) {
  return useQuery({
    queryKey: DEMANDE_KEYS.scores(id!),
    queryFn: () => demandesApi.getScores(id!),
    enabled: !!id,
  });
}

export function useDemandeStats() {
  return useQuery({
    queryKey: DEMANDE_KEYS.stats,
    queryFn: demandesApi.getStats,
    staleTime: 30_000,
  });
}

export function useForceClose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: demandesApi.forceClose,
    onSuccess: () => qc.invalidateQueries({ queryKey: DEMANDE_KEYS.all }),
  });
}

export function useExpireDemande() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: demandesApi.expire,
    onSuccess: () => qc.invalidateQueries({ queryKey: DEMANDE_KEYS.all }),
  });
}

export function useRecategorize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newCategoryId }: { id: string; newCategoryId: number }) =>
      demandesApi.recategorize(id, newCategoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: DEMANDE_KEYS.all }),
  });
}
