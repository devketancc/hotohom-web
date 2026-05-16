'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { CrewRosterPanel } from '@/components/crew/roster/CrewRosterPanel';

export default function CrewRosterPage() {
  return (
    <>
      <AdminPageHeader
        title="Roster"
        description="Your assigned trips for the selected date range."
      />
      <CrewRosterPanel />
    </>
  );
}
