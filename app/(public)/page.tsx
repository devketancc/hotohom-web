import Link from 'next/link';

export default function PublicPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8 p-4">
      <h1 className="text-4xl font-bold tracking-tight lg:text-5xl border-b pb-4">
        Welcome to Motohom
      </h1>
      <p className="text-xl text-muted-foreground text-center max-w-2xl">
        A premium booking platform for your caravan journey.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/select-caravan"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Book Now
        </Link>
        <Link 
          href="/journeys"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          View Dashboard
        </Link>
      </div>
    </div>
  );
}
