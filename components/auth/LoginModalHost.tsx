'use client';

import { LoginModal } from '@/components/auth/LoginModal';
import { useUiStore } from '@/store/uiStore';

export function LoginModalHost() {
  const isOpen = useUiStore((s) => s.isLoginModalOpen);
  const setOpen = useUiStore((s) => s.setLoginModalOpen);
  const clearPending = useUiStore((s) => s.setPendingNavigationPath);

  const onClose = () => {
    setOpen(false);
    clearPending(null);
  };

  return <LoginModal open={isOpen} onClose={onClose} />;
}
