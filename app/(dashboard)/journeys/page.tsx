import Link from 'next/link';

export default function DashboardJourneysPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-stitch-primary-container">
            Journeys
          </p>
          <h1 className="font-headline text-3xl font-black uppercase tracking-tight text-stitch-on-background">
            Your trips
          </h1>
          <p className="mt-2 font-body text-sm text-stitch-on-surface-variant">
            Upcoming and past Motohom journeys.
          </p>
        </div>
        <Link
          href="/select-caravan"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-md px-5 font-headline text-sm font-bold uppercase tracking-wide gradient-cta text-stitch-on-primary shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          New booking
        </Link>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card flex flex-col gap-4 rounded-xl p-6 transition-shadow hover:shadow-xl">
          <div>
            <h3 className="font-headline text-lg font-bold text-stitch-on-background">Booking #1234</h3>
            <p className="mt-2 inline-flex rounded-full bg-stitch-primary/15 px-2.5 py-0.5 font-body text-xs font-semibold text-stitch-primary-container">
              Confirmed
            </p>
          </div>
          <div className="flex-1 font-body text-sm leading-relaxed text-stitch-on-surface-variant">
            Mumbai to Pune
            <br />
            Oct 10 - Oct 12, 2026
          </div>
          <Link
            href="/booking/1234"
            className="font-body text-sm font-semibold text-stitch-primary-container transition-colors hover:underline"
          >
            View details →
          </Link>
        </div>
      </div>
    </div>
  );
}
