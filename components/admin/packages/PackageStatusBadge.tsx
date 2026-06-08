import { cn } from '@/lib/utils';

export function PackageStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider',
        isActive
          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
