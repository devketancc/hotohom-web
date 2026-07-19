'use client';

import { useState } from 'react';
import { CheckCircle2, Copy, Loader2, ReceiptText, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SettlementRefundDialog } from '@/components/admin/booking/SettlementRefundDialog';
import { DetailRow, MoneyLine } from '@/components/booking/BookingDetailAtoms';
import { useAdminSettlementActions } from '@/hooks/useAdminSettlementActions';
import { useAdminTripSettlement } from '@/hooks/useAdminTripSettlement';
import {
  canCreateBalanceLink,
  canRefund,
  canViewSettlement,
  settlementActionsEnabled,
  shouldShowSettlementPanel,
} from '@/lib/adminSettlementUi';
import { formatInr } from '@/utils/format';
import type { AdminBalanceLinkResult, AdminBookingDetail } from '@/types/admin';

function parseMoney(s: string): number {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export function AdminSettlementPanel({
  booking,
  userRole,
}: {
  booking: AdminBookingDetail;
  userRole: string | undefined;
}) {
  const trip = booking.trip;
  const tripId = trip?.id ?? '';

  const [linkConfirmOpen, setLinkConfirmOpen] = useState(false);
  const [linkResult, setLinkResult] = useState<AdminBalanceLinkResult | null>(null);
  const [depositRefundOpen, setDepositRefundOpen] = useState(false);
  const [advanceRefundOpen, setAdvanceRefundOpen] = useState(false);

  const showPanel = Boolean(trip) && shouldShowSettlementPanel(trip) && canViewSettlement(userRole);
  const actionsEnabled = settlementActionsEnabled(trip);

  const { data: settlement, isPending, isError, error, refetch } = useAdminTripSettlement(
    tripId,
    showPanel
  );

  const {
    createBalanceLink,
    refundDeposit,
    refundAdvance,
    isCreatingLink,
    isRefundingDeposit,
    isRefundingAdvance,
    isBusy,
  } = useAdminSettlementActions(booking.id, tripId);

  if (!showPanel) return null;

  const isKmMode = settlement?.pricing_mode === 'km';
  const depositRefundAmount = settlement?.refund_breakdown
    ? parseMoney(settlement.refund_breakdown.deposit_refund)
    : 0;
  const advanceRefundAmount = settlement?.refund_breakdown
    ? parseMoney(settlement.refund_breakdown.advance_refund)
    : 0;

  const showBalanceLinkAction =
    actionsEnabled && settlement?.settlement === 'balance_due' && canCreateBalanceLink(userRole);
  const showDepositRefundAction =
    actionsEnabled && settlement?.settlement === 'refund' && canRefund(userRole) && depositRefundAmount > 0;
  const showAdvanceRefundAction =
    actionsEnabled &&
    settlement?.settlement === 'refund' &&
    canRefund(userRole) &&
    Boolean(settlement.advance_payment_id) &&
    advanceRefundAmount > 0;

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy the link');
    }
  };

  return (
    <>
      <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm md:p-5">
        <h2 className="text-sm font-bold tracking-tight">Settlement</h2>

        {isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading settlement…
          </div>
        ) : null}

        {isError ? (
          <div className="space-y-2 rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-200">
            <p>{error instanceof Error ? error.message : 'Failed to load settlement.'}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : null}

        {settlement ? (
          <>
            <div className="space-y-1.5">
              <DetailRow label="Pricing mode" value={settlement.pricing_mode.toUpperCase()} />
              {isKmMode ? (
                <>
                  <DetailRow label="Buffered KM" value={settlement.buffered_km} />
                  <DetailRow label="Actual KM" value={settlement.actual_km} />
                  <DetailRow label="KM rate" value={`₹${formatInr(settlement.km_rate)}`} />
                </>
              ) : null}
            </div>

            <div className="space-y-1 rounded-lg border border-border/80 bg-muted/10 p-3">
              <MoneyLine label="EOT extras" amount={settlement.eot_extras} />
              <MoneyLine label="KM credit" amount={settlement.km_credit} negative />
              <MoneyLine label="Net charges" amount={settlement.net_charges} />
              <MoneyLine label="Deposit held" amount={settlement.deposit_held} negative />
              <MoneyLine
                label="Final net"
                amount={String(Math.abs(parseMoney(settlement.final_net)))}
                negative={settlement.settlement === 'refund'}
                emphasize
              />
            </div>

            {settlement.settlement === 'balance_due' ? (
              <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-3">
                <ReceiptText className="mt-0.5 size-5 shrink-0 text-amber-300" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-100">
                    Balance due ₹{formatInr(settlement.balance_due ?? settlement.final_net)}
                  </p>
                  {settlement.next_step ? (
                    <p className="mt-1 text-sm text-amber-100/80">{settlement.next_step}</p>
                  ) : null}
                </div>
              </div>
            ) : settlement.settlement === 'refund' ? (
              <div className="flex gap-3 rounded-lg border border-blue-500/30 bg-blue-950/25 px-4 py-3">
                <Wallet className="mt-0.5 size-5 shrink-0 text-blue-300" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-blue-100">Customer is owed a refund</p>
                  {settlement.refund_breakdown ? (
                    <div className="mt-2 space-y-1">
                      <MoneyLine label="Deposit refund" amount={settlement.refund_breakdown.deposit_refund} />
                      <MoneyLine label="Advance refund" amount={settlement.refund_breakdown.advance_refund} />
                      <MoneyLine
                        label="Total refund"
                        amount={settlement.refund_breakdown.total_refund}
                        emphasize
                      />
                    </div>
                  ) : null}
                  {settlement.next_steps.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-xs text-blue-100/70">
                      {settlement.next_steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                Settled — nothing due
                {settlement.next_step ? (
                  <span className="text-emerald-200/80">· {settlement.next_step}</span>
                ) : null}
              </div>
            )}

            {!actionsEnabled ? (
              <p className="text-xs text-muted-foreground">
                Approve EOT to enable settlement actions.
              </p>
            ) : null}

            {showBalanceLinkAction || showDepositRefundAction || showAdvanceRefundAction ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {showBalanceLinkAction ? (
                  <Button type="button" disabled={isBusy} onClick={() => setLinkConfirmOpen(true)}>
                    Create balance payment link
                  </Button>
                ) : null}
                {showDepositRefundAction ? (
                  <Button
                    type="button"
                    variant={showBalanceLinkAction ? 'outline' : 'default'}
                    disabled={isBusy}
                    onClick={() => setDepositRefundOpen(true)}
                  >
                    Refund deposit ₹{formatInr(depositRefundAmount)}
                  </Button>
                ) : null}
                {showAdvanceRefundAction ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => setAdvanceRefundOpen(true)}
                  >
                    Refund advance ₹{formatInr(advanceRefundAmount)}
                  </Button>
                ) : null}
              </div>
            ) : null}

            {linkResult?.paymentUrl ? (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/80 bg-muted/10 px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{linkResult.paymentUrl}</span>
                {linkResult.alreadyExists ? (
                  <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    already exists
                  </span>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopyLink(linkResult.paymentUrl!)}
                >
                  <Copy className="size-3.5" aria-hidden />
                  Copy
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      <Dialog open={linkConfirmOpen} onOpenChange={setLinkConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create balance payment link?</DialogTitle>
            <DialogDescription>
              Creates a Razorpay payment link for{' '}
              <span className="font-semibold text-foreground">
                ₹{formatInr(settlement?.balance_due ?? '0')}
              </span>{' '}
              to share with the customer. Safe to run again — an existing pending link is reused.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isCreatingLink}
              onClick={() => setLinkConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isCreatingLink}
              onClick={() => {
                void createBalanceLink()
                  .then((result) => {
                    setLinkResult(result);
                    setLinkConfirmOpen(false);
                  })
                  .catch(() => {
                    // toast from mutation
                  });
              }}
            >
              {isCreatingLink ? 'Creating…' : 'Create link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {settlement ? (
        <>
          <SettlementRefundDialog
            open={depositRefundOpen}
            onOpenChange={setDepositRefundOpen}
            title="Refund deposit"
            description="Refunds part or all of the held security deposit to the customer."
            defaultAmount={settlement.refund_breakdown?.deposit_refund ?? '0.00'}
            maxAmount={parseMoney(settlement.deposit_held)}
            pending={isRefundingDeposit}
            onConfirm={(payload) => refundDeposit(payload)}
          />
          <SettlementRefundDialog
            open={advanceRefundOpen}
            onOpenChange={setAdvanceRefundOpen}
            title="Refund advance payment"
            description="Initiates a partial Razorpay refund on the customer's captured advance payment."
            defaultAmount={settlement.refund_breakdown?.advance_refund ?? '0.00'}
            maxAmount={advanceRefundAmount}
            pending={isRefundingAdvance}
            onConfirm={(payload) =>
              refundAdvance({ paymentId: settlement.advance_payment_id ?? '', ...payload })
            }
          />
        </>
      ) : null}
    </>
  );
}
