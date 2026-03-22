'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useBookingStore } from '@/store/bookingStore';
import { useCart } from '@/hooks/useCart';
import { useAddons } from '@/hooks/useAddons';
import { cartService } from '@/services/cart.service';
import { formatBookingTravelWindow } from '@/utils/format';
import { AddonList } from '@/components/booking/AddonList';
import { 
  ArrowLeft, 
  Edit2, 
  Calendar, 
  MapPin, 
  Users, 
  Lightbulb,
  Check,
  ArrowRight,
  Lock,
  Info
} from 'lucide-react';
import Image from 'next/image';

export default function BookingSummaryPage() {
  const router = useRouter();
  const cartId = useCartStore((s) => s.cartId);
  const { caravanClass, dates, passengers, pets, journey, hubName } = useBookingStore();
  const [loadingAddonId, setLoadingAddonId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (!cartId || !caravanClass) {
      router.replace('/booking/journey'); 
    }
  }, [cartId, caravanClass, router]);

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

  if (cartLoading || addonsLoading || !caravanClass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stitch-background text-stitch-on-background">
        <div className="animate-spin size-8 border-4 border-stitch-primary border-t-transparent pt-2 rounded-full"></div>
      </div>
    );
  }

  if (cartError || !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stitch-background text-stitch-on-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load booking summary</p>
          <button 
            type="button" 
            onClick={() => void refetchCart()}
            className="px-4 py-2 bg-stitch-surface rounded-lg hover:bg-stitch-surface-highest transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { pricing_breakdown } = cart;
  const stops = journey?.stops || [];
  const startStop = stops[0]?.location?.name || hubName || 'Start Location';
  const endStop = stops[stops.length - 1]?.location?.name || hubName || 'Return Location';
  const midStops = stops.slice(1, -1);

  return (
    <div className="min-h-screen bg-stitch-background text-stitch-on-background font-body selection:bg-stitch-primary/20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-stitch-surface/80 backdrop-blur-md border-b border-border/20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-stitch-surface-highest rounded-full transition-colors text-stitch-primary"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="size-6 text-stitch-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h1 className="font-headline text-lg font-bold leading-none tracking-tight">Motohom {caravanClass.name.split(' ')[0]}</h1>
              <p className="text-xs text-muted-foreground font-label uppercase tracking-widest mt-1">Booking Summary</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-xs font-label uppercase tracking-widest text-muted-foreground">Step 3 of 4</span>
          <div className="w-16 sm:w-24 h-1 bg-stitch-surface-highest rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-stitch-primary"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Journey Scannability */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-2xl font-bold">Journey Summary</h2>
              <button 
                onClick={() => router.push('/booking/journey')}
                className="flex items-center gap-1.5 text-stitch-primary text-sm font-medium hover:underline"
              >
                <Edit2 size={16} />
                Edit Route
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
                  {formatBookingTravelWindow(dates)} ({Math.max(dates.totalDays, 1)} Nights)
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
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{caravanClass.amenities.slice(0,3).join(' • ')}</p>
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
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Rental ({cart.total_days} Days)</span>
                <span className="font-medium">₹{pricing_breakdown.base_price.toLocaleString('en-IN')}</span>
              </div>
              
              {pricing_breakdown.addons_total > 0 && (
                <div className="flex justify-between text-sm animate-in fade-in slide-in-from-right-2">
                  <span className="text-muted-foreground">Add-ons Total</span>
                  <span className="font-medium text-stitch-primary">₹{pricing_breakdown.addons_total.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              {pricing_breakdown.insurance_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Insurance & Support</span>
                  <span className="font-medium">₹{pricing_breakdown.insurance_total.toLocaleString('en-IN')}</span>
                </div>
              )}

              {pricing_breakdown.tax_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-medium">₹{pricing_breakdown.tax_total.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              <div className="h-px bg-border/20 my-4"></div>
              
              <div className="flex flex-col gap-1 items-end">
                <span className="text-xs font-label text-muted-foreground">
                  ₹{Math.round(pricing_breakdown.grand_total / Math.max(cart.total_days, 1)).toLocaleString('en-IN')} / day
                </span>
                <div className="flex justify-between w-full items-baseline">
                  <span className="font-bold text-stitch-on-background text-lg">Total Amount</span>
                  <span className="font-headline font-extrabold text-3xl text-stitch-primary tracking-tight">
                    ₹{pricing_breakdown.grand_total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Optimization Insight */}
            <div className="bg-stitch-primary/5 rounded-lg p-4 mb-8 border border-stitch-primary/10">
              <div className="flex gap-3">
                <Lightbulb className="text-stitch-primary shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-stitch-primary font-bold">Optimization Insight:</span> Book for 2 more days to unlock the &quot;Nomad Weekly&quot; discount of 15% on base rental.
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] text-stitch-primary underline cursor-pointer font-bold">How is this calculated?</span>
                    <Info className="text-muted-foreground cursor-help" size={14} />
                  </div>
                </div>
              </div>
            </div>

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
              disabled={cartLoading || !!loadingAddonId}
            >
              Proceed to Secure Payment
              <ArrowRight size={20} />
            </button>
            <div className="flex items-center justify-center gap-2 opacity-60">
              <Lock className="fill-current" size={12} />
              <span className="text-[10px] font-label tracking-wide uppercase">Powered by Razorpay • 100% secure</span>
            </div>
          </div>
        </aside>
      </main>

      <footer className="mt-20 border-t border-border/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <div className="size-5 text-stitch-on-background">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <span className="text-sm font-headline font-bold tracking-widest">MOTOHOM</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Motohom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
