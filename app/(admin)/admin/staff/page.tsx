'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventContentArg, EventHoveringArg } from '@fullcalendar/core';
import { addDays, addMonths, differenceInCalendarDays, eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import { Search, RefreshCw, Users, Pencil, AlertCircle, CalendarDays, ChevronLeft, ChevronRight, Clock3, AlertTriangle } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  adminQueryKeys,
  createAdminStaff,
  getAdminStaffCalendar,
  listAdminHubs,
  listAdminStaff,
  updateAdminStaff,
} from '@/services/admin.service';
import type {
  AdminCreateStaffPayload,
  AdminStaffCalendarReason,
  AdminStaffProfile,
  AdminStaffRole,
  AdminUpdateStaffPayload,
} from '@/types/admin';

type StaffFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: '' | AdminStaffRole;
  hub: string;
  isActive: boolean;
  notes: string;
};

type StaffFormErrors = Partial<Record<keyof StaffFormState, string>> & { form?: string };

const PAGE_SIZE = 10;

function formatDate(value: string): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return '—';
  return parsed.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function roleBadgeClass(role: AdminStaffRole): string {
  if (role === 'driver') return 'bg-sky-500/15 text-sky-300';
  return 'bg-violet-500/15 text-violet-300';
}

function mapStaffToForm(staff: AdminStaffProfile): StaffFormState {
  return {
    firstName: staff.user.first_name || '',
    lastName: staff.user.last_name || '',
    email: staff.user.email || '',
    phone: staff.user.phone || '',
    role: staff.role,
    hub: staff.hub,
    isActive: staff.is_active,
    notes: staff.notes || '',
  };
}

function validateForm(values: StaffFormState): StaffFormErrors {
  const errors: StaffFormErrors = {};

  const firstName = values.firstName.trim();
  if (!firstName) {
    errors.firstName = 'First name is required.';
  } else if (firstName.length < 3) {
    errors.firstName = 'First name must be at least 3 characters.';
  } else if (!/^[A-Za-z ]+$/.test(firstName)) {
    errors.firstName = 'Use only alphabets and spaces.';
  }

  const lastName = values.lastName.trim();
  if (lastName && !/^[A-Za-z ]+$/.test(lastName)) {
    errors.lastName = 'Use only alphabets and spaces.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^\d{10}$/.test(values.phone.trim())) {
    errors.phone = 'Phone must be exactly 10 digits.';
  }

  if (!values.hub) errors.hub = 'Hub is required.';
  if (!values.role) errors.role = 'Role is required.';

  return errors;
}

function staffMatchesSearch(staff: AdminStaffProfile, term: string): boolean {
  if (!term) return true;
  const needle = term.toLowerCase();
  return (
    staff.user.name.toLowerCase().includes(needle) ||
    staff.user.email.toLowerCase().includes(needle) ||
    staff.user.phone.toLowerCase().includes(needle)
  );
}

type StaffCalendarEventDetails = {
  id: string;
  title: string;
  reason: AdminStaffCalendarReason;
  notes: string;
  start: string;
  end: string;
  bookingId?: string;
  customerName?: string;
  bookingStatus?: string;
  driverName?: string;
  helperName?: string;
  showAssignmentWarning?: boolean;
};

