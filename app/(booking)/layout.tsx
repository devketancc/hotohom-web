import { ReactNode } from 'react';

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      {/* Top context bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center mx-auto px-4 md:px-8">
          <span className="font-bold text-xl tracking-tight">Motohom Booking</span>
        </div>
      </header>

      {/* Main layout with sticky summary */}
      <div className="container mx-auto px-4 md:px-8 flex-1 items-start md:grid mt-4 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_380px] gap-6 pb-12">
        <main className="flex flex-col w-full min-w-0">
          {children}
        </main>
        
        {/* Placeholder for sticky summary */}
        <aside className="hidden md:block">
          <div className="sticky top-24 rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-4">
              <h3 className="font-semibold leading-none tracking-tight">Booking Summary</h3>
              <p className="text-sm text-muted-foreground">Your options and final price will appear here.</p>
              <div className="h-40 flex items-center justify-center border border-dashed rounded bg-muted/50 text-muted-foreground text-sm">
                Summary Component Placeholder
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
