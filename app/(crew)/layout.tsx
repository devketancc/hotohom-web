'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { isCrewRole } from '@/lib/crewRoles';
import { CrewDashboardShell } from '@/components/crew/CrewDashboardShell';

export default function CrewLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(() => {
    const persistApi = (useAuthStore as typeof useAuthStore & { persist?: { hasHydrated: () => boolean } }).persist;
    return persistApi ? persistApi.hasHydrated() : true;
  });

  useEffect(() => {
    const persistApi = (
      useAuthStore as typeof useAuthStore & {
        persist?: {
          onFinishHydration: (listener: () => void) => () => void;
          hasHydrated: () => boolean;
        };
      }
    ).persist;

    if (!persistApi) return;

    const unsub = persistApi.onFinishHydration(() => setHydrated(true));
    if (persistApi.hasHydrated()) {
      queueMicrotask(() => setHydrated(true));
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !isCrewRole(user?.role)) {
      router.replace('/crew-login');
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) {
    return (
      <div className="dark flex min-h-screen items-center justify-center bg-stitch-background text-stitch-on-background">
        <p className="font-body text-sm text-stitch-on-surface-variant">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated || !isCrewRole(user?.role)) {
    return (
      <div className="dark flex min-h-screen items-center justify-center bg-stitch-background text-stitch-on-background">
        <p className="font-body text-sm text-stitch-on-surface-variant">Redirecting…</p>
      </div>
    );
  }

  return <CrewDashboardShell>{children}</CrewDashboardShell>;
}
