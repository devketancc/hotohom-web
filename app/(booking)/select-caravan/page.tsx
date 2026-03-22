export default function SelectCaravanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Select Caravan</h1>
      <p className="text-muted-foreground">Choose the perfect caravan for your journey.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Caravan choices will go here */}
        <div className="h-64 rounded-xl border bg-card p-6 flex items-center justify-center text-muted-foreground border-dashed">
          Caravan Card 1
        </div>
        <div className="h-64 rounded-xl border bg-card p-6 flex items-center justify-center text-muted-foreground border-dashed">
          Caravan Card 2
        </div>
      </div>
    </div>
  );
}
