'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { AddonDeleteDialog } from '@/components/admin/addons/AddonDeleteDialog';
import { AddonFormSheet } from '@/components/admin/addons/AddonFormSheet';
import type { AddonActiveFilter } from '@/components/admin/addons/AddonsFilters';
import { AddonsFilters } from '@/components/admin/addons/AddonsFilters';
import { AddonsHeader } from '@/components/admin/addons/AddonsHeader';
import { AddonsList } from '@/components/admin/addons/AddonsList';
import { useAddonMutations } from '@/hooks/useAddonMutations';
import { useAdminAddons } from '@/hooks/useAdminAddons';
import { adminQueryKeys, listAdminCaravanClasses } from '@/services/admin.service';
import type { AdminAddon } from '@/types/adminAddon';

const PAGE_SIZE = 20;

export default function AdminAddonsPage() {
  const [activeFilter, setActiveFilter] = useState<AddonActiveFilter>('active');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create');
  const [editingAddon, setEditingAddon] = useState<AdminAddon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAddon | null>(null);

  const isActiveFilter = activeFilter === 'active';

  const listQuery = useAdminAddons({
    isActiveFilter,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data, isPending, isError, error, isFetching } = listQuery;
  const addons = data?.results ?? [];
  const total = data?.count ?? 0;
  const showSkeleton = isPending && !data;

  const { createMutation, updateMutation, deleteMutation, toggleActiveMutation } = useAddonMutations();

  const { data: classes = [] } = useQuery({
    queryKey: adminQueryKeys.caravanClasses,
    queryFn: listAdminCaravanClasses,
    staleTime: 600_000,
  });

  const classNameByCode = useMemo(() => Object.fromEntries(classes.map((c) => [c.code, c.name])), [classes]);

  const openCreate = () => {
    setEditingAddon(null);
    setSheetMode('create');
    setSheetOpen(true);
  };

  const openEdit = (a: AdminAddon) => {
    setEditingAddon(a);
    setSheetMode('edit');
    setSheetOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleToggleActive = (a: AdminAddon, next: boolean) => {
    if (a.is_active === next) return;
    toggleActiveMutation.mutate({ id: a.id, is_active: next });
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
      <AddonsHeader onCreate={openCreate} />

      <AddonsFilters
        activeFilter={activeFilter}
        onActiveFilterChange={(v) => {
          setActiveFilter(v);
          setPage(1);
        }}
        total={total}
        isFetching={isFetching && !showSkeleton}
        className="mb-6"
      />

      <AddonsList
        addons={addons}
        isLoading={showSkeleton}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        expandedId={expandedId}
        onToggleExpand={toggleExpand}
        onEdit={openEdit}
        onDelete={(a) => setDeleteTarget(a)}
        onToggleActive={handleToggleActive}
        togglingAddonId={toggleActiveMutation.isPending ? toggleActiveMutation.variables?.id ?? null : null}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        onCreate={openCreate}
        classNameByCode={classNameByCode}
      />

      <AddonFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        addon={sheetMode === 'edit' ? editingAddon : null}
        createMutation={createMutation}
        updateMutation={updateMutation}
      />

      <AddonDeleteDialog
        addon={deleteTarget}
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
