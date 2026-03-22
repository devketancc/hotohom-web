'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  quantity: number;
  max: number;
  min?: number;
  onChange: (next: number) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  max,
  min = 0,
  onChange,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={disabled || quantity <= min}
        className="size-8 rounded-lg border border-border bg-stitch-surface flex items-center justify-center text-stitch-on-background hover:border-stitch-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" />
      </button>
      
      <span className="text-sm font-bold w-4 text-center tabular-nums">
        {quantity}
      </span>
      
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={disabled || quantity >= max}
        className="size-8 rounded-lg border-2 border-stitch-primary bg-stitch-primary/10 flex items-center justify-center text-stitch-primary hover:bg-stitch-primary/20 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
};
