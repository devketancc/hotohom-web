'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventContentArg, EventHoveringArg } from '@fullcalendar/core';
import { addDays, addMonths, differenceInCalendarDays, eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import { AlertCircle, AlertTriangle, ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock3, RefreshCw, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  adminQueryKeys,
  createAdminCaravanBlockout,
  deleteAdminCaravanBlockout,
  getAdminCaravanCalendar,
  getAdminFleetCaravanById,
} from '@/services/admin.service';
import type { AdminCalendarEventReason, AdminCaravanManualBlockoutReason } from '@/types/admin';

type CalendarEventDetails = {
  id: string;
  title: string;
  reason: AdminCalendarEventReason;
  notes: string;
  start: string;
  end: string;
  bookingId?: string;
  customerName?: string;
  bookingStatus?: string;
  driverName?: string;
  helperName?: string;
  showAssignmentWarning?: boolean;
  isBookingManaged?: boolean;
};

type BlockoutFormState = {
  start_date: string;
  end_date: string;
  reason: AdminCaravanManualBlockoutReason;
  notes: string;
};

type BlockoutFormErrors = Partial<Record<keyof BlockoutFormState, string>> & { form?: string };

type HoverTooltip = {
  x: number;
  y: number;
  title: string;
  reason: AdminCalendarEventReason;
  notes: string;
  start: string;
  end: string;
  customerName?: string;
};

function reasonToLabel(reason: AdminCalendarEventReason): string {
  switch (reason) {
    case 'booking':
      return 'Booking';
    case 'maintenance':
      return 'Maintenance';
    case 'private_event':
      return 'Private Event';
    case 'breakdown':
      return 'Breakdown';
    default:
      return 'Other';
  }
}

function reasonStyles(reason: AdminCalendarEventReason): { tintClass: string; badgeClass: string } {
  switch (reason) {
    case 'booking':
      return {
        tintClass: 'bg-blue-500/12 border-l-blue-500 text-blue-100',
        badgeClass: 'bg-blue-500/20 text-blue-200',
      };
    case 'maintenance':
      return {
        tintClass: 'bg-amber-500/12 border-l-amber-500 text-amber-100',
        badgeClass: 'bg-amber-500/20 text-amber-200',
      };
    case 'private_event':
      return {
        tintClass: 'bg-violet-500/12 border-l-violet-500 text-violet-100',
        badgeClass: 'bg-violet-500/20 text-violet-200',
      };
    case 'breakdown':
      return {
        tintClass: 'bg-rose-500/12 border-l-rose-500 text-rose-100',
        badgeClass: 'bg-rose-500/20 text-rose-200',
      };
    default:
      return {
        tintClass: 'bg-zinc-400/10 border-l-zinc-400 text-zinc-200',
        badgeClass: 'bg-zinc-500/20 text-zinc-200',
      };
  }
}

function reasonToCalendarColor(reason: AdminCalendarEventReason): string {
  switch (reason) {
    case 'booking':
      return '#3b82f6';
    case 'maintenance':
      return '#d97706';
    case 'private_event':
      return '#8b5cf6';
    case 'breakdown':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

function formatDateRangeText(startIso: string, endIso: string): string {
  return `${format(new Date(startIso), 'dd MMM yyyy')} - ${format(new Date(endIso), 'dd MMM yyyy')}`;
}

function validateBlockoutForm(values: BlockoutFormState): BlockoutFormErrors {
  const errors: BlockoutFormErrors = {};
  if (!values.start_date) errors.start_date = 'Start date is required.';
  if (!values.end_date) errors.end_date = 'End date is required.';
  if (values.start_date && values.end_date && values.end_date < values.start_date) {
    errors.end_date = 'End date must be on or after start date.';
  }
  return errors;
}

function collectDaysInWindow(
  events: CalendarEventDetails[],
  predicate: (event: CalendarEventDetails) => boolean,
  windowStart: Date,
  windowEnd: Date
): Set<string> {
  const days = new Set<string>();
  for (const event of events) {
    if (!predicate(event)) continue;
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const clippedStart = eventStart > windowStart ? eventStart : windowStart;
    const clippedEnd = eventEnd < windowEnd ? eventEnd : windowEnd;
    if (clippedStart > clippedEnd) continue;
    eachDayOfInterval({ start: clippedStart, end: clippedEnd }).forEach((d) => days.add(format(d, 'yyyy-MM-dd')));
  }
  return days;
}

function CaravanCalendarContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const caravanId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const hub = searchParams.get('hub') ?? undefined;

  const todayMonthStart = useMemo(() => startOfMonth(new Date()), []);
  const [activeMonthStart, setActiveMonthStart] = useState<Date>(todayMonthStart);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDetails | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blockoutForm, setBlockoutForm] = useState<BlockoutFormState>({
    start_date: '',
    end_date: '',
    reason: 'other',
    notes: '',
  });
  const [blockoutFormErrors, setBlockoutFormErrors] = useState<BlockoutFormErrors>({});

  const rangeStart = useMemo(() => format(startOfMonth(activeMonthStart), 'yyyy-MM-dd'), [activeMonthStart]);
  const rangeEnd = useMemo(() => format(endOfMonth(activeMonthStart), 'yyyy-MM-dd'), [activeMonthStart]);
  const maxMonthStart = useMemo(() => startOfMonth(addMonths(todayMonthStart, 6)), [todayMonthStart]);

  const backToDetailHref = useMemo(() => {
    const q = searchParams.toString();
    const base = caravanId ? `/admin/caravans/${caravanId}` : '/admin/caravans';
    return q ? `${base}?${q}` : base;
  }, [caravanId, searchParams]);

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: adminQueryKeys.caravanCalendar({
      caravanId,
      start: rangeStart,
      end: rangeEnd,
      ...(hub ? { hub } : {}),
    }),
    queryFn: () => getAdminCaravanCalendar({ caravanId, start: rangeStart, end: rangeEnd, ...(hub ? { hub } : {}) }),
    enabled: Boolean(caravanId),
    staleTime: 5 * 60 * 1000,
  });
  const { data: caravanDetail } = useQuery({
    queryKey: adminQueryKeys.caravanDetail(caravanId),
    queryFn: () => getAdminFleetCaravanById(caravanId),
    enabled: Boolean(caravanId),
    staleTime: 5 * 60 * 1000,
  });

  const createBlockoutMutation = useMutation({
    mutationFn: (payload: BlockoutFormState) =>
      createAdminCaravanBlockout(caravanId, {
        start_date: payload.start_date,
        end_date: payload.end_date,
        reason: payload.reason,
        notes: payload.notes.trim(),
      }),
    onSuccess: async () => {
      setBanner({ type: 'success', message: 'Caravan blockout added successfully.' });
      setAddModalOpen(false);
      setBlockoutForm({ start_date: '', end_date: '', reason: 'other', notes: '' });
      setBlockoutFormErrors({});
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.caravanCalendar({ caravanId, start: rangeStart, end: rangeEnd, ...(hub ? { hub } : {}) }),
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to create caravan blockout.';
      setBlockoutFormErrors((prev) => ({ ...prev, form: message }));
    },
  });

  const deleteBlockoutMutation = useMutation({
    mutationFn: (blockoutId: string) => deleteAdminCaravanBlockout(caravanId, blockoutId),
    onSuccess: async () => {
      setBanner({ type: 'success', message: 'Caravan blockout removed.' });
      setDeleteConfirmOpen(false);
      setSelectedEvent(null);
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.caravanCalendar({ caravanId, start: rangeStart, end: rangeEnd, ...(hub ? { hub } : {}) }),
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to remove caravan blockout.';
      setBanner({ type: 'error', message });
      setDeleteConfirmOpen(false);
    },
  });

  const calendarEvents = useMemo(() => {
    const events = data?.events ?? [];
    return events.map((event) => {
      const reason = event.reason;
      const title =
        reason === 'booking'
          ? event.booking_info?.customer_name || 'Booking'
          : reason === 'maintenance'
            ? 'Maintenance'
            : reasonToLabel(reason);
      return {
        id: event.blockout_id,
        title,
        start: event.start,
        end: format(addDays(new Date(event.end), 1), 'yyyy-MM-dd'),
        allDay: true,
        backgroundColor: reasonToCalendarColor(reason),
        borderColor: reasonToCalendarColor(reason),
        textColor: '#ffffff',
        extendedProps: {
          reason,
          notes: event.notes || '',
          originalStart: event.start,
          originalEnd: event.end,
          bookingId: event.booking_info?.id,
          customerName: event.booking_info?.customer_name,
          bookingStatus: event.booking_info?.status,
          driverName: event.booking_info?.driver?.name,
          helperName: event.booking_info?.helper?.name,
          showAssignmentWarning:
            reason === 'booking' &&
            (!event.booking_info?.driver || !event.booking_info?.helper || !data?.caravan_id),
          isBookingManaged: reason === 'booking',
        },
      };
    });
  }, [data]);

  const detailEvents = useMemo<CalendarEventDetails[]>(
    () =>
      calendarEvents.map((e) => ({
        id: e.id,
        title: e.title,
        reason: e.extendedProps.reason as AdminCalendarEventReason,
        notes: String(e.extendedProps.notes ?? ''),
        start: String(e.extendedProps.originalStart ?? e.start),
        end: String(e.extendedProps.originalEnd ?? e.start),
        bookingId: e.extendedProps.bookingId ? String(e.extendedProps.bookingId) : undefined,
        customerName: e.extendedProps.customerName ? String(e.extendedProps.customerName) : undefined,
        bookingStatus: e.extendedProps.bookingStatus ? String(e.extendedProps.bookingStatus) : undefined,
        driverName: e.extendedProps.driverName ? String(e.extendedProps.driverName) : undefined,
        helperName: e.extendedProps.helperName ? String(e.extendedProps.helperName) : undefined,
        showAssignmentWarning: Boolean(e.extendedProps.showAssignmentWarning),
        isBookingManaged: Boolean(e.extendedProps.isBookingManaged),
      })),
    [calendarEvents]
  );

  const monthStart = useMemo(() => startOfMonth(activeMonthStart), [activeMonthStart]);
  const monthEnd = useMemo(() => endOfMonth(activeMonthStart), [activeMonthStart]);
  const bookingCount = useMemo(() => detailEvents.filter((e) => e.reason === 'booking').length, [detailEvents]);
  const warningBookingCount = useMemo(
    () => detailEvents.filter((e) => e.reason === 'booking' && e.showAssignmentWarning).length,
    [detailEvents]
  );
  const nonBookingEventCount = useMemo(() => detailEvents.filter((e) => e.reason !== 'booking').length, [detailEvents]);
  const confirmedBookingCount = useMemo(
    () => detailEvents.filter((e) => e.reason === 'booking' && (e.bookingStatus ?? '').toLowerCase() === 'confirmed').length,
    [detailEvents]
  );
  const bookedDays = useMemo(
    () => collectDaysInWindow(detailEvents, (e) => e.reason === 'booking', monthStart, monthEnd).size,
    [detailEvents, monthStart, monthEnd]
  );
  const daysInMonth = useMemo(() => differenceInCalendarDays(monthEnd, monthStart) + 1, [monthStart, monthEnd]);
  const availableDays = Math.max(daysInMonth - bookedDays, 0);

  const onEventClick = (arg: EventClickArg) => {
    const reason = String(arg.event.extendedProps.reason || 'other') as AdminCalendarEventReason;
    const bookingId = arg.event.extendedProps.bookingId ? String(arg.event.extendedProps.bookingId) : undefined;
    setSelectedEvent({
      id: arg.event.id,
      title: arg.event.title,
      reason,
      notes: arg.event.extendedProps.notes ? String(arg.event.extendedProps.notes) : '',
      start: String(arg.event.extendedProps.originalStart ?? arg.event.startStr),
      end: String(arg.event.extendedProps.originalEnd ?? arg.event.endStr ?? arg.event.startStr),
      bookingId,
      customerName: arg.event.extendedProps.customerName ? String(arg.event.extendedProps.customerName) : undefined,
      bookingStatus: arg.event.extendedProps.bookingStatus ? String(arg.event.extendedProps.bookingStatus) : undefined,
      driverName: arg.event.extendedProps.driverName ? String(arg.event.extendedProps.driverName) : undefined,
      helperName: arg.event.extendedProps.helperName ? String(arg.event.extendedProps.helperName) : undefined,
      showAssignmentWarning: Boolean(arg.event.extendedProps.showAssignmentWarning),
      isBookingManaged: Boolean(arg.event.extendedProps.isBookingManaged),
    });
  };

  const onEventMouseEnter = (arg: EventHoveringArg) => {
    const reason = String(arg.event.extendedProps.reason || 'other') as AdminCalendarEventReason;
    setHoverTooltip({
      x: arg.jsEvent.clientX + 12,
      y: arg.jsEvent.clientY + 12,
      title: arg.event.title,
      reason,
      notes: arg.event.extendedProps.notes ? String(arg.event.extendedProps.notes) : '',
      start: String(arg.event.extendedProps.originalStart ?? arg.event.startStr),
      end: String(arg.event.extendedProps.originalEnd ?? arg.event.endStr ?? arg.event.startStr),
      customerName: arg.event.extendedProps.customerName ? String(arg.event.extendedProps.customerName) : undefined,
    });
  };

  const onEventMouseLeave = () => setHoverTooltip(null);

  const renderEventContent = (arg: EventContentArg) => {
    const reason = String(arg.event.extendedProps.reason || 'other') as AdminCalendarEventReason;
    const notes = String(arg.event.extendedProps.notes || '');
    const customer = arg.event.extendedProps.customerName ? String(arg.event.extendedProps.customerName) : undefined;
    const showAssignmentWarning = Boolean(arg.event.extendedProps.showAssignmentWarning);
    const title = reason === 'booking' ? customer || arg.event.title : arg.event.title;
    const eventStart = arg.event.start ?? new Date();
    const eventEnd = arg.event.end ?? eventStart;
    const durationDays = Math.max(differenceInCalendarDays(eventEnd, eventStart) || 1, 1);
    const styles = reasonStyles(reason);
    return (
      <div
        className={cn(
          'group/event fc-rich-event h-full min-h-6 w-full border-l-[3px] px-2 py-1 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md',
          styles.tintClass,
          arg.isStart ? 'rounded-l-md' : 'rounded-l-none',
          arg.isEnd ? 'rounded-r-md' : 'rounded-r-none'
        )}
      >
        <div className="flex items-center justify-between gap-1">
          <p className="truncate text-[11px] font-semibold leading-4">
            {showAssignmentWarning ? <AlertTriangle className="mr-1 inline size-3 text-amber-300" aria-label="Assignment missing warning" /> : null}
            {title}
          </p>
          <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', styles.badgeClass)}>
            {reasonToLabel(reason)}
          </span>
        </div>
        {(durationDays > 1 || notes) && (
          <div className="mt-0.5 flex items-center gap-1 text-[10px] opacity-85">
            {durationDays > 1 ? (
              <>
                <Clock3 className="size-2.5" aria-hidden />
                <span>{durationDays}d</span>
              </>
            ) : null}
            {notes ? <span className="truncate">{notes}</span> : null}
          </div>
        )}
      </div>
    );
  };

  const openAddBlockoutModal = () => {
    const defaultDate = format(startOfMonth(activeMonthStart), 'yyyy-MM-dd');
    setBlockoutForm({
      start_date: defaultDate,
      end_date: defaultDate,
      reason: 'other',
      notes: '',
    });
    setBlockoutFormErrors({});
    setAddModalOpen(true);
  };

  const submitAddBlockout = () => {
    const errors = validateBlockoutForm(blockoutForm);
    setBlockoutFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    createBlockoutMutation.mutate(blockoutForm);
  };

  const canGoPrev = activeMonthStart > todayMonthStart;
  const canGoNext = activeMonthStart < maxMonthStart;
  const atTodayMonth = activeMonthStart.getTime() === todayMonthStart.getTime();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={backToDetailHref}
          scroll={false}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to caravan details
        </Link>
      </div>

      <AdminPageHeader
        title={caravanDetail?.name ? `Calendar - ${caravanDetail.name}` : data?.registration ? `Calendar - ${data.registration}` : 'Caravan Availability Calendar'}
        description={
          data
            ? [data.registration ? `#${data.registration}` : null, data.hub, format(activeMonthStart, 'MMMM yyyy')]
                .filter(Boolean)
                .join(' · ')
            : format(activeMonthStart, 'MMMM yyyy')
        }
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={openAddBlockoutModal}>
              + Add Blockout
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setActiveMonthStart(addMonths(activeMonthStart, -1))} disabled={!canGoPrev}>
              <ChevronLeft className="size-4" aria-hidden />
              Prev
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setActiveMonthStart(todayMonthStart)} disabled={atTodayMonth}>
              Today
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setActiveMonthStart(addMonths(activeMonthStart, 1))} disabled={!canGoNext}>
              Next
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        }
      />

      {banner ? (
        <div
          className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            banner.type === 'success' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-destructive/30 bg-destructive/10 text-destructive'
          )}
        >
          {banner.message}
        </div>
      ) : null}

      {!isPending && !isError ? (
        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border/80 bg-background/30 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Total bookings</p>
              <p className="mt-1 text-2xl font-bold text-blue-300">{bookingCount}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-background/30 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Booked days</p>
              <p className="mt-1 text-2xl font-bold text-blue-300">{bookedDays}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-background/30 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Available days</p>
              <p className="mt-1 text-2xl font-bold text-emerald-300">{availableDays}</p>
            </div>
          </div>
          <div className="grid gap-2 border-t border-border/70 pt-3 text-sm sm:grid-cols-3">
            <p className="text-muted-foreground">
              Assignment alerts:{' '}
              <span className={cn('font-semibold', warningBookingCount > 0 ? 'text-amber-300' : 'text-emerald-300')}>
                {warningBookingCount}
              </span>
            </p>
            <p className="text-muted-foreground">
              Confirmed bookings: <span className="font-semibold text-blue-300">{confirmedBookingCount}</span>
            </p>
            <p className="text-muted-foreground">
              Other blockouts: <span className="font-semibold text-violet-300">{nonBookingEventCount}</span>
            </p>
          </div>
        </section>
      ) : null}

      {isPending ? (
        <div className="h-[620px] animate-pulse rounded-xl border border-border bg-muted/30" aria-hidden />
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center">
          <p className="text-sm font-medium text-destructive">{error instanceof Error ? error.message : 'Failed to load availability calendar'}</p>
          <Button type="button" variant="outline" size="sm" className="mt-4 gap-2" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} aria-hidden />
            Retry
          </Button>
        </div>
      ) : null}

      {!isPending && !isError ? (
        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <CalendarDays className="size-4" aria-hidden />
              <span className="text-base font-bold text-foreground">{format(activeMonthStart, 'MMMM yyyy')}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {(['booking', 'maintenance', 'private_event', 'breakdown', 'other'] as AdminCalendarEventReason[]).map((reason) => {
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
              <AlertCircle className="mb-3 size-8 text-muted-foreground/60" aria-hidden />
              <p className="font-medium text-foreground">No events for this month</p>
              <p className="mt-1 text-sm text-muted-foreground">No blockouts were returned for this caravan in the selected month.</p>
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
                  eventMouseLeave={onEventMouseLeave}
                  eventContent={renderEventContent}
                  eventDisplay="block"
                  eventClassNames={(arg) => ['fc-modern-event', arg.isStart ? 'fc-event-start' : 'fc-event-middle', arg.isEnd ? 'fc-event-end' : 'fc-event-middle']}
                  dayCellClassNames={() => ['fc-modern-daycell']}
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
          {hoverTooltip.notes ? (
            <p className="mt-1 line-clamp-2 text-muted-foreground">{hoverTooltip.notes}</p>
          ) : null}
        </div>
      ) : null}

      {selectedEvent ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setSelectedEvent(null)} aria-label="Close details modal" />
          <section className="relative z-[131] w-full max-w-lg rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{reasonToLabel(selectedEvent.reason)}</p>
                <h3 className="mt-1 text-lg font-semibold">{selectedEvent.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{formatDateRangeText(selectedEvent.start, selectedEvent.end)}</p>
              </div>
              <button type="button" onClick={() => setSelectedEvent(null)} className={cn(buttonVariants({ variant: 'ghost', size: 'xs' }))}>
                Close
              </button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason</dt>
                <dd>{reasonToLabel(selectedEvent.reason)}</dd>
              </div>
              {selectedEvent.customerName ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</dt>
                  <dd>
                    {selectedEvent.showAssignmentWarning ? <AlertTriangle className="mr-1 inline size-3.5 text-amber-300" aria-label="Assignment missing warning" /> : null}
                    {selectedEvent.customerName}
                  </dd>
                </div>
              ) : null}
              {selectedEvent.bookingStatus ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking status</dt>
                  <dd className="capitalize">{selectedEvent.bookingStatus}</dd>
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Driver</dt>
                  <dd>{selectedEvent.driverName || 'Unassigned'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Helper</dt>
                  <dd>{selectedEvent.helperName || 'Unassigned'}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</dt>
                <dd className="text-muted-foreground">{selectedEvent.notes || 'No notes provided'}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedEvent.isBookingManaged ? (
                  <p className="text-xs font-semibold text-muted-foreground">Managed by booking; cannot delete here.</p>
                ) : (
                  <p className="text-xs font-semibold text-muted-foreground">Manual blockout; deletion allowed.</p>
                )}
                {selectedEvent.isBookingManaged && selectedEvent.bookingId ? (
                  <Link
                    href={`/admin/bookings/${encodeURIComponent(selectedEvent.bookingId)}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    Open booking
                  </Link>
                ) : null}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={selectedEvent.isBookingManaged || deleteBlockoutMutation.isPending}
                className="gap-1.5"
              >
                <Trash2 className="size-3.5" />
                Delete blockout
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      {addModalOpen ? (
        <div className="fixed inset-0 z-[135] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setAddModalOpen(false)} aria-label="Close add blockout modal" />
          <section className="relative z-[136] w-full max-w-lg rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Caravan blockout</p>
                <h3 className="mt-1 text-lg font-semibold">Add Blockout</h3>
              </div>
              <Button type="button" variant="ghost" size="xs" onClick={() => setAddModalOpen(false)}>
                Close
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start date</label>
                <input
                  type="date"
                  value={blockoutForm.start_date}
                  onChange={(e) => setBlockoutForm((prev) => ({ ...prev, start_date: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring"
                />
                {blockoutFormErrors.start_date ? <p className="mt-1 text-xs text-destructive">{blockoutFormErrors.start_date}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">End date</label>
                <input
                  type="date"
                  value={blockoutForm.end_date}
                  onChange={(e) => setBlockoutForm((prev) => ({ ...prev, end_date: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring"
                />
                {blockoutFormErrors.end_date ? <p className="mt-1 text-xs text-destructive">{blockoutFormErrors.end_date}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reason</label>
                <select
                  value={blockoutForm.reason}
                  onChange={(e) => setBlockoutForm((prev) => ({ ...prev, reason: (e.target.value as AdminCaravanManualBlockoutReason) || 'other' }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="private_event">Private event</option>
                  <option value="breakdown">Breakdown</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (optional)</label>
                <textarea
                  value={blockoutForm.notes}
                  onChange={(e) => setBlockoutForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/20 focus:ring"
                  placeholder="Add context for this blockout"
                />
              </div>
            </div>
            {blockoutFormErrors.form ? <p className="mt-3 text-sm text-destructive">{blockoutFormErrors.form}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={submitAddBlockout} disabled={createBlockoutMutation.isPending}>
                {createBlockoutMutation.isPending ? 'Saving...' : 'Add Blockout'}
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      {deleteConfirmOpen && selectedEvent ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setDeleteConfirmOpen(false)} aria-label="Close delete confirmation" />
          <section className="relative z-[141] w-full max-w-md rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
            <h3 className="text-base font-semibold">Delete blockout?</h3>
            <p className="mt-2 text-sm text-muted-foreground">This will remove this manual blockout from the caravan calendar.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => deleteBlockoutMutation.mutate(selectedEvent.id)}
                disabled={deleteBlockoutMutation.isPending}
              >
                {deleteBlockoutMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
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
          transition: background-color 180ms ease;
        }
        .fc .fc-daygrid-day.fc-modern-daycell:hover .fc-daygrid-day-frame {
          background-color: hsl(var(--muted) / 0.28);
        }
        .fc .fc-day-today {
          box-shadow: inset 0 0 0 1px hsl(var(--primary) / 0.45);
          background-color: hsl(var(--primary) / 0.08) !important;
        }
        .fc .fc-daygrid-day-top {
          justify-content: flex-end;
          padding: 2px 4px 4px;
        }
        .fc .fc-daygrid-day-number {
          font-size: 12px;
          color: hsl(var(--muted-foreground));
        }
        .fc .fc-col-header-cell-cushion {
          padding: 8px 0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: hsl(var(--foreground));
          opacity: 0.85;
        }
        .fc .fc-daygrid-event {
          border: 0 !important;
          background: transparent !important;
          margin-top: 2px !important;
        }
        .fc .fc-daygrid-event-harness {
          transition: transform 180ms ease;
        }
        .fc .fc-daygrid-event-harness:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

export default function AdminCaravanCalendarPage() {
  return (
    <Suspense fallback={<div className="h-[620px] animate-pulse rounded-xl border border-border bg-muted/30" aria-hidden />}>
      <CaravanCalendarContent />
    </Suspense>
  );
}
