'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { GalleryPageContent } from '@/components/gallery/GalleryPageContent';

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-stitch-background text-stitch-on-background">
      <Navbar />
      <GalleryPageContent />
      <Footer />
    </main>
  );
}
