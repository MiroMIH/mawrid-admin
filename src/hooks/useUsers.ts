import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../features/users/api';

export const USER_KEYS = {
  list: (params: object) => ['users', params] as const,
};

export function useUsers(params: { page?: number; size?: number } = {}) {
  return useQuery({
    queryKey: USER_KEYS.list(params),
    queryFn: () => usersApi.listUsers(params),
    staleTime: 10000,
  });
}

export function useToggleUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.toggleUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
