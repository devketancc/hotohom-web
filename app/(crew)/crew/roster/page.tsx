'use client';

import { CrewPageHeader } from '@/components/crew/CrewPageHeader';
import { CrewRosterPanel } from '@/components/crew/roster/CrewRosterPanel';

export default function CrewRosterPage() {
  return (
    <>
      <CrewPageHeader
        title="Roster"
        description="Your assigned bookings by date. Tap a row to open the job packet."
      />
      <CrewRosterPanel />
    </>
  );
}
