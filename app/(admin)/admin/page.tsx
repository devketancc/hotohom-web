'use client';

import { Activity, Bell, Plus, TrendingUp, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function MetricCard({
  title,
  subtitle,
  icon: Icon,
  className,
}: {
  title: string;
  subtitle?: string;
  icon: typeof TrendingUp;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-3 font-heading text-2xl font-bold tabular-nums tracking-tight">—</p>
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
          <Icon className="size-5" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export default function AdminHomePage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';

  return (
    <>
      <AdminPageHeader
        title={`Welcome, ${firstName}`}
        description="Operational overview and entry points. Wire live metrics, queues, and reports here as features land."
      />

      <section aria-labelledby="metrics-heading" className="mb-10">
        <h2 id="metrics-heading" className="sr-only">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Active journeys" subtitle="Coming soon" icon={Activity} />
          <MetricCard title="Bookings today" subtitle="Coming soon" icon={TrendingUp} />
          <MetricCard title="Fleet utilization" subtitle="Coming soon" icon={Users} />
          <MetricCard title="Open tickets" subtitle="Coming soon" icon={Bell} />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-2" aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="mb-3 font-heading text-lg font-semibold tracking-tight">
            Quick actions
          </h2>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <Button type="button" variant="secondary" className="h-10 justify-start gap-2" disabled>
              <Plus className="size-4 opacity-60" aria-hidden />
              New booking hold
            </Button>
            <Button type="button" variant="secondary" className="h-10 justify-start gap-2" disabled>
              <Users className="size-4 opacity-60" aria-hidden />
              Assign driver
            </Button>
            <Button type="button" variant="secondary" className="h-10 justify-start gap-2" disabled>
              <Bell className="size-4 opacity-60" aria-hidden />
              Broadcast update
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Actions activate when the corresponding admin modules are connected.
            </p>
          </div>
        </section>

        <section className="lg:col-span-3" aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="mb-3 font-heading text-lg font-semibold tracking-tight">
            Activity
          </h2>
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <Activity className="mb-3 size-10 text-muted-foreground/60" aria-hidden />
            <p className="max-w-sm text-sm font-medium text-foreground">No feed yet</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Recent bookings, payouts, and support events will stream here once integrations are enabled.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
