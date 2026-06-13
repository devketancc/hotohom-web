'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ChevronRight, Loader2, MapPin, User } from 'lucide-react';
import { requestAuthThenNavigate } from '@/lib/authNavigation';
import { useAuth } from '@/hooks/useAuth';
import { fetchMe } from '@/services/user.service';
import { cn } from '@/lib/utils';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export default function AccountPage() {
  const { isAuthenticated } = useAuth();
  const authPrompted = useRef(false);

  useEffect(() => {
    if (isAuthenticated || authPrompted.current) return;
    authPrompted.current = true;
    requestAuthThenNavigate('/account');
  }, [isAuthenticated]);

  const {
    data: profile,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <div className="glass-panel-login rounded-xl p-10 text-center shadow-2xl">
          <User className="mx-auto size-12 text-stitch-primary-container" aria-hidden />
          <h1 className="mt-6 font-headline text-xl font-bold text-stitch-on-background">Sign in to continue</h1>
          <p className="mt-3 font-body text-sm text-stitch-on-surface-variant">
            Use the login window to view your profile and journeys.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-1 border-b border-white/10 pb-6">
        <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-stitch-primary-container">
          Overview
        </p>
        <h1 className="font-headline text-3xl font-black uppercase tracking-tight text-stitch-on-background">
          Your profile
        </h1>
        <p className="font-body text-sm text-stitch-on-surface-variant">
          Details from your Motohom account. Journeys and settings live in the sidebar.
        </p>
      </header>

      {isPending ? (
        <div className="glass-card flex items-center justify-center gap-3 rounded-xl py-20 text-stitch-on-surface-variant">
          <Loader2 className="size-6 animate-spin text-stitch-primary-container" aria-hidden />
          <span className="font-body text-sm font-semibold">Loading profile…</span>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-8 text-center">
          <p className="font-body text-sm text-red-200">
            {error instanceof Error ? error.message : 'Something went wrong.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-md px-5 py-2.5 font-headline text-sm font-bold uppercase tracking-wide gradient-cta text-stitch-on-primary shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Try again
          </button>
        </div>
      ) : profile ? (
        <>
          <section className="glass-panel-login rounded-xl p-8 shadow-2xl md:p-10">
            <h2 className="sr-only">Profile</h2>
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              <div className="shrink-0">
                {profile.profile_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-upload / CDN host
                  <img
                    src={profile.profile_photo_url}
                    alt=""
                    className="size-24 rounded-full border-2 border-stitch-primary-container/50 object-cover shadow-lg ring-4 ring-stitch-primary-container/15 sm:size-28"
                  />
                ) : (
                  <div
                    className="flex size-24 items-center justify-center rounded-full border-2 border-stitch-primary-container/50 bg-stitch-surface-highest font-headline text-2xl font-black uppercase tracking-wide text-stitch-primary-container shadow-lg ring-4 ring-stitch-primary-container/10 sm:size-28 sm:text-3xl"
                    aria-hidden
                  >
                    {initialsFromName(profile.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-5">
                <div>
                  <p className="font-headline text-2xl font-bold tracking-tight text-stitch-on-background">
                    {profile.name}
                  </p>
                  <p className="mt-1 font-body text-sm capitalize text-stitch-on-surface-variant">{profile.role}</p>
                </div>
                <dl className="grid gap-4 font-body text-sm sm:grid-cols-2">
                  <div className="space-y-1">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-stitch-on-surface-variant">
                      Phone
                    </dt>
                    <dd className="font-semibold text-stitch-on-background">{profile.phone}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-stitch-on-surface-variant">
                      Email
                    </dt>
                    <dd className="break-all font-semibold text-stitch-on-background">{profile.email}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-stitch-on-surface-variant">
                      Member since
                    </dt>
                    <dd className="font-semibold text-stitch-on-background">
                      {(() => {
                        try {
                          return format(parseISO(profile.date_joined), 'MMM d, yyyy');
                        } catch {
                          return profile.date_joined;
                        }
                      })()}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="sr-only">Verification</dt>
                    <dd className="flex flex-wrap gap-2">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                          profile.is_verified
                            ? 'bg-stitch-primary/20 text-stitch-primary-container'
                            : 'bg-white/5 text-stitch-on-surface-variant'
                        )}
                      >
                        {profile.is_verified ? 'Phone verified' : 'Phone not verified'}
                      </span>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                          profile.email_verified
                            ? 'bg-stitch-primary/20 text-stitch-primary-container'
                            : 'bg-white/5 text-stitch-on-surface-variant'
                        )}
                      >
                        {profile.email_verified ? 'Email verified' : 'Email not verified'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 text-stitch-on-surface-variant">
              <MapPin className="size-5 text-stitch-primary-container" aria-hidden />
              <p className="font-body text-sm">
                All your trips, past and upcoming, live in one place.
              </p>
            </div>
            <Link
              href="/journeys"
              className="inline-flex items-center gap-1.5 rounded-full border border-stitch-primary/30 px-5 py-2.5 font-headline text-[11px] font-semibold uppercase tracking-[0.18em] text-stitch-primary-container transition-colors hover:bg-stitch-primary/10"
            >
              View your journeys
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </section>

          <section className="border-t border-white/10 pt-8">
            <p className="font-body text-sm text-stitch-on-surface-variant">
              Preferences and security —{' '}
              <Link href="/account/settings" className="font-semibold text-stitch-primary-container hover:underline">
                open settings
              </Link>
              .
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