type StaffHoverTooltip = {
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

function reasonToCalendarColor(reason: AdminStaffCalendarReason): string {
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

function collectDaysInWindow(
  events: StaffCalendarEventDetails[],
  predicate: (event: StaffCalendarEventDetails) => boolean,
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

export default function AdminStaffPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingStaff, setEditingStaff] = useState<AdminStaffProfile | null>(null);
  const [form, setForm] = useState<StaffFormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    hub: '',
    isActive: true,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<StaffFormErrors>({});
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<StaffCalendarEventDetails | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<StaffHoverTooltip | null>(null);
  const todayMonthStart = useMemo(() => startOfMonth(new Date()), []);
  const [activeMonthStart, setActiveMonthStart] = useState<Date>(todayMonthStart);

  const initialHub = searchParams.get('hub') ?? '';
  const initialRole = searchParams.get('role') === 'helper' ? 'helper' : searchParams.get('role') === 'driver' ? 'driver' : '';
  const initialSearch = searchParams.get('search') ?? '';
  const initialPage = Number(searchParams.get('page') ?? '1') || 1;

  const [hubFilter, setHubFilter] = useState(initialHub);
  const [roleFilter, setRoleFilter] = useState<'' | AdminStaffRole>(initialRole);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [selectedStaffId, setSelectedStaffId] = useState('');

  useEffect(() => {
    setSearchTerm(initialSearch);
    setDebouncedSearch(initialSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (hubFilter) params.set('hub', hubFilter);
    if (roleFilter) params.set('role', roleFilter);
    if (page > 1) params.set('page', String(page));
    const next = params.toString();
    const nextUrl = next ? `${pathname}?${next}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [debouncedSearch, hubFilter, roleFilter, page, pathname, router]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, hubFilter, roleFilter]);

  const staffQueryKey = adminQueryKeys.staff({ role: roleFilter || undefined, hub: hubFilter || undefined });

  const {
    data: staffList = [],
    isPending: isStaffPending,
    isError: isStaffError,
    error: staffError,
    refetch: refetchStaff,
    isFetching: isStaffFetching,
  } = useQuery({
    queryKey: staffQueryKey,
    queryFn: () => listAdminStaff({ role: roleFilter || undefined, hub: hubFilter || undefined }),
    staleTime: 2 * 60 * 1000,
  });

  const rangeStart = useMemo(() => format(startOfMonth(activeMonthStart), 'yyyy-MM-dd'), [activeMonthStart]);
  const rangeEnd = useMemo(() => format(endOfMonth(activeMonthStart), 'yyyy-MM-dd'), [activeMonthStart]);
  const maxMonthStart = useMemo(() => startOfMonth(addMonths(todayMonthStart, 6)), [todayMonthStart]);
  const canGoPrev = activeMonthStart > todayMonthStart;
  const canGoNext = activeMonthStart < maxMonthStart;
  const atTodayMonth = activeMonthStart.getTime() === todayMonthStart.getTime();

  const selectedStaff = useMemo(() => staffList.find((s) => s.id === selectedStaffId) ?? null, [staffList, selectedStaffId]);

  const {
    data: selectedStaffCalendar,
    isPending: isCalendarPending,
    isError: isCalendarError,
    error: calendarError,
    refetch: refetchCalendar,
    isFetching: isCalendarFetching,
  } = useQuery({
    queryKey: adminQueryKeys.staffCalendar({
      staffId: selectedStaffId,
      start: rangeStart,
      end: rangeEnd,
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(hubFilter ? { hub: hubFilter } : {}),
    }),
    queryFn: () =>
      getAdminStaffCalendar({
        staffId: selectedStaffId,
        start: rangeStart,
        end: rangeEnd,
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(hubFilter ? { hub: hubFilter } : {}),
      }),
    enabled: Boolean(selectedStaffId),
    staleTime: 5 * 60 * 1000,
  });

  const { data: hubs = [], isPending: isHubsPending } = useQuery({
    queryKey: adminQueryKeys.hubs,
    queryFn: listAdminHubs,
    staleTime: 5 * 60 * 1000,
  });

  const filteredList = useMemo(() => staffList.filter((s) => staffMatchesSearch(s, debouncedSearch)), [staffList, debouncedSearch]);
  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageRows = filteredList.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const createMutation = useMutation({
    mutationFn: (payload: AdminCreateStaffPayload) => createAdminStaff(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: staffQueryKey });
      setBanner({ type: 'success', message: 'Staff added successfully.' });
      setModalOpen(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to create staff.';
      setFormErrors((prev) => ({ ...prev, form: message }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUpdateStaffPayload }) => updateAdminStaff(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: staffQueryKey });
      setBanner({ type: 'success', message: 'Staff updated successfully.' });
      setModalOpen(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to update staff.';
      setFormErrors((prev) => ({ ...prev, form: message }));
    },
  });

  const openCreateModal = () => {
    setMode('create');
    setEditingStaff(null);
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      hub: '',
      isActive: true,
      notes: '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (staff: AdminStaffProfile) => {
    setMode('edit');
    setEditingStaff(staff);
    setForm(mapStaffToForm(staff));
    setFormErrors({});
    setModalOpen(true);
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    if (!form.role) return;

    if (mode === 'create') {
      createMutation.mutate({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        hub: form.hub,
        notes: form.notes.trim(),
      });
      return;
    }

    if (!editingStaff) return;
    updateMutation.mutate({
      id: editingStaff.id,
      payload: {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        role: form.role,
        hub: form.hub,
        is_active: form.isActive,
        notes: form.notes.trim(),
      },
    });
  };

  const disableSubmit =
    createMutation.isPending || updateMutation.isPending || Object.keys(validateForm(form)).length > 0 || (mode === 'create' && hubs.length === 0);

  const staffDetailHref = (staffId: string) => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (hubFilter) params.set('hub', hubFilter);
    if (roleFilter) params.set('role', roleFilter);
    if (page > 1) params.set('page', String(page));
    const q = params.toString();
    return q ? `/admin/staff/${staffId}?${q}` : `/admin/staff/${staffId}`;
  };

  const calendarEvents = useMemo(() => {
    const events = selectedStaffCalendar?.events ?? [];
    return events.map((event) => {
      const reason = event.reason;
      const title =
        reason === 'booking'
          ? event.booking_info?.customer_name || 'Booking'
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
          showAssignmentWarning: reason === 'booking' && (!event.booking_info?.driver || !event.booking_info?.helper),
        },
      };
    });
  }, [selectedStaffCalendar]);

  const detailEvents = useMemo<StaffCalendarEventDetails[]>(
    () =>
      calendarEvents.map((e) => ({
        id: e.id,
        title: e.title,
        reason: e.extendedProps.reason as AdminStaffCalendarReason,
        notes: String(e.extendedProps.notes ?? ''),
        start: String(e.extendedProps.originalStart ?? e.start),
        end: String(e.extendedProps.originalEnd ?? e.start),
        bookingId: e.extendedProps.bookingId ? String(e.extendedProps.bookingId) : undefined,
        customerName: e.extendedProps.customerName ? String(e.extendedProps.customerName) : undefined,
        bookingStatus: e.extendedProps.bookingStatus ? String(e.extendedProps.bookingStatus) : undefined,
        driverName: e.extendedProps.driverName ? String(e.extendedProps.driverName) : undefined,
        helperName: e.extendedProps.helperName ? String(e.extendedProps.helperName) : undefined,
        showAssignmentWarning: Boolean(e.extendedProps.showAssignmentWarning),
      })),
    [calendarEvents]
  );

  const monthStart = useMemo(() => startOfMonth(activeMonthStart), [activeMonthStart]);
  const monthEnd = useMemo(() => endOfMonth(activeMonthStart), [activeMonthStart]);
  const bookingCount = useMemo(() => detailEvents.filter((e) => e.reason === 'booking').length, [detailEvents]);
  const bookedDays = useMemo(
    () => collectDaysInWindow(detailEvents, (e) => e.reason === 'booking', monthStart, monthEnd).size,
    [detailEvents, monthStart, monthEnd]
  );
  const daysInMonth = useMemo(() => differenceInCalendarDays(monthEnd, monthStart) + 1, [monthStart, monthEnd]);
  const availableDays = Math.max(daysInMonth - bookedDays, 0);

  const renderEventContent = (arg: EventContentArg) => {
    const reason = String(arg.event.extendedProps.reason || 'other') as AdminStaffCalendarReason;
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
          'group/event h-full min-h-6 w-full border-l-[3px] px-2 py-1 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md',
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

  const onEventClick = (arg: EventClickArg) => {
    const reason = String(arg.event.extendedProps.reason || 'other') as AdminStaffCalendarReason;
    const bookingId = arg.event.extendedProps.bookingId ? String(arg.event.extendedProps.bookingId) : undefined;
    setSelectedCalendarEvent({
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
    });
  };

  const onEventMouseEnter = (arg: EventHoveringArg) => {
    const reason = String(arg.event.extendedProps.reason || 'other') as AdminStaffCalendarReason;
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

  return (
    <>
      <AdminPageHeader
        title="Staff Management"
        description="Manage staff across hubs and roles"
        actions={
          <Button type="button" onClick={openCreateModal} disabled={hubs.length === 0 || isHubsPending}>
            + Add Staff
          </Button>
        }
      />

      {hubs.length === 0 && !isHubsPending ? (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          No hubs available. Create at least one hub before adding staff.
        </div>
      ) : null}

      {banner ? (
        <div
          className={cn(
            'mb-4 rounded-xl border px-4 py-3 text-sm',
            banner.type === 'success' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-destructive/30 bg-destructive/10 text-destructive'
          )}
        >
          {banner.message}
        </div>
      ) : null}

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_200px_auto]">
          <div>
            <label htmlFor="staff-search" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="staff-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone"
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none ring-primary/20 placeholder:text-muted-foreground focus:ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="staff-hub-filter" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hub
            </label>
            <select
              id="staff-hub-filter"
              value={hubFilter}
              onChange={(e) => setHubFilter(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring"
            >
              <option value="">All Hubs</option>
              {hubs.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="staff-role-filter" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Role
            </label>
            <select
              id="staff-role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter((e.target.value as AdminStaffRole) || '')}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring"
            >
              <option value="">All Roles</option>
              <option value="driver">Driver</option>
              <option value="helper">Helper</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button type="button" variant="outline" className="w-full lg:w-auto" onClick={() => void refetchStaff()} disabled={isStaffFetching}>
              <RefreshCw className={cn('mr-1 size-4', isStaffFetching && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {isStaffPending ? (
        <div className="space-y-2" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : null}

      {isStaffError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center">
          <p className="text-sm font-medium text-destructive">{staffError instanceof Error ? staffError.message : 'Failed to load staff'}</p>
          <Button type="button" variant="outline" size="sm" className="mt-4 gap-2" onClick={() => void refetchStaff()} disabled={isStaffFetching}>
            <RefreshCw className={cn('size-3.5', isStaffFetching && 'animate-spin')} aria-hidden />
            Retry
          </Button>
        </div>
      ) : null}

      {!isStaffPending && !isStaffError && filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <Users className="mb-3 size-10 text-muted-foreground/60" aria-hidden />
          <p className="font-medium text-foreground">No staff found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Try clearing filters or broadening your search criteria.</p>
          {(debouncedSearch || hubFilter || roleFilter) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setDebouncedSearch('');
                setHubFilter('');
                setRoleFilter('');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : null}

      {!isStaffPending && !isStaffError && filteredList.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-3 py-3 font-semibold text-foreground">Name</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Email</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Phone</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Role</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Hub</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Status</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Created At</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'cursor-pointer border-b border-border/80 last:border-0 hover:bg-muted/20',
                      selectedStaffId === row.id && 'bg-primary/10'
                    )}
                    onClick={() => router.push(staffDetailHref(row.id))}
                  >
                    <td className="px-3 py-3 font-medium">{row.user.name || `${row.user.first_name} ${row.user.last_name}`.trim()}</td>
                    <td className="px-3 py-3 text-muted-foreground">{row.user.email || '—'}</td>
                    <td className="px-3 py-3 text-muted-foreground">{row.user.phone || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize', roleBadgeClass(row.role))}>
                        {row.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{row.hub_name || '—'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          'inline-flex min-w-20 justify-center rounded-md px-2 py-1 text-xs font-semibold',
                          row.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{formatDate(row.created_at)}</td>
                    <td className="px-3 py-3">
                      <Button type="button" variant="outline" size="xs" onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(row);
                      }}>
                        <Pencil className="mr-1 size-3.5" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {pageRows.map((row) => (
              <div
                key={row.id}
                className={cn('rounded-xl border border-border bg-card p-4', selectedStaffId === row.id && 'border-primary/50')}
                role="button"
                tabIndex={0}
                onClick={() => router.push(staffDetailHref(row.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') router.push(staffDetailHref(row.id));
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{row.user.name || `${row.user.first_name} ${row.user.last_name}`.trim()}</p>
                    <p className="text-sm text-muted-foreground">{row.user.email || '—'}</p>
                    <p className="text-sm text-muted-foreground">{row.user.phone || '—'}</p>
                  </div>
                  <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize', roleBadgeClass(row.role))}>{row.role}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{row.hub_name || '—'}</p>
                  <span
                    className={cn(
                      'inline-flex min-w-20 justify-center rounded-md px-2 py-1 text-xs font-semibold',
                      row.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {row.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button type="button" variant="outline" size="xs" onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(row);
                  }}>
                    <Pencil className="mr-1 size-3.5" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{startIndex + 1}</span>-
              <span className="font-medium text-foreground">{Math.min(startIndex + PAGE_SIZE, filteredList.length)}</span> of{' '}
              <span className="font-medium text-foreground">{filteredList.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}

      {selectedStaff ? (
        <section className="mt-8 space-y-6">
          <AdminPageHeader
            title={`Staff Calendar - ${selectedStaff.user.name || `${selectedStaff.user.first_name} ${selectedStaff.user.last_name}`.trim() || 'Staff'}`}
            description={[selectedStaff.user.phone, selectedStaff.hub_name, format(activeMonthStart, 'MMMM yyyy')].filter(Boolean).join(' · ')}
            actions={
              <div className="flex items-center gap-2">
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
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedStaffId('')}>
                  Close details
                </Button>
              </div>
            }
          />

          <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border/80 bg-background/30 p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total events</p>
                <p className="mt-1 text-2xl font-bold text-blue-300">{detailEvents.length}</p>
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
                Role: <span className="font-semibold capitalize text-foreground">{selectedStaff.role}</span>
              </p>
              <p className="text-muted-foreground">
                Status:{' '}
                <span className={cn('font-semibold', selectedStaff.is_active ? 'text-emerald-300' : 'text-zinc-300')}>
                  {selectedStaff.is_active ? 'Active' : 'Inactive'}
                </span>
              </p>
              <p className="text-muted-foreground">
                Bookings this month: <span className="font-semibold text-blue-300">{bookingCount}</span>
              </p>
            </div>
          </section>

          {isCalendarPending ? (
            <div className="h-[620px] animate-pulse rounded-xl border border-border bg-muted/30" aria-hidden />
          ) : null}

          {isCalendarError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center">
              <p className="text-sm font-medium text-destructive">{calendarError instanceof Error ? calendarError.message : 'Failed to load staff calendar'}</p>
              <Button type="button" variant="outline" size="sm" className="mt-4 gap-2" onClick={() => void refetchCalendar()} disabled={isCalendarFetching}>
                <RefreshCw className={cn('size-3.5', isCalendarFetching && 'animate-spin')} aria-hidden />
                Retry
              </Button>
            </div>
          ) : null}

          {!isCalendarPending && !isCalendarError ? (
            <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden />
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
                  <AlertCircle className="mb-3 size-8 text-muted-foreground/60" aria-hidden />
                  <p className="font-medium text-foreground">No events for this month</p>
                  <p className="mt-1 text-sm text-muted-foreground">No blockouts were returned for this staff member in the selected month.</p>
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
        </section>
      ) : !isStaffPending && !isStaffError && filteredList.length > 0 ? (
        <section className="mt-8 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <Users className="mx-auto mb-3 size-8 text-muted-foreground/60" aria-hidden />
          <p className="font-medium text-foreground">Select a staff member to view details and calendar</p>
          <p className="mt-1 text-sm text-muted-foreground">Use row click from the list above. Edit remains a separate action.</p>
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
          {hoverTooltip.notes ? <p className="mt-1 line-clamp-2 text-muted-foreground">{hoverTooltip.notes}</p> : null}
        </div>
      ) : null}

      {selectedCalendarEvent ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedCalendarEvent(null)}
            aria-label="Close details modal"
          />
          <section className="relative z-[131] w-full max-w-lg rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{reasonToLabel(selectedCalendarEvent.reason)}</p>
                <h3 className="mt-1 text-lg font-semibold">{selectedCalendarEvent.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{formatDateRangeText(selectedCalendarEvent.start, selectedCalendarEvent.end)}</p>
              </div>
              <Button type="button" variant="ghost" size="xs" onClick={() => setSelectedCalendarEvent(null)}>
                Close
              </Button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason</dt>
                <dd>{reasonToLabel(selectedCalendarEvent.reason)}</dd>
              </div>
              {selectedCalendarEvent.customerName ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</dt>
                  <dd>
                    {selectedCalendarEvent.showAssignmentWarning ? <AlertTriangle className="mr-1 inline size-3.5 text-amber-300" aria-label="Assignment missing warning" /> : null}
                    {selectedCalendarEvent.customerName}
                  </dd>
                </div>
              ) : null}
              {selectedCalendarEvent.bookingStatus ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking status</dt>
                  <dd className="capitalize">{selectedCalendarEvent.bookingStatus}</dd>
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Driver</dt>
                  <dd>{selectedCalendarEvent.driverName || 'Unassigned'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Helper</dt>
                  <dd>{selectedCalendarEvent.helperName || 'Unassigned'}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</dt>
                <dd className="text-muted-foreground">{selectedCalendarEvent.notes || 'No notes provided'}</dd>
              </div>
            </dl>
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

      {modalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-semibold tracking-tight">{mode === 'create' ? 'Add Staff' : 'Edit Staff'}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mode === 'create' ? 'Create a new staff profile for this admin workspace.' : 'Update staff details and assignment settings.'}
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </div>

            <form onSubmit={submitForm} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring"
                    placeholder="Enter first name"
                  />
                  {formErrors.firstName ? <p className="mt-1 text-xs text-destructive">{formErrors.firstName}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring"
                    placeholder="Enter last name (optional)"
                  />
                  {formErrors.lastName ? <p className="mt-1 text-xs text-destructive">{formErrors.lastName}</p> : null}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring"
                    placeholder="name@company.com"
                  />
                  {formErrors.email ? <p className="mt-1 text-xs text-destructive">{formErrors.email}</p> : null}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value.replace(/[^\d]/g, '') }))}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring"
                    placeholder="10-digit phone"
                    maxLength={10}
                  />
                  {formErrors.phone ? <p className="mt-1 text-xs text-destructive">{formErrors.phone}</p> : null}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((prev) => ({ ...prev, role: (e.target.value as AdminStaffRole) || '' }))}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring"
                  >
                    <option value="">Select role</option>
                    <option value="driver">Driver</option>
                    <option value="helper">Helper</option>
                  </select>
                  {formErrors.role ? <p className="mt-1 text-xs text-destructive">{formErrors.role}</p> : null}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hub</label>
                  <select
                    value={form.hub}
                    onChange={(e) => setForm((prev) => ({ ...prev, hub: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring"
                  >
                    <option value="">Select hub</option>
                    {hubs.map((hub) => (
                      <option key={hub.id} value={hub.id}>
                        {hub.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.hub ? <p className="mt-1 text-xs text-destructive">{formErrors.hub}</p> : null}
                </div>

                {mode === 'edit' ? (
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                    <select
                      value={form.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value === 'active' }))}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                ) : null}

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    className="min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/20 focus:ring"
                    placeholder="Add context about this staff member"
                  />
                </div>
              </div>

              {formErrors.form ? <p className="text-sm text-destructive">{formErrors.form}</p> : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={disableSubmit}>
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : mode === 'create' ? 'Add Staff' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
