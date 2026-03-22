"use client"

import { ChevronLeft, ChevronRight, Home, Route, Heart, Wallet, Star } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/landing/Hero'
import { PackageCard } from '@/components/landing/PackageCard'
import { JourneyTimeline } from '@/components/landing/JourneyTimeline'
import { FeatureCard } from '@/components/landing/FeatureCard'
import { TestimonialCard } from '@/components/landing/TestimonialCard'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'

export default function PublicPage() {
  const packages = [
    {
      title: "Goa Coastal Ride",
      duration: "5 Days / 4 Nights • Scenic coastal drive",
      location: "Goa, West Coast",
      tag: "Best for Weekends",
      price: "$1,200",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-Zz7NSPRFJjPJ7-rf1Bk_NlCZVRtk6v-k9pZwQ2Ygrl3X7I9a_3XibTdGpD_rteUKzeBBLYyHmkoLNPKrsWobHWUaBLQCTAY3rbAxZkW-DKaXjPJgWRMCZfUbdZ82DYMwJ9pOzKhLauvJ2CH3xbkkji-ozZyuB7SNuB1CNtVSogV8BbzQ8iqKik61jQ805Z6ELvr1ZNbfqQKVqJyRCmWj8zObaoaXmxK9gbbc3ZmSkxiOboKWAIVHLSLIPz8-aQ7P7gnEuo3YCog"
    },
    {
      title: "Himalayan Heights",
      duration: "8 Days / 7 Nights • Mountain pass climb",
      location: "Himalayas, North",
      tag: "Adventure Tier",
      price: "$2,450",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcEwHiTjoZgcAgsMWB8M70Fvjg4xcZ9MS0Xu-qNxA9LKA_38cluECAyzEn4AFwLrLbVbY4X4JQ1YtuU0t-fKMRnRIqlYuMk-ZouttD3-hD2qJ55EbtzrlA9h9Q8MBcdMBcEY6M5M-CbOYm7rd_zRtRgn7XfkyAS6cofNL4o6Ty-rsZzVYb11U_qrePUz72GrvvJjGY0oIO8bDEF1JdVBsuVKIXspkb5A9hMcxZdfx0s2icE_9e4K6zePA28b-u3NI1JQ4Du6M1bec"
    },
    {
      title: "Royal Sands",
      duration: "6 Days / 5 Nights • Heritage trail exploration",
      location: "Rajasthan, Desert",
      tag: "Cultural Immersion",
      price: "$1,800",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCa9pLuBMVMuEDiV7onK6XiFat6s_0aZ36ekTKoAjPWfZfswtOYOb8Me1fmzpshOk75_P1fW4SBz2OXMgXkmuG3TMo5Ydj08k3a4_kDTjZ6lYsLA7_aCDyMR3DRT0RZrzsCH4y8KkCW6LXWDbqCuqcizTPOKbYwV12gbwyamq5kwUklGaKRSp2DX_3j84i_QYKdfn2ZDHJt4fF95kmeQD9kGaEIs20r7T5DHsH9iunGYktg5bXwhbXvvenEq3D8fMoxL1qa3N0KFyA"
    }
  ]

  const features = [
    {
      title: "Stay in Comfort Anywhere",
      description: "Turn any scenic vista into your living room with state-of-the-art kitchens and luxury bedding.",
      icon: Home
    },
    {
      title: "Go Wherever the Road Takes You",
      description: "Ditch the rigid itineraries. Change your destination mid-trip with our real-time planning app.",
      icon: Route
    },
    {
      title: "Bring the Whole Family",
      description: "No member left behind. Our pet-friendly fleet ensures your furry friends travel in luxury too.",
      icon: Heart
    },
    {
      title: "Honest, Clear Pricing",
      description: "No surprises on the road. Insurance, taxes, and premium amenities are always included.",
      icon: Wallet
    }
  ]

  return (
    <main className="bg-stitch-background text-stitch-on-background min-h-screen">
      <Navbar />
      <Hero />

      {/* Curated Packages */}
      <section className="py-40 bg-stitch-background overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">
              <span className="text-stitch-primary uppercase tracking-[0.4em] text-xs font-black mb-6 block font-headline">Signature Journeys</span>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight font-headline">Handpicked Escapes</h2>
              <p className="mt-6 text-stitch-on-surface-variant text-lg font-body">Each package is designed by travel experts to ensure you see the hidden gems of every region.</p>
            </div>
            <div className="flex gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
              <button className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:border-stitch-primary hover:text-stitch-primary transition-all group">
                <ChevronLeft className="text-stitch-on-surface group-hover:text-stitch-primary" />
              </button>
              <button className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:border-stitch-primary hover:text-stitch-primary transition-all group">
                <ChevronRight className="text-stitch-on-surface group-hover:text-stitch-primary" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
            {packages.map((pkg, idx) => (
              <PackageCard key={idx} {...pkg} />
            ))}
          </div>
        </div>
      </section>

      <JourneyTimeline />

      {/* Experiential Feature Grid */}
      <section className="py-40">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust-Boosted Testimonials */}
      <section className="py-40 bg-zinc-950">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="text-center mb-24 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <h2 className="text-5xl font-bold mb-6 font-headline">Real Traveler Stories</h2>
            <div className="flex justify-center gap-1 text-stitch-primary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-5 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-stitch-on-surface-variant font-bold uppercase tracking-widest text-xs font-headline">
              Rated 4.9/5 by 5,000+ explorers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-100">
            <TestimonialCard 
              name="Julian Marc"
              location="Goa"
              stats="Coastal Expedition '23"
              quote="The booking experience was as premium as the caravan itself. Motohom thought of everything—from the solar-powered coffee machine to the pre-loaded offline maps. Truly a Tesla-level road trip experience."
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuC_kSJthIm3KhnzCDn-Tchbac-1-Rq51mGTCbfgLCVECw1GbHHy-StDnFQZHJeSWVlidXK0ERLuozhnKRfsvwq_OmFXkRMTrw6iTsthWeUhYEK1XFRV5n7xuWvKjfzDJOBDOvRydPpNpg8Ccm5NnypXGxSol0sxJcY1cWrIpacVHxB-wr4SxbbKZZsxMgjIl9sJWCJJfdAUkcEMcFkmqNY1tnJqr0bUh6joUS_Wnf1iKGkJ2UfZ1JYFA8NvJfhYLBg1qR6Q3B79aQw"
            />
            <TestimonialCard 
              name="Elena Rodriguez"
              location="Himachal"
              stats="Mountain Trek '24"
              quote="Traveling with our golden retriever used to be a challenge. Motohom's pet-friendly caravan made our Himalayan trip absolutely seamless. The layout was spacious and the heating system was incredible."
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuDPiEwQjKnD3ndczUcWxQxmqkgTGDG3spaC6sHD5rzXarubjv-uXVRkeM0cq0QHt3sTZgFlREZZ8elkp_ZXD7ap0mGCpZqVgcKHVAq9_tJ-6n00euxZWFUcEH8W7EhGkEZw3kXJlIQG8RA3XQkaB1rcagodDf0dBLnaNdp06L6xwZ2bZgPx4UsBIgfFCg8uiacvf42f-x9QfNRdjkHAK4b1nZ_CXv1K6nfdnxkMnwXgbCCcrOm-fmElZvEdQBcqsLhQTK4lLxmQEQo"
            />
          </div>
        </div>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}
