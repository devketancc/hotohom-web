export default function PaymentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Payment</h1>
      <p className="text-muted-foreground">Complete your booking securely via Razorpay.</p>
      
      <div className="space-y-4">
        <div className="h-64 rounded-xl border bg-card p-6 flex flex-col items-center justify-center text-muted-foreground border-dashed gap-4">
          <p>Payment Gateway Placeholder</p>
        </div>
      </div>
    </div>
  );
}
