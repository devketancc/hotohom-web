import Link from 'next/link';

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/journeys"
          className="mb-4 inline-flex font-body text-sm text-stitch-on-surface-variant transition-colors hover:text-stitch-primary-container"
        >
          ← Back to journeys
        </Link>
        <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-stitch-primary-container">
          Booking
        </p>
        <h1 className="mt-1 border-b border-white/10 pb-4 font-headline text-3xl font-black uppercase tracking-tight text-stitch-on-background">
          Details #{id}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card space-y-4 rounded-xl p-6">
          <h3 className="font-headline text-lg font-bold text-stitch-on-background">Trip information</h3>
          <div className="space-y-2 font-body text-sm text-stitch-on-surface-variant">
            <p>
              <span className="font-semibold text-stitch-on-background">Route:</span> Mumbai to Pune
            </p>
            <p>
              <span className="font-semibold text-stitch-on-background">Dates:</span> Oct 10 - Oct 12, 2026
            </p>
            <p>
              <span className="font-semibold text-stitch-on-background">Caravan:</span> Luxury Class Alpha
            </p>
          </div>
        </div>

        <div className="glass-card space-y-4 rounded-xl p-6">
          <h3 className="font-headline text-lg font-bold text-stitch-on-background">Payment summary</h3>
          <div className="space-y-2 font-body text-sm text-stitch-on-surface-variant">
            <p className="flex justify-between">
              <span>Base price</span> <span className="text-stitch-on-background">₹12,000</span>
            </p>
            <p className="flex justify-between">
              <span>Taxes</span> <span className="text-stitch-on-background">₹2,160</span>
            </p>
            <div className="flex justify-between border-t border-white/10 pt-2 font-headline font-bold text-stitch-on-background">
              <span>Total</span> <span>₹14,160</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
