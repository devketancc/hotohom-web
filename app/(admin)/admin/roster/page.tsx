'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminRosterPanel } from '@/components/admin/roster/AdminRosterPanel';

export default function AdminRosterPage() {
  return (
    <>
      <AdminPageHeader
        title="Roster"
        description="Booking dispatch roster with assignment visibility, alerts, and date-based filters."
      />
      <AdminRosterPanel />
    </>
  );
}
