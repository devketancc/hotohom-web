import Link from 'next/link';

export default function DashboardJourneysPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-8 space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Your Journeys</h1>
        <Link 
          href="/select-caravan"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          New Booking
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder list of journeys */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition flex flex-col gap-4">
          <div>
            <h3 className="font-semibold text-lg">Booking #1234</h3>
            <p className="text-sm text-muted-foreground bg-muted w-fit px-2 py-0.5 mt-1 rounded">Confirmed</p>
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            Mumbai to Pune
            <br/>Oct 10 - Oct 12, 2026
          </div>
          <Link href="/booking/1234" className="text-sm text-primary font-medium hover:underline">
            View details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
