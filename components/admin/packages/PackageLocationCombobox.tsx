'use client';

import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { listAdminPackageLocationOptions, packageAdminQueryKeys } from '@/services/packageAdmin.service';

export function PackageLocationCombobox({
  value,
  onChange,
  placeholder = 'Select location…',
  disabled,
}: {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: locations = [], isLoading } = useQuery({
    queryKey: packageAdminQueryKeys.locations(search),
    queryFn: () => listAdminPackageLocationOptions(search),
    staleTime: 60_000,
  });

  const selected = useMemo(() => locations.find((l) => l.id === value), [locations, value]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      (l) => l.name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q) || l.location_type.includes(q)
    );
  }, [locations, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          />
        }
      >
        <span className="truncate">
          {selected ? `${selected.name} (${selected.location_type})` : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="border-b border-border p-2">
          <Input
            placeholder="Search locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-56 overflow-y-auto p-1">
          {isLoading ? (
            <p className="px-2 py-4 text-xs text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="px-2 py-4 text-xs text-muted-foreground">No locations found.</p>
          ) : (
            filtered.map((loc) => (
              <button
                key={loc.id}
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted/60"
                onClick={() => {
                  onChange(loc.id);
                  setOpen(false);
                }}
              >
                <Check className={cn('size-4 shrink-0', value === loc.id ? 'opacity-100' : 'opacity-0')} />
                <span className="min-w-0 truncate">
                  {loc.name}
                  <span className="ml-1 text-muted-foreground">· {loc.location_type}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
