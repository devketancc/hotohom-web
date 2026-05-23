'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { CouponDeleteDialog } from '@/components/admin/coupons/CouponDeleteDialog';
import { CouponFormSheet } from '@/components/admin/coupons/CouponFormSheet';
import type { CouponActiveFilter } from '@/components/admin/coupons/CouponsFilters';
import { CouponsFilters } from '@/components/admin/coupons/CouponsFilters';
import { CouponsHeader } from '@/components/admin/coupons/CouponsHeader';
import { CouponsList } from '@/components/admin/coupons/CouponsList';
import { useCouponMutations } from '@/hooks/useCouponMutations';
import { useCoupons } from '@/hooks/useCoupons';
import { adminQueryKeys, listAdminCaravanClasses } from '@/services/admin.service';
import { listAdminCouponLocationOptions } from '@/services/coupon.service';
import type { AdminCoupon } from '@/types/coupon';

const PAGE_SIZE = 20;

export default function AdminCouponsPage() {
  const [activeFilter, setActiveFilter] = useState<CouponActiveFilter>('active');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create');
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCoupon | null>(null);

  const isActiveFilter = activeFilter === 'active';

  const listQuery = useCoupons({
    isActiveFilter: isActiveFilter,
    codeSearch: search,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data, isPending, isError, error, isFetching } = listQuery;
  const coupons = data?.results ?? [];
  const total = data?.count ?? 0;
  const showSkeleton = isPending && !data;

  const { createMutation, updateMutation, deleteMutation, toggleActiveMutation } = useCouponMutations();

  const { data: classes = [] } = useQuery({
    queryKey: adminQueryKeys.caravanClasses,
    queryFn: listAdminCaravanClasses,
    staleTime: 600_000,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['admin', 'coupon-dest-options'],
    queryFn: listAdminCouponLocationOptions,
    staleTime: 600_000,
  });

  const classNameByCode = useMemo(() => Object.fromEntries(classes.map((c) => [c.code, c.name])), [classes]);
  const locationNameById = useMemo(() => Object.fromEntries(locations.map((l) => [l.id, l.name])), [locations]);

  const openCreate = () => {
    setEditingCoupon(null);
    setSheetMode('create');
    setSheetOpen(true);
  };

  const openEdit = (c: AdminCoupon) => {
    setEditingCoupon(c);
    setSheetMode('edit');
    setSheetOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleToggleActive = (c: AdminCoupon, next: boolean) => {
    if (c.is_active === next) return;
    toggleActiveMutation.mutate({ id: c.id, is_active: next });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // toast handled in mutation
    }
  };

  return (
    <>
      <CouponsHeader onCreate={openCreate} />

      <CouponsFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        activeFilter={activeFilter}
        onActiveFilterChange={(v) => {
          setActiveFilter(v);
          setPage(1);
        }}
        total={total}
        isFetching={isFetching && !showSkeleton}
        className="mb-6"
      />

      <CouponsList
        coupons={coupons}
        isLoading={showSkeleton}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        expandedId={expandedId}
        onToggleExpand={toggleExpand}
        onEdit={openEdit}
        onDelete={(c) => setDeleteTarget(c)}
        onToggleActive={handleToggleActive}
        togglingCouponId={toggleActiveMutation.isPending ? toggleActiveMutation.variables?.id ?? null : null}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        onCreate={openCreate}
        classNameByCode={classNameByCode}
        locationNameById={locationNameById}
      />

      <CouponFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        coupon={sheetMode === 'edit' ? editingCoupon : null}
        createMutation={createMutation}
        updateMutation={updateMutation}
      />

      <CouponDeleteDialog
        coupon={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
