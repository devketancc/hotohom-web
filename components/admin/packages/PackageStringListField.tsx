'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PackageStringListField({
  label,
  hint,
  values,
  onChange,
  placeholder = 'https://…',
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <Label>{label}</Label>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...values, ''])}>
          <Plus className="size-3.5 mr-1" aria-hidden />
          Add URL
        </Button>
      </div>
      <div className="space-y-2">
        {values.map((url, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value;
                onChange(next);
              }}
              placeholder={placeholder}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              aria-label="Remove URL"
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        {values.length === 0 && (
          <p className="text-xs text-muted-foreground">No gallery images yet. Add URLs for the package gallery.</p>
        )}
      </div>
    </div>
  );
}
