import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AddonStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-semibold uppercase tracking-wide',
        isActive
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
          : 'border-border bg-muted/50 text-muted-foreground'
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
}
