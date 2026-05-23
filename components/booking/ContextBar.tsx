'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useBooking } from '@/hooks/useBooking';
import { formatBookingTravelWindow } from '@/utils/format';
import { Edit2, CheckCircle } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { HubPickerPanel } from '@/components/booking/HubPickerPanel';
import { DateRangePickerPanel } from '@/components/booking/DateRangePickerPanel';
import { PackageTripDatePanel } from '@/components/package/PackageTripDatePanel';
import { useBookingStore } from '@/store/bookingStore';

function isJourneyStepPath(pathname: string | null) {
  if (!pathname) return false;
  return pathname === '/journey' || pathname.startsWith('/journey/');
}

export const ContextBar: React.FC = () => {
  const pathname = usePathname();
  const journeyPath = isJourneyStepPath(pathname);
  const bookingFlow = useBookingStore((s) => s.bookingFlow ?? 'standard');
  const activePackage = useBookingStore((s) => s.activePackage);
  /** Hub/class fixed for this package; dates can change start only via `PackageTripDatePanel`. */
  const packageSession = bookingFlow === 'package' && activePackage != null;
  const hubLocked = journeyPath || packageSession;
  const datesLocked = journeyPath;
  const vehicleLocked = packageSession;
  const { bookingState } = useBooking();
  const { hub, hubName, dates, caravanClass, setData } = bookingState;
  const [openPanel, setOpenPanel] = useState<null | 'hub' | 'dates'>(null);
  const showHubPanel = openPanel === 'hub' && !hubLocked;
  const showDatesPanel = openPanel === 'dates' && !datesLocked;

  const containerRef = useClickOutside<HTMLDivElement>(() => setOpenPanel(null));

  const dateLabel = formatBookingTravelWindow(dates);

  return (
    <div className="bg-stitch-surface/50 border-b border-border/10 sticky top-[73px] z-40 backdrop-blur-md">
      <div
        ref={containerRef}
        className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between text-stitch-on-background relative"
      >
        <div className="flex items-center gap-8 md:gap-12">
          <div className="relative flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Hub
            </span>
            {hubLocked ? (
              <span className="font-bold text-primary cursor-default">{hubName || 'Select Hub'}</span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (hubLocked) return;
                    setOpenPanel((p) => (p === 'hub' ? null : 'hub'));
                  }}
                  className="flex items-center gap-2 group cursor-pointer hover:text-primary transition-colors text-left"
                >
                  <span className="font-bold text-primary">{hubName || 'Select Hub'}</span>
                  <Edit2 size={12} className="text-primary group-hover:scale-110 transition-transform shrink-0" />
                </button>
                {showHubPanel && (
                  <div className="absolute top-full left-0 mt-2 z-[200] w-[min(340px,calc(100vw-2rem))] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-200">
                    <HubPickerPanel
                      selectedHubId={hub}
                      onSelect={(item) => {
                        setData({
                          hub: item.id,
                          hubName: item.name,
                          hubLocation: {
                            lat: item.coordinates.lat,
                            lng: item.coordinates.lng,
                          },
                        });
                        setOpenPanel(null);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="relative flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Dates
            </span>
            {datesLocked ? (
              <span className="font-bold text-primary cursor-default">{dateLabel}</span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (datesLocked) return;
                    setOpenPanel((p) => (p === 'dates' ? null : 'dates'));
                  }}
                  className="flex items-center gap-2 group cursor-pointer hover:text-primary transition-colors text-left"
                >
                  <span className="font-bold text-primary">{dateLabel}</span>
                  <Edit2 size={12} className="text-primary group-hover:scale-110 transition-transform shrink-0" />
                </button>
                {showDatesPanel && (
                  <div className="absolute top-full left-0 mt-2 z-[200] animate-in fade-in slide-in-from-top-2 duration-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                    {packageSession ? (
                      <PackageTripDatePanel onComplete={() => setOpenPanel(null)} />
                    ) : (
                      <DateRangePickerPanel onRangeComplete={() => setOpenPanel(null)} />
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {caravanClass && (
            <div className="flex flex-col border-l border-border/10 pl-8 md:pl-12">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Vehicle
              </span>
              {vehicleLocked ? (
                <span className="font-bold text-primary cursor-default">{caravanClass.name}</span>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer">
                  <span className="font-bold text-primary">{caravanClass.name}</span>
                  <Edit2
                    size={12}
                    className="text-primary group-hover:scale-110 transition-transform cursor-pointer"
                    onClick={() => {
                      window.location.href = '/select-caravan';
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5 py-1.5 px-3 bg-primary/5 rounded-full border border-primary/10">
            <CheckCircle size={14} className="text-primary" /> Elite Tier Concierge Active
          </span>
        </div>
      </div>
    </div>
  );
};
