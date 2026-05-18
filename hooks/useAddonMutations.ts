import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createAdminAddon, deleteAdminAddon, updateAdminAddon } from '@/services/addonAdmin.service';
import type { AdminAddonWritePayload } from '@/types/adminAddon';

export function useAddonMutations() {
  const qc = useQueryClient();

  const invalidateAddons = () =>
    qc.invalidateQueries({
      queryKey: ['admin', 'addons'],
    });

  const createMutation = useMutation({
    mutationFn: (payload: AdminAddonWritePayload) => createAdminAddon(payload),
    onSuccess: () => {
      toast.success('Add-on created');
      void invalidateAddons();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminAddonWritePayload> }) =>
      updateAdminAddon(id, payload),
    onSuccess: () => {
      toast.success('Add-on updated');
      void invalidateAddons();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminAddon(id),
    onSuccess: () => {
      toast.success('Add-on deleted');
      void invalidateAddons();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to delete add-on';
      toast.error(msg);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => updateAdminAddon(id, { is_active }),
    onSuccess: (_data, { is_active }) => {
      toast.success(is_active ? 'Add-on activated' : 'Add-on deactivated');
      void invalidateAddons();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Could not update status';
      toast.error(msg);
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleActiveMutation,
    invalidateAddons,
  };
}
