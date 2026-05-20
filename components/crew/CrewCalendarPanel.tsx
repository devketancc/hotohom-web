'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventClickArg, EventContentArg } from '@fullcalendar/core';
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  startOfToday,
} from 'date-fns';
import type { AdminStaffCalendarReason } from '@/types/admin';
import { AlertCircle, CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { crewReasonToColor, crewReasonToLabel, crewReasonStyles } from '@/lib/crewCalendarUi';
import { useCrewCalendar } from '@/hooks/useCrewCalendar';

type SelectedEvent = {
  title: string;
  reason: AdminStaffCalendarReason;
  notes: string;
  start: string;
  end: string;
  bookingId?: string;
  customerName?: string;
};

function formatDateRangeText(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—';
  if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
    return format(start, 'MMM d, yyyy');
  }
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
}

export function CrewCalendarPanel() {
  const router = useRouter();
  const todayMonthStart = startOfMonth(startOfToday());
  const [activeMonthStart, setActiveMonthStart] = useState(todayMonthStart);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);

  const monthStart = startOfMonth(activeMonthStart);
  const monthEnd = endOfMonth(activeMonthStart);

  const {
    data: calendar,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useCrewCalendar(activeMonthStart);

  const calendarEvents = useMemo(() => {
    const events = calendar?.events ?? [];
    return events.map((event) => {
      const reason = event.reason;
      const title = reason === 'booking' ? event.booking_info?.customer_name || 'Booking' : crewReasonToLabel(reason);
      return {
        id: event.blockout_id,
        title,
        start: event.start,
        end: format(addDays(new Date(event.end), 1), 'yyyy-MM-dd'),
        allDay: true,
        backgroundColor: crewReasonToColor(reason),
        borderColor: crewReasonToColor(reason),
        textColor: '#ffffff',
        extendedProps: {
          reason,
          notes: event.notes || '',
          originalStart: event.start,
          originalEnd: event.end,
          bookingId: event.booking_info?.id,
          customerName: event.booking_info?.customer_name,
        },
      };
    });
  }, [calendar]);

  const onEventClick = (arg: EventClickArg) => {
    const bookingId = arg.event.extendedProps.bookingId
      ? String(arg.event.extendedProps.bookingId)
      : undefined;
    if (bookingId) {
      router.push(`/crew/bookings/${encodeURIComponent(bookingId)}?from=calendar`);
      return;
    }
    setSelectedEvent({
      title: arg.event.title,
      reason: String(arg.event.extendedProps.reason || 'other') as AdminStaffCalendarReason,
      notes: arg.event.extendedProps.notes ? String(arg.event.extendedProps.notes) : '',
      start: String(arg.event.extendedProps.originalStart ?? arg.event.startStr),
      end: String(arg.event.extendedProps.originalEnd ?? arg.event.endStr ?? arg.event.startStr),
      customerName: arg.event.extendedProps.customerName
        ? String(arg.event.extendedProps.customerName)
        : undefined,
    });
  };

  const renderEventContent = (arg: EventContentArg) => {
    const reason = String(arg.event.extendedProps.reason || 'other') as AdminStaffCalendarReason;
    const customer = arg.event.extendedProps.customerName ? String(arg.event.extendedProps.customerName) : undefined;
    const title = reason === 'booking' ? customer || arg.event.title : arg.event.title;
    const styles = crewReasonStyles(reason);
    const showBadge = arg.isStart && reason !== 'booking';
    const showTitle = reason !== 'booking' || arg.isStart;

    return (
      <div
        className={cn(
          'group/event flex h-full min-h-10 w-full min-w-0 items-center border-l-[3px] px-2.5 py-2 shadow-sm',
          styles.tintClass,
          arg.isStart ? 'rounded-l-md' : 'rounded-l-none',
          arg.isEnd ? 'rounded-r-md' : 'rounded-r-none'
        )}
      >
        <div className="flex w-full min-w-0 items-center justify-between gap-2">
          {showTitle ? (
            <p className="min-w-0 flex-1 truncate text-left text-xs font-semibold leading-snug text-foreground">
              {title}
            </p>
          ) : (
            <span className="flex-1" aria-hidden />
          )}
          {showBadge ? (
            <span
              className={cn(
                'ml-2 shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                styles.badgeClass
              )}
            >
              {crewReasonToLabel(reason)}
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  const canGoPrev = activeMonthStart > todayMonthStart;
  const canGoNext = activeMonthStart < addMonths(todayMonthStart, 6);
  const atTodayMonth = format(activeMonthStart, 'yyyy-MM') === format(todayMonthStart, 'yyyy-MM');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setActiveMonthStart(addMonths(activeMonthStart, -1))}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="size-4" /> Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setActiveMonthStart(todayMonthStart)}
          disabled={atTodayMonth}
        >
          Today
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setActiveMonthStart(addMonths(activeMonthStart, 1))}
          disabled={!canGoNext}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>

      {calendar?.hub ? (
        <p className="text-sm text-muted-foreground">
          Hub · <span className="font-medium text-foreground">{calendar.hub}</span>
        </p>
      ) : null}

      {isPending ? (
        <div className="h-[620px] animate-pulse rounded-xl border border-border bg-muted/30" aria-hidden />
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center">
          <p className="text-sm font-medium text-destructive">
            {error instanceof Error ? error.message : 'Failed to load calendar'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} /> Retry
          </Button>
        </div>
      ) : null}

      {!isPending && !isError ? (
        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarDays className="size-4 text-foreground" />
              <span className="text-base font-bold text-foreground">{format(activeMonthStart, 'MMMM yyyy')}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {(['booking', 'leave', 'training', 'other'] as AdminStaffCalendarReason[]).map((reason) => {
                const styles = crewReasonStyles(reason);
                return (
                  <span
                    key={reason}
                    className={cn(
                      'rounded-md border border-border/60 border-l-[3px] px-2 py-1 font-semibold',
                      styles.legendClass
                    )}
                  >
                    {crewReasonToLabel(reason)}
                  </span>
                );
              })}
            </div>
          </div>
          {calendarEvents.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 text-center">
              <AlertCircle className="mb-3 size-8 text-muted-foreground/60" />
              <p className="font-medium text-foreground">No events for this month</p>
            </div>
          ) : (
            <div className="crew-calendar-fc overflow-x-auto">
              <div className="min-w-[760px]">
                <FullCalendar
                  key={format(activeMonthStart, 'yyyy-MM')}
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  initialDate={activeMonthStart}
                  validRange={{
                    start: format(todayMonthStart, 'yyyy-MM-dd'),
                    end: format(addMonths(todayMonthStart, 7), 'yyyy-MM-dd'),
                  }}
                  headerToolbar={false}
                  fixedWeekCount
                  dayMaxEvents={3}
                  events={calendarEvents}
                  eventClick={onEventClick}
                  eventContent={renderEventContent}
                  eventDisplay="block"
                  eventClassNames={(arg) => [
                    'fc-modern-event',
                    arg.isStart ? 'fc-event-start' : 'fc-event-middle',
                    arg.isEnd ? 'fc-event-end' : 'fc-event-middle',
                  ]}
                  dayCellClassNames={() => ['fc-modern-daycell']}
                  height="auto"
                />
              </div>
            </div>
          )}
        </section>
      ) : null}

      {selectedEvent ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedEvent(null)}
            aria-label="Close details modal"
          />
          <section className="relative z-[131] w-full max-w-lg rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {crewReasonToLabel(selectedEvent.reason)}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{selectedEvent.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateRangeText(selectedEvent.start, selectedEvent.end)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className={cn(buttonVariants({ variant: 'ghost', size: 'xs' }))}
              >
                Close
              </button>
            </div>
            {selectedEvent.customerName ? (
              <p className="mt-4 text-sm">
                <span className="font-semibold text-muted-foreground">Customer: </span>
                {selectedEvent.customerName}
              </p>
            ) : null}
            {selectedEvent.notes ? (
              <p className="mt-2 text-sm text-muted-foreground">{selectedEvent.notes}</p>
            ) : null}
          </section>
        </div>
      ) : null}

      <p className="text-xs text-foreground/80">
        Showing {format(monthStart, 'MMM d')} – {format(monthEnd, 'MMM d, yyyy')}. Tap a booking to open details.
      </p>

      <style jsx global>{`
        .crew-calendar-fc .fc-theme-standard .fc-scrollgrid,
        .crew-calendar-fc .fc-theme-standard td,
        .crew-calendar-fc .fc-theme-standard th {
          border-color: hsl(var(--border));
        }
        .crew-calendar-fc .fc .fc-scrollgrid-section-header th {
          background-color: hsl(var(--card));
        }
        .crew-calendar-fc .fc .fc-daygrid-day {
          background-color: hsl(var(--card));
        }
        .crew-calendar-fc .fc .fc-daygrid-day-frame {
          min-height: 108px;
          padding: 6px;
          transition: background-color 180ms ease;
        }
        .crew-calendar-fc .fc .fc-daygrid-day.fc-modern-daycell:hover .fc-daygrid-day-frame {
          background-color: hsl(var(--muted) / 0.28);
        }
        .crew-calendar-fc .fc .fc-day-today {
          box-shadow: inset 0 0 0 1px hsl(var(--primary) / 0.45);
          background-color: hsl(var(--primary) / 0.08) !important;
        }
        .crew-calendar-fc .fc .fc-daygrid-day-number {
          font-size: 12px;
          font-weight: 700;
          color: hsl(var(--foreground)) !important;
          opacity: 1 !important;
        }
        .crew-calendar-fc .fc .fc-day-other .fc-daygrid-day-number {
          color: hsl(var(--muted-foreground)) !important;
          opacity: 0.55 !important;
        }
        .crew-calendar-fc .fc .fc-col-header-cell-cushion {
          padding: 8px 0;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: hsl(var(--foreground));
          opacity: 1;
        }
        .crew-calendar-fc .fc .fc-daygrid-event {
          border: 0 !important;
          background: transparent !important;
          margin-top: 3px !important;
        }
        .crew-calendar-fc .fc .fc-daygrid-event-harness {
          min-height: 2.5rem;
          transition: transform 180ms ease;
        }
        .crew-calendar-fc .fc .fc-daygrid-event-harness .fc-event-main {
          min-height: 2.5rem;
          width: 100%;
          min-width: 0;
        }
        .crew-calendar-fc .fc .fc-daygrid-event-harness .fc-event-main-frame {
          width: 100%;
          min-width: 0;
        }
        .crew-calendar-fc .fc .fc-daygrid-event-harness:hover {
          transform: translateY(-1px);
        }
        .crew-calendar-fc .fc .fc-scrollgrid,
        .crew-calendar-fc .fc .fc-scrollgrid table {
          color: hsl(var(--foreground));
        }
      `}</style>
    </div>
  );
}
