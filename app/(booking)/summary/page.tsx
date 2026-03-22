export default function SummaryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Booking Summary</h1>
      <p className="text-muted-foreground">Review your booking before proceeding to payment.</p>
      
      <div className="space-y-4">
        <div className="min-h-[300px] rounded-xl border bg-card p-6 flex items-center justify-center text-muted-foreground border-dashed">
          Summary and Confirmation Content 
        </div>
      </div>
    </div>
  );
}
