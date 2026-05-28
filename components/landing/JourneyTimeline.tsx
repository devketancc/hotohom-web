"use client"

import { Compass, Map, Star } from 'lucide-react'
import { Reveal } from '@/components/shared/Reveal'
import { RevealStagger, RevealItem } from '@/components/shared/RevealStagger'

export const JourneyTimeline = () => {
  const steps = [
    {
      id: 1,
      title: "Choose When & Where",
      description: "Select your travel window and pick one of our strategically located hubs nationwide.",
      icon: Compass
    },
    {
      id: 2,
      title: "Plan Your Journey",
      description: "Use our digital concierge to curate stops, campsites, and local activities tailored to your pace.",
      icon: Map
    },
    {
      id: 3,
      title: "Travel & Enjoy",
      description: "Pick up your premium caravan and hit the road with 24/7 support and unlimited freedom.",
      icon: Star
    }
  ]

  return (
    <section className="section-ambient-cool py-40 bg-zinc-900 border-y border-white/5 relative">
      <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
        <Reveal as="div" className="text-center mb-32">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight font-headline">The Journey Path</h2>
          <p className="text-stitch-on-surface-variant text-xl max-w-2xl mx-auto font-body">
            Three simple steps from your front door to the open road.
          </p>
        </Reveal>

        <div className="relative">
          {/* Drifting gradient connecting line */}
          <div
            aria-hidden
            className="timeline-connector-sweep hidden lg:block absolute top-[60px] left-[15%] right-[15%] h-px opacity-60"
          />

          <RevealStagger className="grid grid-cols-1 lg:grid-cols-3 gap-24 relative">
            {steps.map((step) => (
              <RevealItem key={step.id} className="flex flex-col items-center text-center group">
                <div className="ring-pulse-gold w-32 h-32 rounded-3xl bg-stitch-background border border-stitch-primary/20 flex items-center justify-center mb-10 shadow-2xl relative transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2">
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-stitch-primary-container text-stitch-on-primary-container font-black flex items-center justify-center text-xl font-headline">
                    {step.id}
                  </div>
                  <step.icon className="size-16 text-stitch-primary" />
                </div>
                <h3 className="text-2xl font-extrabold mb-6 font-headline">{step.title}</h3>
                <p className="text-stitch-on-surface-variant text-lg leading-relaxed max-w-sm font-body">
                  {step.description}
                </p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </div>
    </section>
  )
}
