'use client';

import { useState } from 'react';
import { ProfileDropdown } from '@/components/auth/ProfileDropdown';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';

const defaultLoginButtonClassName =
  'font-headline shrink-0 text-sm font-semibold uppercase tracking-tight text-slate-200 transition-colors hover:text-stitch-primary-container';

export type NavbarAuthClusterProps = {
  /** Override Login button styles (e.g. booking header uses theme tokens). */
  loginButtonClassName?: string;
};

export function NavbarAuthCluster({ loginButtonClassName = defaultLoginButtonClassName }: NavbarAuthClusterProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const openLogin = useUiStore((s) => s.openLogin);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const sessionUser = isAuthenticated && user ? user : null;

  const handleLogout = async () => {
    setLogoutPending(true);
    try {
      await logout();
    } finally {
      setLogoutPending(false);
    }
  };

  if (sessionUser) {
    return (
      <ProfileDropdown
        user={sessionUser}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onLogout={handleLogout}
        logoutPending={logoutPending}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => openLogin()}
      className={loginButtonClassName}
    >
      Login
    </button>
  );
}
