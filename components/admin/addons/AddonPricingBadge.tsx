import { Badge } from '@/components/ui/badge';
import type { AdminAddon } from '@/types/adminAddon';

function formatInr(price: string): string {
  const n = Number(price);
  if (!Number.isFinite(n)) return price;
  return n.toLocaleString('en-IN');
}

export function AddonPricingBadge({ addon }: { addon: AdminAddon }) {
  const amount = `₹${formatInr(addon.price)}`;
  const suffix = addon.pricing_type === 'per_day' ? '/ day' : ' per booking';

  return (
    <Badge variant="outline" className="tabular-nums font-medium">
      {amount}
      <span className="font-normal text-muted-foreground">{suffix}</span>
    </Badge>
  );
}
