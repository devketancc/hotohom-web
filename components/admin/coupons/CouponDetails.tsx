import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { AdminCoupon } from '@/types/coupon';

const APPLICABLE_ON_LABEL: Record<AdminCoupon['applicable_on'], string> = {
  cart: 'Entire cart (base + add-ons)',
  addons: 'Add-ons only',
  base: 'Base rental only',
};

function fmt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return '—';
  return format(d, 'dd MMM yyyy, HH:mm');
}

function Chip({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 font-mono text-xs text-foreground ring-1 ring-border/60',
        className
      )}
    >
      {children}
    </span>
  );
}

export function CouponDetails({
  coupon,
  className,
  classNameByCode,
  locationNameById,
}: {
  coupon: AdminCoupon;
  className?: string;
  classNameByCode?: Record<string, string>;
  locationNameById?: Record<string, string>;
}) {
  const classes = coupon.applicable_classes;
  const dests = coupon.applicable_destinations;

  return (
    <div className={cn('space-y-4 border-t border-border/60 bg-muted/20 px-4 py-4 sm:px-5', className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</p>
          <p className="mt-1 text-sm text-foreground">{coupon.description?.trim() ? coupon.description : '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Applicable on</p>
          <p className="mt-1 text-sm text-foreground">{APPLICABLE_ON_LABEL[coupon.applicable_on]}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Min booking value</p>
          <p className="mt-1 text-sm tabular-nums text-foreground">₹{coupon.min_booking_value}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Max discount cap</p>
          <p className="mt-1 text-sm tabular-nums text-foreground">
            {coupon.max_discount_cap != null ? `₹${coupon.max_discount_cap}` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Per user limit</p>
          <p className="mt-1 text-sm tabular-nums text-foreground">{coupon.per_user_limit}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Flags</p>
          <ul className="mt-1 list-inside list-disc text-sm text-foreground">
            <li>{coupon.is_first_booking_only ? 'First booking only' : 'Any booking'}</li>
            <li>{coupon.is_referral_coupon ? 'Referral coupon' : 'Standard coupon'}</li>
          </ul>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Applicable classes</p>
        {classes.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">All classes</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {classes.map((code) => (
              <Chip key={code}>
                {classNameByCode?.[code] ? `${code} · ${classNameByCode[code]}` : code}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Destinations</p>
        {dests.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">All destinations</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {dests.map((id) => (
              <Chip key={id} title={id}>
                {locationNameById?.[id] ?? `${id.slice(0, 8)}…`}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 sm:text-sm">
        <div>
          <span className="font-medium text-foreground">Created</span> {fmt(coupon.created_at)}
        </div>
        <div>
          <span className="font-medium text-foreground">Valid</span> {fmt(coupon.valid_from)} → {fmt(coupon.valid_until)}
        </div>
        {coupon.user ? (
          <div className="sm:col-span-2">
            <span className="font-medium text-foreground">Assigned user</span>{' '}
            <span className="font-mono text-indigo-300">{coupon.user}</span>
            <span className="ml-2 rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-200 ring-1 ring-indigo-500/30">
              Personal
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
