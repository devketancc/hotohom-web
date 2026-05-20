'use client';

import { CrewCalendarPanel } from '@/components/crew/CrewCalendarPanel';
import { CrewPageHeader } from '@/components/crew/CrewPageHeader';
import { crewScheduleTitle } from '@/config/crewNav';
import { useAuthStore } from '@/store/authStore';

export default function CrewCalendarPage() {
  const userName = useAuthStore((s) => s.user?.name);

  return (
    <>
      <CrewPageHeader
        title={crewScheduleTitle(userName)}
        description="Your schedule at a glance. Tap a booking block to open details."
      />
      <CrewCalendarPanel />
    </>
  );
}
