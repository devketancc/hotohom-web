import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { authService } from '@/services/auth.service';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logoutStore = useAuthStore((s) => s.logout);

  const sendOtp = useCallback(async (phone: string): Promise<boolean> => {
    return authService.sendOtp(phone);
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, otp: string) => {
      const data = await authService.verifyOtp(phone, otp);
      setAuth({
        user: data.user,
        accessToken: data.access,
        refreshToken: data.refresh,
      });
      console.log('User logged in', data.user);
      useUiStore.getState().setLoginModalOpen(false);
      useUiStore.getState().setPendingNavigationPath(null);
      return data;
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    const { accessToken, refreshToken } = useAuthStore.getState();
    if (accessToken && refreshToken) {
      try {
        await authService.logout(accessToken, refreshToken);
      } catch {
        /* always clear local session */
      }
    }
    logoutStore();
  }, [logoutStore]);

  return {
    user,
    isAuthenticated,
    sendOtp,
    verifyOtp,
    logout,
  };
}
