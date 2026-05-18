'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { CommunityPageContent } from '@/components/community/CommunityPageContent';

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-stitch-background text-stitch-on-background">
      <Navbar />
      <CommunityPageContent />
      <Footer />
    </main>
  );
}
