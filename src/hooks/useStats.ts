import { useQuery, useMutation } from '@tanstack/react-query';
import { statsApi } from '../features/stats/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['stats', 'dashboard'],
    queryFn: statsApi.getDashboardStats,
    staleTime: 60000,
  });
}

export function useSimulateMatching() {
  return useMutation({
    mutationFn: statsApi.simulateMatching,
  });
}
