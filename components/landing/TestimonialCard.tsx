"use client"

import { Star } from 'lucide-react'

interface TestimonialCardProps {
  name: string
  location: string
  quote: string
  image: string
  stats: string
}

export const TestimonialCard = ({ name, location, quote, image, stats }: TestimonialCardProps) => {
  return (
    // Double-Bezel: outer shell
    <div className="card-lift group h-full rounded-[2.5rem] bg-white/[0.02] p-1 ring-1 ring-white/[0.05] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:ring-stitch-primary/20">
      {/* Inner core */}
      <div className="relative h-full overflow-hidden rounded-[calc(2.5rem-0.25rem)] bg-surface-1 p-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-12">
        <p className="relative z-10 font-body text-lg italic leading-[1.8] text-stitch-on-surface-variant md:text-xl">
          &ldquo;{quote}&rdquo;
        </p>

        <div className="relative z-10 mt-8 flex items-center gap-5 border-t border-stitch-primary/20 pt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={name}
            className="h-16 w-16 rounded-full border border-stitch-primary/20 object-cover"
            src={image}
          />
          <div>
            <h4 className="font-headline text-lg font-semibold tracking-tight text-ink">{name}</h4>
            <div className="my-1 flex gap-0.5 text-stitch-primary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3 fill-current" />
              ))}
            </div>
            <p className="font-headline text-[10px] font-semibold uppercase tracking-[0.28em] text-stitch-primary/80">
              {stats} · {location}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
