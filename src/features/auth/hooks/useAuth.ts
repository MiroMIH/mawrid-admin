import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useAuthStore } from '../../../store/authStore';
import type { RegisterRequest } from '../auth.types';
import type { User } from '../../../types';

export function useLogin() {
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.login(data),
    onSuccess: async (data) => {
      setTokens(data.accessToken, data.refreshToken);
      const profile: User = data.user ? (data.user as User) : await authApi.getProfile();
      setUser(profile);
      navigate('/');
    },
  });
}

export function useRegister() {
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => {
      const { confirmPassword: _cp, ...payload } = data;
      return authApi.register(payload);
    },
    onSuccess: async (data) => {
      setTokens(data.accessToken, data.refreshToken);
      if (data.user) {
        setUser(data.user as User);
      } else {
        const profile = await authApi.getProfile();
        setUser(profile);
      }
      navigate('/');
    },
  });
}
