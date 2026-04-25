'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, Users, Pencil } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  adminQueryKeys,
  createAdminStaff,
  listAdminHubs,
  listAdminStaff,
  updateAdminStaff,
} from '@/services/admin.service';
import type { AdminCreateStaffPayload, AdminStaffProfile, AdminStaffRole, AdminUpdateStaffPayload } from '@/types/admin';

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

function validateForm(values: StaffFormState, mode: 'create' | 'edit'): StaffFormErrors {
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

  const initialHub = searchParams.get('hub') ?? '';
  const initialRole = searchParams.get('role') === 'helper' ? 'helper' : searchParams.get('role') === 'driver' ? 'driver' : '';
  const initialSearch = searchParams.get('search') ?? '';
  const initialPage = Number(searchParams.get('page') ?? '1') || 1;

  const [hubFilter, setHubFilter] = useState(initialHub);
  const [roleFilter, setRoleFilter] = useState<'' | AdminStaffRole>(initialRole);
  const [page, setPage] = useState(Math.max(1, initialPage));

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
    const errors = validateForm(form, mode);
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
    createMutation.isPending || updateMutation.isPending || Object.keys(validateForm(form, mode)).length > 0 || (mode === 'create' && hubs.length === 0);

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
                  <tr key={row.id} className="border-b border-border/80 last:border-0 hover:bg-muted/20">
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
                      <Button type="button" variant="outline" size="xs" onClick={() => openEditModal(row)}>
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
              <div key={row.id} className="rounded-xl border border-border bg-card p-4">
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
                  <Button type="button" variant="outline" size="xs" onClick={() => openEditModal(row)}>
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
