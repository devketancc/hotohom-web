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
    const { accessToken } = useAuthStore.getState();
    if (!accessToken || !isAuthenticated || !isCrewRole(user?.role)) {
      router.replace('/crew-login');
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) {
    return (
      <div className="dark flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken || !isAuthenticated || !isCrewRole(user?.role)) {
    return (
      <div className="dark flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Redirecting…</p>
      </div>
    );
  }

  return <CrewDashboardShell>{children}</CrewDashboardShell>;
}
