import { create } from 'zustand';

interface UiState {
  isLoginModalOpen: boolean;
  isLoading: boolean;
  /** After successful login, client navigates here (set before opening the modal). */
  pendingNavigationPath: string | null;
  setLoginModalOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setPendingNavigationPath: (path: string | null) => void;
  reset: () => void;
}

const initialState = {
  isLoginModalOpen: false,
  isLoading: false,
  pendingNavigationPath: null as string | null,
};

export const useUiStore = create<UiState>((set) => ({
  ...initialState,
  setLoginModalOpen: (open: boolean) => set({ isLoginModalOpen: open }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setPendingNavigationPath: (path: string | null) => set({ pendingNavigationPath: path }),
  reset: () => set(initialState),
}));
