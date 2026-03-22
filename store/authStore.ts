import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthUser = {
  id: string;
  phone: string;
  name: string;
  role: string;
};

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
};

const initialSlice = {
  user: null as AuthUser | null,
  accessToken: null as string | null,
  refreshToken: null as string | null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialSlice,
      setAuth: (data) =>
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ ...initialSlice }),
    }),
    {
      name: 'motohom-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
