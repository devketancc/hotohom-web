import { Badge } from '@/components/ui/badge';
import type { AdminAddonCategory } from '@/types/adminAddon';

const LABELS: Record<AdminAddonCategory, string> = {
  comfort: 'Comfort',
  adventure: 'Adventure',
  safety: 'Safety',
  utility: 'Utility',
  other: 'Other',
};

export function AddonCategoryBadge({ category }: { category: AdminAddonCategory }) {
  return (
    <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wide">
      {LABELS[category]}
    </Badge>
  );
}
