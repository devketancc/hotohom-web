'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { extractAssignmentConflicts, sortStaffForHub } from '@/lib/adminAssignmentUi';
import { handleApiError } from '@/lib/errorHandler';
import { useAssignAdminBookingStaff } from '@/hooks/useAssignAdminBookingStaff';
import { adminQueryKeys, listAdminStaff } from '@/services/admin.service';
import type { AdminRosterBooking, AssignmentConflictIssue } from '@/types/admin';

const KEEP = 'keep';

function StaffPicker({
  label,
  role,
  value,
  onChange,
  hubName,
  currentName,
}: {
  label: string;
  role: 'driver' | 'helper';
  value: string;
  onChange: (v: string) => void;
  hubName: string;
  currentName: string | null;
}) {
  const { data: staff = [], isPending } = useQuery({
    queryKey: adminQueryKeys.staff({ role }),
    queryFn: () => listAdminStaff({ role }),
    staleTime: 2 * 60 * 1000,
  });

  const sorted = useMemo(() => sortStaffForHub(staff, hubName), [staff, hubName]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value || KEEP} onValueChange={(v) => onChange(!v || v === KEEP ? '' : v)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={KEEP}>
            {currentName ? `Keep current (${currentName})` : 'No change'}
          </SelectItem>
          {sorted.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.user.name} · {s.hub_name}
              {s.is_active ? '' : ' (inactive)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending ? <p className="text-xs text-muted-foreground">Loading {role}s…</p> : null}
    </div>
  );
}

export function AssignStaffSheet({
  open,
  onOpenChange,
  booking,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: AdminRosterBooking;
}) {
  const [driverId, setDriverId] = useState('');
  const [helperId, setHelperId] = useState('');
  const [conflicts, setConflicts] = useState<AssignmentConflictIssue[] | null>(null);
  const [confirmOverrideOpen, setConfirmOverrideOpen] = useState(false);

  const { assign, isAssigning } = useAssignAdminBookingStaff(booking.booking_id);

  useEffect(() => {
    if (open) {
      setDriverId('');
      setHelperId('');
      setConflicts(null);
      setConfirmOverrideOpen(false);
    }
  }, [open, booking.booking_id]);

  const hubName = booking.caravan.hub ?? '';
  const hasSelection = Boolean(driverId || helperId);

  const buildPayload = (override: boolean) => ({
    ...(driverId ? { driver_id: driverId } : {}),
    ...(helperId ? { helper_id: helperId } : {}),
    ...(override ? { override: true } : {}),
  });

  const submit = async (override: boolean) => {
    try {
      await assign(buildPayload(override));
      setConfirmOverrideOpen(false);
      onOpenChange(false);
    } catch (err) {
      setConfirmOverrideOpen(false);
      const issues = extractAssignmentConflicts(err);
      if (issues) {
        setConflicts(issues);
      } else {
        toast.error(handleApiError(err));
      }
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full p-4 sm:p-5">
          <SheetHeader className="p-0">
            <SheetTitle>Assign staff</SheetTitle>
            <SheetDescription>
              {booking.customer_name} · {booking.caravan.registration}
              {hubName ? ` · ${hubName}` : ''}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-2 space-y-4">
            <StaffPicker
              label="Driver"
              role="driver"
              value={driverId}
              onChange={(v) => {
                setDriverId(v);
                setConflicts(null);
              }}
              hubName={hubName}
              currentName={booking.driver?.name ?? null}
            />
            <StaffPicker
              label="Helper"
              role="helper"
              value={helperId}
              onChange={(v) => {
                setHelperId(v);
                setConflicts(null);
              }}
              hubName={hubName}
              currentName={booking.helper?.name ?? null}
            />

            {conflicts && conflicts.length > 0 ? (
              <div className="space-y-2 rounded-lg border border-amber-500/35 bg-amber-950/20 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-200">
                  <AlertTriangle className="size-3.5" aria-hidden />
                  Assignment blocked by conflicts
                </p>
                <ul className="space-y-1 text-xs text-amber-100/90">
                  {conflicts.map((issue) => (
                    <li key={issue.code}>{issue.message}</li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isAssigning}
                  onClick={() => setConfirmOverrideOpen(true)}
                >
                  Assign anyway
                </Button>
              </div>
            ) : null}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={isAssigning}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isAssigning || !hasSelection}
                onClick={() => void submit(false)}
              >
                {isAssigning ? 'Assigning…' : 'Assign'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmOverrideOpen} onOpenChange={setConfirmOverrideOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Force assignment?</DialogTitle>
            <DialogDescription>
              This assigns the selected staff despite {conflicts?.length ?? 0} conflict
              {(conflicts?.length ?? 0) === 1 ? '' : 's'} listed. Existing blockouts will be rotated
              automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isAssigning}
              onClick={() => setConfirmOverrideOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={isAssigning} onClick={() => void submit(true)}>
              {isAssigning ? 'Assigning…' : 'Assign anyway'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
