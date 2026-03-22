import { create } from 'zustand';

interface UiState {
  isLoginModalOpen: boolean;
  isLoading: boolean;
  setLoginModalOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  isLoginModalOpen: false,
  isLoading: false,
};

export const useUiStore = create<UiState>((set) => ({
  ...initialState,
  setLoginModalOpen: (open: boolean) => set({ isLoginModalOpen: open }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  reset: () => set(initialState),
}));
