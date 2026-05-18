import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { AdminAddon } from '@/types/adminAddon';

function fmt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return '—';
  return format(d, 'dd MMM yyyy, HH:mm');
}

function Chip({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 font-mono text-xs text-foreground ring-1 ring-border/60"
    >
      {children}
    </span>
  );
}

export function AddonDetails({
  addon,
  className,
  classNameByCode,
}: {
  addon: AdminAddon;
  className?: string;
  classNameByCode?: Record<string, string>;
}) {
  const classes = addon.applicable_classes;

  return (
    <div className={cn('space-y-4 border-t border-border/60 bg-muted/20 px-4 py-4 sm:px-5', className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</p>
          <p className="mt-1 text-sm text-foreground">{addon.description?.trim() ? addon.description : '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Max quantity</p>
          <p className="mt-1 text-sm tabular-nums text-foreground">{addon.max_quantity}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Image</p>
          {addon.image_url?.trim() ? (
            <a
              href={addon.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block truncate text-sm text-primary hover:underline"
            >
              {addon.image_url}
            </a>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">—</p>
          )}
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

      <Separator />

      <div className="text-xs text-muted-foreground sm:text-sm">
        <span className="font-medium text-foreground">Created</span> {fmt(addon.created_at)}
      </div>
    </div>
  );
}
