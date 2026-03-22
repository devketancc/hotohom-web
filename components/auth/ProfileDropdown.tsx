'use client';

import { useCallback, useEffect } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { AuthUser } from '@/store/authStore';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export type ProfileDropdownProps = {
  user: AuthUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => Promise<void>;
  logoutPending?: boolean;
};

export function ProfileDropdown({
  user,
  open,
  onOpenChange,
  onLogout,
  logoutPending = false,
}: ProfileDropdownProps) {
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const wrapperRef = useClickOutside<HTMLDivElement>(close);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const label = initialsFromName(user.name);

  const handleLogout = async () => {
    await onLogout();
    onOpenChange(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-slate-900/80 font-headline text-xs font-bold uppercase tracking-wide text-stitch-primary-container transition-colors hover:border-stitch-primary-container/50 hover:bg-slate-900"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        {label}
      </button>

      {open ? (
        <div
          className="animate-in fade-in zoom-in-95 absolute right-0 z-[100] mt-2 min-w-[11rem] origin-top-right rounded-lg border border-white/10 bg-slate-950/95 py-1 shadow-xl backdrop-blur-xl duration-200"
          role="menu"
          aria-label="Account"
        >
          <button
            type="button"
            role="menuitem"
            className="w-full px-4 py-2.5 text-left font-body text-sm text-slate-200 transition-colors hover:bg-white/5 hover:text-stitch-primary-container"
            onClick={() => {
              console.log('Navigate to account');
              onOpenChange(false);
            }}
          >
            My Account
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={logoutPending}
            className="w-full px-4 py-2.5 text-left font-body text-sm text-slate-200 transition-colors hover:bg-white/5 hover:text-stitch-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void handleLogout()}
          >
            {logoutPending ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
