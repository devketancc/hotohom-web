import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';

export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(useAuthStore.getState().accessToken);
}

/** Open login modal; optional post-login path stored for future navigation. */
export function requestAuthThenNavigate(path: string): void {
  useUiStore.getState().setPendingNavigationPath(path);
  useUiStore.getState().setLoginModalOpen(true);
}
