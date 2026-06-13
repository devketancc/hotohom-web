"use client"

import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/landing/Hero'
import { ConciergeBand } from '@/components/landing/ConciergeBand'
import { ValueStrip } from '@/components/landing/ValueStrip'
import { ExperiencesShowcase } from '@/components/landing/ExperiencesShowcase'
import { FleetLineup } from '@/components/landing/FleetLineup'
import { Partners } from '@/components/landing/Partners'
import { WhyMotohom } from '@/components/landing/WhyMotohom'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'

export default function PublicPage() {
  return (
    <main className="w-full bg-stitch-background text-stitch-on-background min-h-screen">
      <Navbar />
      <Hero />
      <ConciergeBand />
      <ValueStrip />
      <ExperiencesShowcase />
      <FleetLineup />
      <Partners />
      <WhyMotohom />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
