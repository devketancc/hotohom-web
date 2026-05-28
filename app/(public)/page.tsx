"use client"

import { Star } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/landing/Hero'
import { PackagesSection } from '@/components/landing/PackagesSection'
import { JourneyTimeline } from '@/components/landing/JourneyTimeline'
import { FleetExperience } from '@/components/landing/FleetExperience'
import { TestimonialCard } from '@/components/landing/TestimonialCard'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'
import { Reveal } from '@/components/shared/Reveal'
import { RevealStagger, RevealItem } from '@/components/shared/RevealStagger'

export default function PublicPage() {
  return (
    <main className="w-full bg-stitch-background text-stitch-on-background min-h-screen">
      <Navbar />
      <Hero />

      <PackagesSection />

      <JourneyTimeline />

      <FleetExperience />

      {/* Trust-Boosted Testimonials */}
      <section className="py-40 bg-zinc-950">
        <div className="max-w-screen-2xl mx-auto px-8">
          <Reveal as="div" className="text-center mb-24">
            <h2 className="text-5xl font-bold mb-6 font-headline">Real Traveler Stories</h2>
            <div className="flex justify-center gap-1 text-stitch-primary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-5 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-stitch-on-surface-variant font-bold uppercase tracking-widest text-xs font-headline">
              Rated 4.9/5 by 5,000+ explorers
            </p>
          </Reveal>
          <RevealStagger className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <RevealItem>
              <TestimonialCard 
                name="Julian Marc"
                location="Goa"
                stats="Coastal Expedition '23"
                quote="The booking experience was as premium as the caravan itself. Motohom thought of everything—from the solar-powered coffee machine to the pre-loaded offline maps. Truly a Tesla-level road trip experience."
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuC_kSJthIm3KhnzCDn-Tchbac-1-Rq51mGTCbfgLCVECw1GbHHy-StDnFQZHJeSWVlidXK0ERLuozhnKRfsvwq_OmFXkRMTrw6iTsthWeUhYEK1XFRV5n7xuWvKjfzDJOBDOvRydPpNpg8Ccm5NnypXGxSol0sxJcY1cWrIpacVHxB-wr4SxbbKZZsxMgjIl9sJWCJJfdAUkcEMcFkmqNY1tnJqr0bUh6joUS_Wnf1iKGkJ2UfZ1JYFA8NvJfhYLBg1qR6Q3B79aQw"
              />
            </RevealItem>
            <RevealItem>
              <TestimonialCard 
                name="Elena Rodriguez"
                location="Himachal"
                stats="Mountain Trek '24"
                quote="Traveling with our golden retriever used to be a challenge. Motohom's pet-friendly caravan made our Himalayan trip absolutely seamless. The layout was spacious and the heating system was incredible."
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuDPiEwQjKnD3ndczUcWxQxmqkgTGDG3spaC6sHD5rzXarubjv-uXVRkeM0cq0QHt3sTZgFlREZZ8elkp_ZXD7ap0mGCpZqVgcKHVAq9_tJ-6n00euxZWFUcEH8W7EhGkEZw3kXJlIQG8RA3XQkaB1rcagodDf0dBLnaNdp06L6xwZ2bZgPx4UsBIgfFCg8uiacvf42f-x9QfNRdjkHAK4b1nZ_CXv1K6nfdnxkMnwXgbCCcrOm-fmElZvEdQBcqsLhQTK4lLxmQEQo"
              />
            </RevealItem>
          </RevealStagger>
        </div>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}
