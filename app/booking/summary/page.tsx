'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useBookingStore } from '@/store/bookingStore';
import { useCart } from '@/hooks/useCart';
import { useAddons } from '@/hooks/useAddons';
import { cartService } from '@/services/cart.service';
import { formatBookingTravelWindow } from '@/utils/format';
import { AddonList } from '@/components/booking/AddonList';
import { MotohomLogo } from '@/components/brand/MotohomLogo';
import {
  Edit2,
  Calendar,
  MapPin,
  Users,
  Lightbulb,
  Check,
  ArrowRight,
  Lock,
  X,
} from 'lucide-react';
import Image from 'next/image';
import type { Cart, CartPricingBreakdown } from '@/types/cart';

function formatInr(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function planLabelFromChosen(chosen: string): string {
  const c = chosen.trim();
  if (!c) return '';
  if (c === 'km_wise') return 'KM-wise';
  if (c === 'day_wise') return 'day-wise';
  return c.replace(/_/g, ' ');
}

const KM_PLAN_INCLUDES = [
  'Rental amount',
  'driver',
  'assistant',
  'Fuel',
  'Ac charges (2 hours)',
];

const KM_PLAN_EXCLUDES = [
  'Tolls',
  'Add-ons',
  'GST',
  'Parking',
  'Food',
];

const DAY_PLAN_INCLUDES = [
  'Rental amount',
  'driver',
  'assistant',
];

const DAY_PLAN_EXCLUDES = [
  'Tolls',
  'Add-ons',
  'GST',
  'Parking',
  'Food',
  'Fuel',
];

/** Bracket after "Base rental" — km-wise shows estimated distance; day-wise shows trip length in days. */
function baseRentalBracketLabel(cart: Cart, pb: CartPricingBreakdown): string {
  const chosen = pb.chosen.trim().toLowerCase();
  const mode = cart.pricing_mode.trim().toLowerCase();
  const kmWise =
    chosen === 'km_wise' ||
    (chosen !== 'day_wise' && (mode === 'km' || mode === 'km_wise'));

  if (kmWise) {
    const km = Number(cart.estimated_km);
    if (Number.isFinite(km) && km > 0) {
      return `${Math.round(km).toLocaleString('en-IN')} km estimated`;
    }
    return 'estimated km';
  }

  return `${cart.total_days} days`;
}

function PricingRecommendation({
  pb,
  onOpenPlanDetails,
  onOpenInclusionDetails,
}: {
  pb: CartPricingBreakdown;
  onOpenPlanDetails: () => void;
  onOpenInclusionDetails: () => void;
}) {
  const plan = planLabelFromChosen(pb.chosen);
  const planDisplay = plan ? `${plan.charAt(0).toUpperCase()}${plan.slice(1)}` : 'Day-wise';
  const hasReason = Boolean(pb.reason);
  if (!plan && !hasReason) return null;

  return (
    <div className="bg-stitch-primary/5 rounded-lg p-4 mb-8 border border-stitch-primary/10">
      <div className="flex gap-3">
        <Lightbulb className="text-stitch-primary shrink-0 mt-0.5" size={20} />
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm text-stitch-on-background leading-relaxed">
            <span className="font-semibold text-stitch-primary">Best price applied:</span>{' '}
            <span className="font-bold text-stitch-primary">{planDisplay} plan</span>
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This option is cheaper for your trip.
          </p>
          <button
            type="button"
            onClick={onOpenPlanDetails}
            className="text-xs font-semibold text-stitch-primary underline underline-offset-2 hover:text-stitch-primary-container transition-colors"
          >
            See how we calculated this
          </button>
          <button
            type="button"
            onClick={onOpenInclusionDetails}
            className="text-xs font-semibold text-stitch-primary underline underline-offset-2 hover:text-stitch-primary-container transition-colors"
          >
            Check plan inclusions &amp; exclusions
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingSummaryPage() {
  const router = useRouter();
  const cartId = useCartStore((s) => s.cartId);
  const cartHasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clearCart);
  const { caravanClass, dates, passengers, pets, journey, hubName, bookingFlow, activePackage } =
    useBookingStore();
  const flow = bookingFlow ?? 'standard';
  const [loadingAddonId, setLoadingAddonId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [bypassLoading, setBypassLoading] = useState(false);
  const [bypassError, setBypassError] = useState<string | null>(null);
  const [bypassSuccess, setBypassSuccess] = useState<string | null>(null);
  const [bypassModalOpen, setBypassModalOpen] = useState(false);
  const [bypassTokenInput, setBypassTokenInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [isPlanDetailsOpen, setIsPlanDetailsOpen] = useState(false);
  const [showInclusionDetails, setShowInclusionDetails] = useState(false);

  useEffect(() => {
    if (!cartHasHydrated) return;
    if (!cartId || !caravanClass) {
      router.replace(flow === 'package' ? '/packages' : '/journey');
    }
  }, [cartHasHydrated, cartId, caravanClass, flow, router]);

  const { data: cart, isLoading: cartLoading, isError: cartError, refetch: refetchCart } = useCart(cartId);
  const { data: addonsContent, isLoading: addonsLoading } = useAddons();

  const addons = addonsContent || [];

  const handleUpdateQuantity = async (addonId: string, quantity: number) => {
    if (!cartId) return;

    setLoadingAddonId(addonId);
    setUpdateError(null);
    try {
      if (quantity === 0) {
        await cartService.removeItem(cartId, addonId);
      } else {
        await cartService.addItem(cartId, addonId, quantity);
      }
      // Critical: Always refetch cart from backend to get updated totals
      await refetchCart();
    } catch (err) {
      console.error('Failed to update addon:', err);
      setUpdateError('Failed to update add-on. Please try again.');
    } finally {
      setLoadingAddonId(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!cartId || !cart) return;
    const code = couponCode.trim();
    if (!code) {
      setCouponError('Enter a coupon code.');
      return;
    }
    setCouponApplying(true);
    setCouponError(null);
    try {
      await cartService.applyCoupon(cartId, code);
      setAppliedCouponCode(code.toUpperCase());
      setCouponCode('');
      await refetchCart();
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon code. Please try another one.');
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!cartId || !isCouponApplied) return;
    setCouponApplying(true);
    setCouponError(null);
    try {
      await cartService.removeCoupon(cartId);
      setAppliedCouponCode(null);
      setCouponCode('');
      await refetchCart();
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Failed to remove coupon. Please try again.');
    } finally {
      setCouponApplying(false);
    }
  };

  const handleBypassBooking = async () => {
    if (!cartId) return;
    const token = bypassTokenInput.trim();
    if (!token) {
      setBypassError('Paste the admin bypass token, then try again.');
      return;
    }
    setBypassLoading(true);
    setBypassError(null);
    setBypassSuccess(null);
    try {
      await cartService.convertCart(cartId, token);
      setBypassSuccess('Temporary bypass triggered successfully.');
      setBypassModalOpen(false);
      setBypassTokenInput('');
    } catch (err) {
      setBypassError(err instanceof Error ? err.message : 'Temporary bypass failed.');
    } finally {
      setBypassLoading(false);
    }
  };

  useEffect(() => {
    if (!isPlanDetailsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPlanDetailsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlanDetailsOpen]);

  useEffect(() => {
    if (!bypassModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setBypassModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [bypassModalOpen]);

  if (!cartHasHydrated || cartLoading || addonsLoading || !caravanClass) {
    return (
      <div className="flex flex-1 min-h-[50vh] items-center justify-center text-stitch-on-background">
        <div className="animate-spin size-8 border-4 border-stitch-primary border-t-transparent pt-2 rounded-full"></div>
      </div>
    );
  }

  if (cartError || !cart) {
    return (
      <div className="flex flex-1 min-h-[50vh] items-center justify-center text-stitch-on-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load booking summary</p>
          <button
            type="button"
            onClick={() => void refetchCart()}
            className="px-4 py-2 bg-stitch-surface rounded-lg hover:bg-stitch-surface-highest transition"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => {
              clearCart();
              router.replace(flow === 'package' ? '/packages' : '/journey');
            }}
            className="ml-3 px-4 py-2 text-sm text-muted-foreground hover:text-stitch-on-background transition"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  const { pricing_breakdown: pb } = cart;
  const totalKm = Number.isFinite(Number(cart.estimated_km)) ? Number(cart.estimated_km) : 0;
  const totalDays = Math.max(Number(cart.total_days || 0), 1);
  const avgKmPerDay = totalKm / totalDays;
  const selectedPlanLabel = planLabelFromChosen(pb.chosen) || (cart.pricing_mode === 'km' ? 'KM-wise' : 'day-wise');
  const isCouponApplied = Boolean(cart.coupon) || pb.coupon_discount > 0;
  const couponDisplayValue = isCouponApplied
    ? appliedCouponCode || 'Coupon applied'
    : couponCode;
  const hasFeeLines =
    pb.pet_cleaning_charge > 0 ||
    pb.one_way_surcharge > 0 ||
    pb.addons_total > 0 ||
    pb.coupon_discount > 0;
  const showSubtotalRow =
    pb.subtotal !== undefined && (pb.subtotal !== pb.base_price || hasFeeLines);

  const stops = journey?.stops || [];
  const startStop = stops[0]?.location?.name || hubName || 'Start Location';
  const endStop = stops[stops.length - 1]?.location?.name || hubName || 'Return Location';
  const midStops = stops.slice(1, -1);

  return (
    <div className="text-stitch-on-background font-body selection:bg-stitch-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-12">

          {/* Journey Scannability */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-2xl font-bold">Journey Summary</h2>
              <button
                onClick={() =>
                  router.push(
                    flow === 'package' && activePackage?.id
                      ? `/package/${activePackage.id}/stops`
                      : '/journey'
                  )
                }
                className="flex items-center gap-1.5 text-stitch-primary text-sm font-medium hover:underline"
              >
                <Edit2 size={16} />
                {flow === 'package' ? 'Edit pickup & drop' : 'Edit Route'}
              </button>
            </div>
            <div className="bg-stitch-surface-highest/30 rounded-xl p-8 border border-border/10">
              <div className="relative flex justify-between items-center px-4">
                <div className="absolute top-1/2 left-0 w-full h-px bg-border/40 -translate-y-1/2 z-0"></div>

                <div className="relative z-10 flex flex-col items-center bg-stitch-surface px-2 rounded-lg">
                  <div className="size-4 rounded-full border-2 border-stitch-primary bg-stitch-surface mb-3"></div>
                  <span className="font-headline font-bold text-stitch-on-background line-clamp-1 max-w-[80px] text-center text-sm">{startStop}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-tighter mt-1">Start</span>
                </div>

                {midStops.slice(0, 2).map((stop, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center bg-stitch-surface px-2 rounded-lg">
                    <div className="size-3 rounded-full bg-border mb-3 mt-0.5"></div>
                    <span className="font-headline font-bold text-stitch-on-background line-clamp-1 max-w-[80px] text-center text-sm">
                      {stop.location?.name?.split(',')[0]}
                    </span>
                  </div>
                ))}

                <div className="relative z-10 flex flex-col items-center bg-stitch-surface px-2 rounded-lg">
                  <div className="size-4 rounded-full border-2 border-stitch-primary bg-stitch-primary mb-3 shadow-[0_0_10px_rgba(255,214,130,0.5)]"></div>
                  <span className="font-headline font-bold text-stitch-on-background line-clamp-1 max-w-[80px] text-center text-sm">{endStop}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-tighter mt-1">Return</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="text-stitch-primary" size={18} />
                  {formatBookingTravelWindow(dates)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="text-stitch-primary" size={18} />
                  {journey?.distanceKm || 0} km Total
                </div>
              </div>
            </div>
          </section>

          {/* Caravan & Passengers */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-stitch-surface-highest/30 rounded-xl p-6 border border-border/10">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-label uppercase tracking-widest text-muted-foreground">Caravan Selection</p>
                <button
                  onClick={() => router.push('/select-caravan')}
                  className="text-stitch-primary hover:bg-stitch-primary/10 p-1 rounded transition"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="flex gap-4">
                <div className="size-16 sm:size-20 rounded bg-stitch-surface-highest overflow-hidden flex-shrink-0 relative">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuClB0f8PUaXA8gHBN-g4Cxue-v_zASgclAclS8n4AG53qXOVQj0XOmm1YrUrJ3Q5ocPEcqtjWCuhPIk1vy3stJ4pj6vWO2vBjwGBphk91Mx71p101GCCXwclBJz5OX6UgJnXcblx3wN0I_pRky0B1ZmPMLeXkvgM7pz0ilvVhvNTZoytTHNA8lUJuApVKy73D5Zy8UoC5pk7-H3fcRXXuyffd0f8O7afH8sJMLxeJqUED5ZhJwClNUN2ySiaeu6BXUC-wiAtX0GQPM"
                    alt={caravanClass.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-stitch-on-background line-clamp-1">{caravanClass.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{caravanClass.amenities.slice(0, 3).join(' • ')}</p>
                </div>
              </div>
            </div>

            <div className="bg-stitch-surface-highest/30 rounded-xl p-6 border border-border/10">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-label uppercase tracking-widest text-muted-foreground">Travelers</p>
                <button className="text-stitch-primary hover:bg-stitch-primary/10 p-1 rounded transition">
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-16 sm:size-20 rounded-full bg-stitch-surface flex items-center justify-center flex-shrink-0">
                  <Users className="text-stitch-primary" size={32} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-stitch-on-background">{passengers} Passengers</h4>
                  {pets > 0 && <p className="text-xs text-muted-foreground mt-1">{pets} Pet{pets > 1 ? 's' : ''} Included</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Add-ons Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-xl font-bold">Enhance Your Experience</h3>
              {updateError && (
                <span className="text-xs text-destructive font-medium animate-pulse">
                  {updateError}
                </span>
              )}
            </div>

            <AddonList
              addons={addons}
              cartItems={cart.items || []}
              onUpdateQuantity={handleUpdateQuantity}
              loadingAddonId={loadingAddonId}
            />
          </section>
        </div>

        {/* Right Panel: Summary & Pricing */}
        <aside className="lg:col-span-5 relative">
          <div className="absolute top-20 right-0 w-64 h-64 bg-stitch-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="bg-stitch-surface-highest/30 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 sticky top-28 border border-white/5 shadow-2xl">
            <h3 className="font-headline text-xl font-bold mb-8">Pricing Breakdown</h3>
            <div className="mb-6 rounded-xl border border-border/20 bg-stitch-surface/30 p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                Coupon
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponDisplayValue}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    if (couponError) setCouponError(null);
                  }}
                  disabled={isCouponApplied || couponApplying}
                  placeholder="Enter coupon code"
                  className="flex-1 rounded-lg border border-border/30 bg-stitch-surface px-3 py-2.5 text-sm text-stitch-on-background placeholder:text-muted-foreground/70 disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:border-stitch-primary"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isCouponApplied || couponApplying || couponCode.trim().length === 0}
                  className="rounded-lg px-4 py-2.5 text-sm font-bold transition-all bg-stitch-primary text-stitch-on-primary disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                >
                  {isCouponApplied ? 'Applied' : couponApplying ? 'Applying...' : 'Apply'}
                </button>
                {isCouponApplied && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    disabled={couponApplying}
                    className="rounded-lg px-4 py-2.5 text-sm font-bold transition-all border border-border/30 bg-stitch-surface text-stitch-on-background disabled:opacity-50 disabled:cursor-not-allowed hover:border-stitch-primary/60"
                  >
                    {couponApplying ? 'Removing...' : 'Remove'}
                  </button>
                )}
              </div>
              {couponError ? (
                <p className="mt-2 text-xs text-destructive">{couponError}</p>
              ) : isCouponApplied ? (
                <p className="mt-2 text-xs text-stitch-primary">Coupon applied. You can use one coupon per booking.</p>
              ) : null}
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  Base rental ({baseRentalBracketLabel(cart, pb)})
                </span>
                <span className="font-medium tabular-nums shrink-0">₹{formatInr(pb.base_price)}</span>
              </div>

              {pb.pet_cleaning_charge > 0 && (
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Pet cleaning</span>
                  <span className="font-medium tabular-nums shrink-0">₹{formatInr(pb.pet_cleaning_charge)}</span>
                </div>
              )}

              {pb.one_way_surcharge > 0 && (
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">One-way surcharge</span>
                  <span className="font-medium tabular-nums shrink-0">₹{formatInr(pb.one_way_surcharge)}</span>
                </div>
              )}

              {pb.addons_total > 0 && (
                <div className="flex justify-between gap-3 text-sm animate-in fade-in slide-in-from-right-2">
                  <span className="text-muted-foreground">Add-ons</span>
                  <span className="font-medium text-stitch-primary tabular-nums shrink-0">
                    ₹{formatInr(pb.addons_total)}
                  </span>
                </div>
              )}

              {pb.coupon_discount > 0 && (
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Coupon discount</span>
                  <span className="font-medium text-stitch-primary tabular-nums shrink-0">
                    −₹{formatInr(pb.coupon_discount)}
                  </span>
                </div>
              )}

              {pb.insurance_total > 0 && (
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Insurance &amp; support</span>
                  <span className="font-medium tabular-nums shrink-0">₹{formatInr(pb.insurance_total)}</span>
                </div>
              )}

              {showSubtotalRow && pb.subtotal !== undefined && (
                <div className="flex justify-between gap-3 text-sm pt-1 border-t border-border/10">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-semibold tabular-nums shrink-0">₹{formatInr(pb.subtotal)}</span>
                </div>
              )}

              {(pb.gst > 0 || pb.tax_total > 0) && (
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {pb.gst > 0
                      ? pb.gst_rate
                        ? `GST (${pb.gst_rate})`
                        : 'GST'
                      : 'Taxes'}
                  </span>
                  <span className="font-medium tabular-nums shrink-0">
                    ₹{formatInr(pb.gst > 0 ? pb.gst : pb.tax_total)}
                  </span>
                </div>
              )}

              {pb.razorpay_charges > 0 && (
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Payment processing fee</span>
                  <span className="font-medium tabular-nums shrink-0">₹{formatInr(pb.razorpay_charges)}</span>
                </div>
              )}

              <div className="h-px bg-border/20 my-4"></div>

              <div className="flex flex-col gap-1 items-end">
                <span className="text-xs font-label text-muted-foreground tabular-nums">
                  ₹{formatInr(pb.grand_total / Math.max(cart.total_days, 1))} / day
                </span>
                <div className="flex justify-between w-full items-baseline gap-3">
                  <span className="font-bold text-stitch-on-background text-lg">Grand total</span>
                  <span className="font-headline font-extrabold text-3xl text-stitch-primary tracking-tight tabular-nums">
                    ₹{formatInr(pb.grand_total)}
                  </span>
                </div>
              </div>

              {pb.deposit_amount > 0 && (
                <div className="flex justify-between gap-3 text-sm pt-2">
                  <span className="text-muted-foreground">Refundable deposit</span>
                  <span className="font-medium tabular-nums shrink-0">₹{formatInr(pb.deposit_amount)}</span>
                </div>
              )}
            </div>

            <PricingRecommendation
              pb={pb}
              onOpenPlanDetails={() => {
                setShowInclusionDetails(false);
                setIsPlanDetailsOpen(true);
              }}
              onOpenInclusionDetails={() => {
                setShowInclusionDetails(true);
                setIsPlanDetailsOpen(true);
              }}
            />

            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                <Check className="text-stitch-primary" size={14} />
                Free Cancellation (48h)
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                <Check className="text-stitch-primary" size={14} />
                Dedicated trip support
              </div>
            </div>

            <button
              className="w-full py-4 rounded-xl text-stitch-on-primary font-bold text-base shadow-lg shadow-stitch-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 mb-4 bg-gradient-to-br from-stitch-primary-container to-stitch-primary active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => router.push('/booking/payment')}
              disabled={cartLoading || !!loadingAddonId || couponApplying}
            >
              Proceed to Secure Payment
              <ArrowRight size={20} />
            </button>
            <button
              type="button"
              onClick={() => {
                setBypassError(null);
                setBypassSuccess(null);
                setBypassModalOpen(true);
              }}
              disabled={bypassLoading || !cartId}
              className="relative w-full py-3 rounded-xl border border-border/30 bg-stitch-surface text-stitch-on-background text-sm font-semibold hover:border-stitch-primary/60 hover:text-stitch-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span
                className="pointer-events-none absolute -right-1 -top-2 rounded-md border border-amber-500/50 bg-amber-500/15 px-1.5 py-0.5 font-headline text-[9px] font-black uppercase tracking-widest text-amber-400"
                aria-hidden
              >
                TEMP
              </span>
              {bypassLoading ? 'Bypassing...' : 'Temporary Bypass Booking'}
            </button>
            {bypassError ? (
              <p className="mt-2 text-xs text-destructive">{bypassError}</p>
            ) : null}
            {bypassSuccess ? (
              <p className="mt-2 text-xs text-stitch-primary">{bypassSuccess}</p>
            ) : null}
            <div className="flex items-center justify-center gap-2 opacity-60">
              <Lock className="fill-current" size={12} />
              <span className="text-[10px] font-label tracking-wide uppercase">Powered by Razorpay • 100% secure</span>
            </div>
          </div>
        </aside>
      </div>

      {isPlanDetailsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsPlanDetailsOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border/20 bg-stitch-surface p-5 sm:p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h4 className="text-xl font-headline font-bold text-stitch-on-background">Inclusions & Exclusions</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPlanDetailsOpen(false)}
                className="shrink-0 rounded-lg border border-border/30 p-2 text-muted-foreground hover:text-stitch-on-background hover:border-stitch-primary/50 transition-colors"
                aria-label="Close plan details"
              >
                <X className="size-4" />
              </button>
            </div>


            {showInclusionDetails && (
              <div className="space-y-4 mt-4">
                <div className="rounded-xl border border-border/15 bg-stitch-background/20 p-4">
                  <h5 className="font-semibold text-stitch-on-background mb-3">Kms wise pricing</h5>

                  <div className="grid grid-cols-2 border border-border/15 rounded-lg overflow-hidden">
                    <div className="p-3 text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold bg-stitch-surface/30 border-r border-border/15 text-center">
                      Excluding
                    </div>
                    <div className="p-3 text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold bg-stitch-surface/30 text-center">
                      Including
                    </div>

                    {Array.from({
                      length: Math.max(KM_PLAN_EXCLUDES.length, KM_PLAN_INCLUDES.length),
                    }).map((_, idx) => {
                      const left = KM_PLAN_EXCLUDES[idx] ?? '';
                      const right = KM_PLAN_INCLUDES[idx] ?? '';
                      return (
                        <React.Fragment key={`km-row-${idx}`}>
                          <div className="px-3 py-2 border-t border-border/15 border-r text-sm text-muted-foreground min-h-[34px]">
                            {left}
                          </div>
                          <div className="px-3 py-2 border-t border-border/15 text-sm text-stitch-on-background min-h-[34px]">
                            {right}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-border/15 bg-stitch-background/20 p-4">
                  <h5 className="font-semibold text-stitch-on-background mb-3">Day wise pricing</h5>

                  <div className="grid grid-cols-2 border border-border/15 rounded-lg overflow-hidden">
                    <div className="p-3 text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold bg-stitch-surface/30 border-r border-border/15 text-center">
                      Excluding
                    </div>
                    <div className="p-3 text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold bg-stitch-surface/30 text-center">
                      Including
                    </div>

                    {Array.from({
                      length: Math.max(DAY_PLAN_EXCLUDES.length, DAY_PLAN_INCLUDES.length),
                    }).map((_, idx) => {
                      const left = DAY_PLAN_EXCLUDES[idx] ?? '';
                      const right = DAY_PLAN_INCLUDES[idx] ?? '';
                      return (
                        <React.Fragment key={`day-row-${idx}`}>
                          <div className="px-3 py-2 border-t border-border/15 border-r text-sm text-muted-foreground min-h-[34px]">
                            {left}
                          </div>
                          <div className="px-3 py-2 border-t border-border/15 text-sm text-stitch-on-background min-h-[34px]">
                            {right}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {bypassModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bypass-token-title"
          onClick={() => !bypassLoading && setBypassModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border/20 bg-stitch-surface p-5 sm:p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h4
                id="bypass-token-title"
                className="text-lg font-headline font-bold text-stitch-on-background"
              >
                Admin bypass token
              </h4>
              <button
                type="button"
                onClick={() => !bypassLoading && setBypassModalOpen(false)}
                className="shrink-0 rounded-lg border border-border/30 p-2 text-muted-foreground hover:text-stitch-on-background hover:border-stitch-primary/50 transition-colors disabled:opacity-50"
                aria-label="Close"
                disabled={bypassLoading}
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              The logged-in session token cannot call this endpoint. Paste the token you use for admin API access, then run the bypass.
            </p>
            <input
              type="password"
              autoComplete="off"
              value={bypassTokenInput}
              onChange={(e) => setBypassTokenInput(e.target.value)}
              placeholder="Bearer token value"
              disabled={bypassLoading}
              className="w-full rounded-lg border border-border/30 bg-stitch-background/30 px-3 py-2.5 text-sm text-stitch-on-background placeholder:text-muted-foreground/70 outline-none focus:border-stitch-primary mb-4"
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => !bypassLoading && setBypassModalOpen(false)}
                disabled={bypassLoading}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold border border-border/30 bg-stitch-surface text-stitch-on-background hover:border-stitch-primary/60 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleBypassBooking()}
                disabled={bypassLoading || !cartId}
                className="rounded-lg px-4 py-2.5 text-sm font-bold bg-stitch-primary text-stitch-on-primary hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bypassLoading ? 'Bypassing...' : 'Run bypass'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-20 border-t border-border/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Link
            href="/"
            className="flex items-center opacity-50 transition-opacity hover:opacity-80"
          >
            <MotohomLogo className="h-5 w-auto max-w-[140px] sm:h-6" blendOnDark />
          </Link>
          <p className="text-xs text-muted-foreground">© 2026 Motohom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
