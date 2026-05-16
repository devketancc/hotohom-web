'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventContentArg, EventHoveringArg } from '@fullcalendar/core';
import { addDays, addMonths, differenceInCalendarDays, endOfMonth, format, startOfMonth } from 'date-fns';
import { AlertCircle, CalendarDays, ChevronLeft, ChevronRight, Clock3, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCrewCalendar } from '@/hooks/useCrewCalendar';
import { CREW_API_UNAVAILABLE_MESSAGE } from '@/services/crew.service';
import type { AdminStaffCalendarReason } from '@/types/admin';

type EventDetails = {
  id: string;
  title: string;
  reason: AdminStaffCalendarReason;
  notes: string;
  start: string;
  end: string;
  bookingId?: string;
  customerName?: string;
  bookingStatus?: string;
};

type HoverTooltip = {
  x: number;
  y: number;
  title: string;
  reason: AdminStaffCalendarReason;
  notes: string;
  start: string;
  end: string;
  customerName?: string;
};

function reasonToLabel(reason: AdminStaffCalendarReason): string {
  switch (reason) {
    case 'booking':
      return 'Booking';
    case 'leave':
      return 'Leave';
    case 'training':
      return 'Training';
    default:
      return 'Other';
  }
}

function reasonToColor(reason: AdminStaffCalendarReason): string {
  switch (reason) {
    case 'booking':
      return '#3b82f6';
    case 'leave':
      return '#d97706';
    case 'training':
      return '#8b5cf6';
    default:
      return '#6b7280';
  }
}

function reasonStyles(reason: AdminStaffCalendarReason): { tintClass: string; badgeClass: string } {
  switch (reason) {
    case 'booking':
      return { tintClass: 'bg-blue-500/12 border-l-blue-500 text-blue-100', badgeClass: 'bg-blue-500/20 text-blue-200' };
    case 'leave':
      return { tintClass: 'bg-amber-500/12 border-l-amber-500 text-amber-100', badgeClass: 'bg-amber-500/20 text-amber-200' };
    case 'training':
      return { tintClass: 'bg-violet-500/12 border-l-violet-500 text-violet-100', badgeClass: 'bg-violet-500/20 text-violet-200' };
    default:
      return { tintClass: 'bg-zinc-400/10 border-l-zinc-400 text-zinc-200', badgeClass: 'bg-zinc-500/20 text-zinc-200' };
  }
}

function formatDateRangeText(startIso: string, endIso: string): string {
  return `${format(new Date(startIso), 'dd MMM yyyy')} - ${format(new Date(endIso), 'dd MMM yyyy')}`;
}

