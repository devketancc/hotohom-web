'use client';

import { AlertCircle } from 'lucide-react';
import { AddonCard } from '@/components/admin/addons/AddonCard';
import { AddonsEmptyState } from '@/components/admin/addons/AddonsEmptyState';
import { AddonsPagination } from '@/components/admin/addons/AddonsPagination';
import { AddonsSkeletons } from '@/components/admin/addons/AddonsSkeletons';
import type { AdminAddon } from '@/types/adminAddon';

export function AddonsList({
  addons,
  isLoading,
  isError,
  errorMessage,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  togglingAddonId,
  page,
  pageSize,
  total,
  onPageChange,
  onCreate,
  classNameByCode,
}: {
  addons: AdminAddon[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onEdit: (addon: AdminAddon) => void;
  onDelete: (addon: AdminAddon) => void;
  onToggleActive: (addon: AdminAddon, next: boolean) => void;
  togglingAddonId: string | null;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onCreate: () => void;
  classNameByCode?: Record<string, string>;
}) {
  if (isLoading && !addons.length) {
    return <AddonsSkeletons />;
  }

  if (isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="font-medium">Could not load add-ons</p>
          <p className="mt-1 text-destructive/90">{errorMessage ?? 'Something went wrong. Try again.'}</p>
        </div>
      </div>
    );
  }

  if (!addons.length) {
    return <AddonsEmptyState onCreate={onCreate} />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {addons.map((a) => (
          <AddonCard
            key={a.id}
            addon={a}
            expanded={expandedId === a.id}
            onToggleExpand={() => onToggleExpand(a.id)}
            onEdit={() => onEdit(a)}
            onDelete={() => onDelete(a)}
            onToggleActive={(next) => onToggleActive(a, next)}
            togglingActive={togglingAddonId === a.id}
            classNameByCode={classNameByCode}
          />
        ))}
      </div>
      {total > pageSize ? (
        <AddonsPagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
      ) : null}
    </div>
  );
}
