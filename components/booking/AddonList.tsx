'use client';

import React from 'react';
import { Addon } from '@/types/addon';
import { CartItem } from '@/types/cart';
import { QuantityStepper } from './QuantityStepper';
import { PlusCircle, CheckCircle2, Tent, Bike, Sofa } from 'lucide-react';
import { cn } from '@/lib/utils';

// Reusing icon logic
const getAddonIcon = (addonName: string) => {
  const name = addonName.toLowerCase();
  if (name.includes('bbq') || name.includes('grill')) return <Tent className="text-stitch-primary" size={24} />;
  if (name.includes('bike') || name.includes('trail')) return <Bike className="text-stitch-primary" size={24} />;
  if (name.includes('relax') || name.includes('hammock')) return <Sofa className="text-stitch-primary" size={24} />;
  return <Tent className="text-stitch-primary" size={24} />;
};

interface AddonListProps {
  addons: Addon[];
  cartItems: CartItem[];
  onUpdateQuantity: (addonId: string, quantity: number) => Promise<void>;
  loadingAddonId: string | null;
}

export const AddonList: React.FC<AddonListProps> = ({
  addons,
  cartItems,
  onUpdateQuantity,
  loadingAddonId,
}) => {
  if (addons.length === 0) {
    return (
      <div className="col-span-full py-12 text-center bg-stitch-surface-highest/20 rounded-2xl border border-dashed border-border/30">
        <p className="text-muted-foreground font-medium">No add-ons available for this trip</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {addons.map((addon) => {
        const cartItem = cartItems.find((item) => item.addon_id === addon.id);
        const currentQuantity = cartItem?.quantity || 0;
        const isSelected = currentQuantity > 0;
        const isLoading = loadingAddonId === addon.id;

        return (
          <div
            key={addon.id}
            className={cn(
              "relative p-5 rounded-xl border transition-all group shadow-sm flex flex-col justify-between",
              isSelected
                ? "border-2 border-stitch-primary bg-stitch-surface-highest"
                : "border-border/20 bg-stitch-surface/50 hover:border-stitch-primary/50"
            )}
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                {getAddonIcon(addon.name)}
                <div className="flex items-center gap-1.5 text-xs font-bold text-stitch-primary">
                  {isSelected ? 'Selected' : 'Add to trip'}
                  {isSelected ? (
                    <CheckCircle2 size={16} className="fill-stitch-primary text-stitch-surface-highest" />
                  ) : (
                    <PlusCircle size={16} className="group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </div>
              <h4 className="font-bold text-stitch-on-background">{addon.name}</h4>
              {addon.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {addon.description}
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="font-label font-bold text-sm">
                  ₹{Number(addon.price).toLocaleString('en-IN')}
                  <span className="text-xs text-muted-foreground font-normal ml-1">/ day</span>
                </p>
              </div>

              {addon.max_quantity > 1 ? (
                <QuantityStepper
                  quantity={currentQuantity}
                  max={addon.max_quantity}
                  onChange={(q) => onUpdateQuantity(addon.id, q)}
                  disabled={isLoading}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(addon.id, isSelected ? 0 : 1)}
                  disabled={isLoading}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    isSelected
                      ? "bg-stitch-primary/10 text-stitch-primary border border-stitch-primary/20 hover:bg-stitch-primary/20"
                      : "bg-stitch-primary text-stitch-on-primary shadow-sm hover:brightness-110 active:scale-95"
                  )}
                >
                  {isLoading ? 'Updating...' : isSelected ? 'Remove' : 'Add'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
