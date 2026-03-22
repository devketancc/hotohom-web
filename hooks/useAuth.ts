import { useMutation } from '@tanstack/react-query';
import { useUiStore } from '@/store/uiStore';
import { authService } from '@/services/auth.service';

export const useAuth = () => {
  const { setLoginModalOpen, setLoading } = useUiStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: { phone: string; otp: string }) => 
      authService.login(credentials.phone, credentials.otp),
    onSuccess: (data) => {
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
      }
      setLoginModalOpen(false);
    },
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
  });

  const logout = () => {
    authService.logout();
    window.location.reload();
  };

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
};
