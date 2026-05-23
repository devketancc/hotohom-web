'use client';

import { Phone } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { crewContactLinks, crewRoleLabel } from '@/lib/crewTeam';
import type { CrewBookingDetail } from '@/types/crew';

function TelLink({ phone, label }: { phone: string; label: string }) {
  const digits = phone.replace(/\s/g, '');
  return (
    <a
      href={`tel:${digits}`}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
    >
      <Phone className="size-4 shrink-0 text-primary" aria-hidden />
      <span>
        {label} · {phone}
      </span>
    </a>
  );
}

export function CrewJobPacketHeader({ booking }: { booking: CrewBookingDetail }) {
  const user = useAuthStore((s) => s.user);
  const you = crewRoleLabel(user?.role);
  const { customer, teammate } = crewContactLinks(booking, user);

  if (!you && !customer && !teammate) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-card/80 p-4">
      {you ? (
        <p className="text-sm text-muted-foreground">
          You: <span className="font-semibold text-foreground">{you}</span>
        </p>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {customer ? <TelLink phone={customer.phone} label={`Call ${customer.name || 'customer'}`} /> : null}
        {teammate ? <TelLink phone={teammate.phone} label={`Call ${teammate.name}`} /> : null}
      </div>
    </div>
  );
}
