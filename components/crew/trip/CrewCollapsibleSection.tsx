'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

function isLgViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(min-width: 1024px)').matches;
}

export function CrewCollapsibleSection({
  title,
  subtitle,
  defaultCollapsed = false,
  collapseOnMobile = true,
  headerAction,
  className,
  contentClassName,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultCollapsed?: boolean;
  /** When true, section can collapse below `lg`; always expanded on desktop. */
  collapseOnMobile?: boolean;
  headerAction?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const hiddenOnMobile = collapseOnMobile && collapsed;

  const toggle = () => {
    if (!collapseOnMobile || isLgViewport()) return;
    setCollapsed((c) => !c);
  };

  return (
    <section className={cn('rounded-xl border border-border bg-card shadow-sm', className)}>
      <div className="flex items-start gap-2 p-3 sm:p-4">
        <button
          type="button"
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapseOnMobile && 'lg:pointer-events-none'
          )}
          onClick={toggle}
          aria-expanded={collapseOnMobile ? !hiddenOnMobile : true}
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {collapseOnMobile ? (
            <ChevronDown
              className={cn(
                'size-5 shrink-0 text-muted-foreground transition-transform lg:hidden',
                collapsed && '-rotate-90'
              )}
              aria-hidden
            />
          ) : null}
        </button>
        {headerAction ? <div className="shrink-0 pt-0.5">{headerAction}</div> : null}
      </div>

      <div
        className={cn(
          'p-3 sm:p-4 sm:pt-3',
          contentClassName,
          hiddenOnMobile ? 'hidden lg:block' : 'block'
        )}
      >
        {children}
      </div>
    </section>
  );
}
