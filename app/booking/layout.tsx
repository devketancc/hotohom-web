import { ReactNode } from 'react';
import { BookingFlowShell } from '@/components/layout/BookingFlowShell';

export default function BookingPathLayout({ children }: { children: ReactNode }) {
  return (
    <BookingFlowShell>
      <main className="flex-1">{children}</main>
    </BookingFlowShell>
  );
}
