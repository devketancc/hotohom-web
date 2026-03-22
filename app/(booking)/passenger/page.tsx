export default function PassengerDetailsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Passenger Details</h1>
      <p className="text-muted-foreground">Who is travelling with us?</p>
      
      <div className="space-y-4">
        {/* Form fields will go here */}
        <div className="h-64 rounded-xl border bg-card p-6 flex flex-col justify-center text-muted-foreground border-dashed">
          <p>Passenger Form Placeholder</p>
        </div>
      </div>
    </div>
  );
}
