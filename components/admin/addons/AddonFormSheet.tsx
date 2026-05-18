'use client';

import type { UseMutationResult } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AddonForm } from '@/components/admin/addons/AddonForm';
import { cn } from '@/lib/utils';
import type { AdminAddon, AdminAddonWritePayload } from '@/types/adminAddon';

export function AddonFormSheet({
  open,
  onOpenChange,
  mode,
  addon,
  createMutation,
  updateMutation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  addon: AdminAddon | null;
  createMutation: UseMutationResult<AdminAddon, Error, AdminAddonWritePayload>;
  updateMutation: UseMutationResult<
    AdminAddon,
    Error,
    { id: string; payload: Partial<AdminAddonWritePayload> }
  >;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className={cn(
          'w-full gap-0 overflow-y-auto border-l border-border bg-popover p-0 sm:max-w-xl md:max-w-2xl',
          'data-[side=right]:sm:max-w-xl'
        )}
      >
        <SheetHeader className="border-b border-border/80 bg-muted/20 px-5 py-4">
          <SheetTitle className="font-heading text-lg">
            {mode === 'create' ? 'Create add-on' : `Edit ${addon?.name ?? 'add-on'}`}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Define pricing, category, and which caravan classes can purchase this extra.'
              : 'Update catalog details. Changes apply to new carts immediately.'}
          </SheetDescription>
        </SheetHeader>
        <div className="px-5 py-4">
          <AddonForm
            mode={mode}
            addonId={addon?.id}
            addon={addon}
            createMutation={createMutation}
            updateMutation={updateMutation}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
