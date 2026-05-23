import { ReactNode } from 'react';
import { BookingFlowShell } from '@/components/layout/BookingFlowShell';
import { CustomerDashboardLayout } from '@/components/layout/CustomerDashboardLayout';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <BookingFlowShell showContextBar={false}>
      <CustomerDashboardLayout>{children}</CustomerDashboardLayout>
    </BookingFlowShell>
  );
}
