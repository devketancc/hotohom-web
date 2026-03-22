import Link from 'next/link';

// Use Promise to access the params correctly in app router
export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 space-y-8">
      <div>
        <Link href="/journeys" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
          &larr; Back to journeys
        </Link>
        <h1 className="text-3xl font-bold tracking-tight border-b pb-4">Booking Details #{id}</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg">Trip Information</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Route:</strong> Mumbai to Pune</p>
            <p><strong>Dates:</strong> Oct 10 - Oct 12, 2026</p>
            <p><strong>Caravan:</strong> Luxury Class Alpha</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg">Payment Summary</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="flex justify-between"><span>Base Price:</span> <span>₹12,000</span></p>
            <p className="flex justify-between"><span>Taxes:</span> <span>₹2,160</span></p>
            <div className="border-t pt-2 font-medium flex justify-between text-foreground">
              <span>Total:</span> <span>₹14,160</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
