import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { authService, type ResendOtpResult, type SendOtpResult, type VerifyOtpResult } from '@/services/auth.service';
import { clearClientSession } from '@/lib/clearClientSession';
import { isStaffRole } from '@/lib/staffRoles';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logoutStore = useAuthStore((s) => s.logout);

  const sendOtp = useCallback(async (phone: string): Promise<SendOtpResult> => {
    return authService.sendOtp(phone);
  }, []);

  const resendOtp = useCallback(
    async (phone: string, options?: { purpose?: 'login' | 'register' }): Promise<ResendOtpResult> => {
      return authService.resendOtp(phone, options);
    },
    []
  );

  const establishSession = useCallback(
    (data: VerifyOtpResult) => {
      setAuth({
        user: data.user,
        accessToken: data.access,
        refreshToken: data.refresh,
      });
    },
    [setAuth]
  );

  const completeSession = useCallback(
    (data: VerifyOtpResult) => {
      establishSession(data);
      console.log('User logged in', data.user);
      const pending = useUiStore.getState().pendingNavigationPath;
      useUiStore.getState().setLoginModalOpen(false);
      useUiStore.getState().setPendingNavigationPath(null);
      if (pending && typeof window !== 'undefined') {
        window.location.assign(pending);
      }
    },
    [establishSession]
  );

  const verifyStaffOtp = useCallback(
    async (phone: string, otp: string) => {
      const data = await authService.verifyOtp(phone, otp);
      if (!isStaffRole(data.user.role)) {
        throw new Error('This sign-in is for staff only.');
      }
      establishSession(data);
      return data;
    },
    [establishSession]
  );

  const verifyOtp = useCallback(
    async (phone: string, otp: string) => {
      const data = await authService.verifyOtp(phone, otp);
      completeSession(data);
      return data;
    },
    [completeSession]
  );

  const register = useCallback(
    async (payload: { first_name: string; last_name: string; phone: string; email: string }) => {
      return authService.register(payload);
    },
    []
  );

  const verifyRegistrationOtp = useCallback(
    async (phone: string, otp: string) => {
      const data = await authService.registerVerify(phone, otp);
      completeSession(data);
      return data;
    },
    [completeSession]
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
    clearClientSession();
    if (typeof window !== 'undefined') {
      window.location.assign('/');
    }
  }, [logoutStore]);

  return {
    user,
    isAuthenticated,
    sendOtp,
    resendOtp,
    verifyOtp,
    verifyStaffOtp,
    establishSession,
    register,
    verifyRegistrationOtp,
    logout,
  };
}