export function CrewCalendarPanel() {
  const router = useRouter();
  const todayMonthStart = useMemo(() => startOfMonth(new Date()), []);
  const [activeMonthStart, setActiveMonthStart] = useState<Date>(todayMonthStart);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip | null>(null);

  const monthStart = useMemo(() => startOfMonth(activeMonthStart), [activeMonthStart]);
  const monthEnd = useMemo(() => endOfMonth(activeMonthStart), [activeMonthStart]);
  const rangeStart = format(monthStart, 'yyyy-MM-dd');
  const rangeEnd = format(monthEnd, 'yyyy-MM-dd');
  const maxMonthStart = useMemo(() => startOfMonth(addMonths(todayMonthStart, 6)), [todayMonthStart]);
  const canGoPrev = activeMonthStart > todayMonthStart;
  const canGoNext = activeMonthStart < maxMonthStart;
  const atTodayMonth = activeMonthStart.getTime() === todayMonthStart.getTime();

  const {
    data: calendar,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useCrewCalendar({ start: rangeStart, end: rangeEnd });

  const calendarEvents = useMemo(() => {
    const events = calendar?.events ?? [];
    return events.map((event) => {
      const reason = event.reason;
      const title = reason === 'booking' ? event.booking_info?.customer_name || 'Booking' : reasonToLabel(reason);
      return {
        id: event.blockout_id,
        title,
        start: event.start,
        end: format(addDays(new Date(event.end), 1), 'yyyy-MM-dd'),
        allDay: true,
        backgroundColor: reasonToColor(reason),
        borderColor: reasonToColor(reason),
        textColor: '#ffffff',
        extendedProps: {
          reason,
          notes: event.notes || '',
          originalStart: event.start,
          originalEnd: event.end,
          bookingId: event.booking_info?.id,
          customerName: event.booking_info?.customer_name,
          bookingStatus: event.booking_info?.status,
        },
      };
    });
  }, [calendar]);

  const onEventClick = (arg: EventClickArg) => {
    setSelectedEvent({
      id: arg.event.id,
      title: arg.event.title,
      reason: String(arg.event.extendedProps.reason || 'other') as AdminStaffCalendarReason,
      notes: arg.event.extendedProps.notes ? String(arg.event.extendedProps.notes) : '',
      start: String(arg.event.extendedProps.originalStart ?? arg.event.startStr),
      end: String(arg.event.extendedProps.originalEnd ?? arg.event.endStr ?? arg.event.startStr),
      bookingId: arg.event.extendedProps.bookingId ? String(arg.event.extendedProps.bookingId) : undefined,
      customerName: arg.event.extendedProps.customerName ? String(arg.event.extendedProps.customerName) : undefined,
      bookingStatus: arg.event.extendedProps.bookingStatus ? String(arg.event.extendedProps.bookingStatus) : undefined,
    });
  };

  const onEventMouseEnter = (arg: EventHoveringArg) => {
    setHoverTooltip({
      x: arg.jsEvent.clientX + 12,
      y: arg.jsEvent.clientY + 12,
      title: arg.event.title,
      reason: String(arg.event.extendedProps.reason || 'other') as AdminStaffCalendarReason,
      notes: arg.event.extendedProps.notes ? String(arg.event.extendedProps.notes) : '',
      start: String(arg.event.extendedProps.originalStart ?? arg.event.startStr),
      end: String(arg.event.extendedProps.originalEnd ?? arg.event.endStr ?? arg.event.startStr),
      customerName: arg.event.extendedProps.customerName ? String(arg.event.extendedProps.customerName) : undefined,
    });
  };

  const renderEventContent = (arg: EventContentArg) => {
    const reason = String(arg.event.extendedProps.reason || 'other') as AdminStaffCalendarReason;
    const customer = arg.event.extendedProps.customerName ? String(arg.event.extendedProps.customerName) : undefined;
    const title = reason === 'booking' ? customer || arg.event.title : arg.event.title;
    const notes = String(arg.event.extendedProps.notes || '');
    const eventStart = arg.event.start ?? new Date();
    const eventEnd = arg.event.end ?? eventStart;
    const durationDays = Math.max(differenceInCalendarDays(eventEnd, eventStart) || 1, 1);
    const styles = reasonStyles(reason);
    return (
      <div
        className={cn(
          'group/event h-full min-h-6 w-full border-l-[3px] px-2 py-1 shadow-sm',
          styles.tintClass,
          arg.isStart ? 'rounded-l-md' : 'rounded-l-none',
          arg.isEnd ? 'rounded-r-md' : 'rounded-r-none'
        )}
      >
        <div className="flex items-center justify-between gap-1">
          <p className="truncate text-[11px] font-semibold leading-4">{title}</p>
          <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase', styles.badgeClass)}>
            {reasonToLabel(reason)}
          </span>
        </div>
        {(durationDays > 1 || notes) && (
          <div className="mt-0.5 flex items-center gap-1 text-[10px] opacity-85">
            {durationDays > 1 ? (
              <>
                <Clock3 className="size-2.5" />
                <span>{durationDays}d</span>
              </>
            ) : null}
            {notes ? <span className="truncate">{notes}</span> : null}
          </div>
        )}
      </div>
    );
  };

  const openBookingDetail = () => {
    if (!selectedEvent?.bookingId) return;
    router.push(`/crew/bookings/${encodeURIComponent(selectedEvent.bookingId)}?from=calendar`);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={calendar?.name ? `My calendar — ${calendar.name}` : 'My calendar'}
        description={[calendar?.hub, format(activeMonthStart, 'MMMM yyyy')].filter(Boolean).join(' · ')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveMonthStart(addMonths(activeMonthStart, -1))}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="size-4" /> Prev
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setActiveMonthStart(todayMonthStart)} disabled={atTodayMonth}>
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
        }
      />

      {isPending ? <div className="h-[620px] animate-pulse rounded-xl border border-border bg-muted/30" aria-hidden /> : null}

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center">
          <p className="text-sm font-medium text-destructive">
            {error instanceof Error
              ? (error as Error & { code?: string }).code === 'CREW_API_UNAVAILABLE' ||
                error.message.toLowerCase().includes('404')
                ? CREW_API_UNAVAILABLE_MESSAGE
                : error.message
              : 'Failed to load calendar'}
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-4 gap-2" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} /> Retry
          </Button>
        </div>
      ) : null}

      {!isPending && !isError ? (
        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <CalendarDays className="size-4" />
              <span className="text-base font-bold text-foreground">{format(activeMonthStart, 'MMMM yyyy')}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {(['booking', 'leave', 'training', 'other'] as AdminStaffCalendarReason[]).map((reason) => {
                const styles = reasonStyles(reason);
                return (
                  <span key={reason} className={cn('rounded-md border border-border/60 px-2 py-1 font-semibold', styles.tintClass)}>
                    {reasonToLabel(reason)}
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
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <FullCalendar
                  key={format(activeMonthStart, 'yyyy-MM')}
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  initialDate={activeMonthStart}
                  validRange={{
                    start: format(todayMonthStart, 'yyyy-MM-dd'),
                    end: format(addMonths(todayMonthStart, 7), 'yyyy-MM-dd'),
                  }}
                  headerToolbar={false}
                  fixedWeekCount={false}
                  dayMaxEvents={3}
                  events={calendarEvents}
                  eventClick={onEventClick}
                  eventMouseEnter={onEventMouseEnter}
                  eventMouseLeave={() => setHoverTooltip(null)}
                  eventContent={renderEventContent}
                  eventDisplay="block"
                  height="auto"
                />
              </div>
            </div>
          )}
        </section>
      ) : null}

      {hoverTooltip ? (
        <div
          className="fixed z-[120] max-w-xs rounded-lg border border-border/80 bg-card/95 p-3 text-xs text-card-foreground shadow-xl backdrop-blur"
          style={{ left: hoverTooltip.x, top: hoverTooltip.y }}
        >
          <p className="font-semibold">{hoverTooltip.title}</p>
          <p className="mt-1 text-muted-foreground">{formatDateRangeText(hoverTooltip.start, hoverTooltip.end)}</p>
          <p className="mt-1">
            <span className="font-semibold">Type:</span> {reasonToLabel(hoverTooltip.reason)}
          </p>
          {hoverTooltip.customerName ? (
            <p className="mt-1">
              <span className="font-semibold">Customer:</span> {hoverTooltip.customerName}
            </p>
          ) : null}
        </div>
      ) : null}

      {selectedEvent ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedEvent(null)}
            aria-label="Close details"
          />
          <section className="relative z-[131] w-full max-w-lg rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{reasonToLabel(selectedEvent.reason)}</p>
                <h3 className="mt-1 text-lg font-semibold">{selectedEvent.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{formatDateRangeText(selectedEvent.start, selectedEvent.end)}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              {selectedEvent.customerName ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</dt>
                  <dd>{selectedEvent.customerName}</dd>
                </div>
              ) : null}
              {selectedEvent.bookingStatus ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking status</dt>
                  <dd className="capitalize">{selectedEvent.bookingStatus}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</dt>
                <dd className="text-muted-foreground">{selectedEvent.notes || '—'}</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-end gap-2">
              {selectedEvent.bookingId ? (
                <Button type="button" size="sm" onClick={openBookingDetail}>
                  View booking
                </Button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      <style jsx global>{`
        .fc-theme-standard .fc-scrollgrid,
        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: hsl(var(--border));
        }
        .fc .fc-scrollgrid-section-header th {
          background-color: hsl(var(--card));
        }
        .fc .fc-daygrid-day {
          background-color: hsl(var(--card));
        }
        .fc .fc-daygrid-day-frame {
          min-height: 108px;
          padding: 6px;
        }
        .fc .fc-day-today {
          box-shadow: inset 0 0 0 1px hsl(var(--primary) / 0.45);
          background-color: hsl(var(--primary) / 0.08) !important;
        }
        .fc .fc-daygrid-day-number {
          font-size: 12px;
          color: hsl(var(--muted-foreground));
        }
        .fc .fc-daygrid-event {
          border: 0 !important;
          background: transparent !important;
          margin-top: 2px !important;
        }
      `}</style>
    </div>
  );
}
