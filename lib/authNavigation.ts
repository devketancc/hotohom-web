import { useUiStore } from '@/store/uiStore';

export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('token'));
}

/** Open login modal; on success, app navigates to `path` (see useAuth onSuccess). */
export function requestAuthThenNavigate(path: string): void {
  useUiStore.getState().setPendingNavigationPath(path);
  useUiStore.getState().setLoginModalOpen(true);
}
