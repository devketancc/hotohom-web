'use client';

import { Navbar } from '@/components/layout/Navbar';
import { PackagesSection } from '@/components/landing/PackagesSection';
import { Footer } from '@/components/landing/Footer';

export default function PackagesPage() {
  return (
    <main className="bg-stitch-background text-stitch-on-background min-h-screen">
      <Navbar />
      <div className="pt-28" />
      <PackagesSection />
      <Footer />
    </main>
  );
}
