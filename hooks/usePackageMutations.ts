import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createAdminPackage,
  deactivateAdminPackage,
  packageAdminQueryKeys,
  updateAdminPackage,
} from '@/services/packageAdmin.service';
import type { AdminPackageWritePayload } from '@/types/adminPackage';

export function usePackageMutations() {
  const qc = useQueryClient();

  const invalidatePackages = () =>
    qc.invalidateQueries({
      queryKey: ['admin', 'packages'],
    });

  const createMutation = useMutation({
    mutationFn: (payload: AdminPackageWritePayload) => createAdminPackage(payload),
    onSuccess: () => {
      toast.success('Package created');
      void invalidatePackages();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminPackageWritePayload }) =>
      updateAdminPackage(id, payload),
    onSuccess: (_data, { id }) => {
      toast.success('Package saved');
      void invalidatePackages();
      void qc.invalidateQueries({ queryKey: packageAdminQueryKeys.detail(id) });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateAdminPackage(id),
    onSuccess: () => {
      toast.success('Package deactivated');
      void invalidatePackages();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to deactivate package';
      toast.error(msg);
    },
  });

  return {
    createMutation,
    updateMutation,
    deactivateMutation,
    invalidatePackages,
  };
}
