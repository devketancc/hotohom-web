import { ReactNode } from 'react';
import Link from 'next/link';
import { ContextBar } from '@/components/booking/ContextBar';
import { Bell, HelpCircle } from 'lucide-react';
import Image from 'next/image';

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark flex flex-col min-h-screen bg-stitch-background text-stitch-on-background">
      {/* Premium Header */}
      <header className="bg-stitch-background border-b border-border/10 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter text-primary uppercase font-manrope">
            MOTOHOM
          </Link>
          
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="#" className="font-bold text-primary border-b-2 border-primary pb-1">Explore</Link>
            <Link href="#" className="font-bold text-muted-foreground hover:text-primary transition-colors">Bookings</Link>
            <Link href="#" className="font-bold text-muted-foreground hover:text-primary transition-colors">Concierge</Link>
          </nav>
          
          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-muted-foreground hover:bg-secondary rounded-lg transition-all p-2">
              <Bell size={20} />
            </button>
            <button className="text-muted-foreground hover:bg-secondary rounded-lg transition-all p-2">
              <HelpCircle size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border border-border/20">
              <img 
                alt="User Profile" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuPTvrpC2W1NqVgRX4t5GXy_LxH2Lqgm-MVG1u_C-5SIZfO6Nl9ZTyyXdCXom94DiEL-pfWTz1NZx3DtrTJObGmn_FPvWgZXzxDM1mQ7RoZYHKkUBpJV7ItVqyTWoGkziOnQsgS76lb60r-iw5qTSsq8eqs7wgRa7cNR3Q9sxegmGc8rwQkjDTQJa_LH_hx23-rRVYvlR5UBfwBI55Ulmw0ewBpP4Dkd1YRmTI4G7z7LaeugDT--VwW2GbOTEpuRD1c9H6yCCHsPU" 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Context Bar */}
      <ContextBar />

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer Space */}
      <div className="h-32"></div>
    </div>
  );
}
