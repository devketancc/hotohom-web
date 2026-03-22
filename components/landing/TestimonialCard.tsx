"use client"

import { Star, Quote } from 'lucide-react'

interface TestimonialCardProps {
  name: string
  location: string
  quote: string
  image: string
  stats: string
}

export const TestimonialCard = ({ name, location, quote, image, stats }: TestimonialCardProps) => {
  return (
    <div className="bg-stitch-surface-highest/30 p-16 rounded-[40px] relative border border-white/5 hover:border-stitch-primary/20 transition-all group">
      <Quote className="text-stitch-primary/10 size-24 absolute top-8 right-12 transition-colors group-hover:text-stitch-primary/20" />
      <div className="flex items-center gap-6 mb-12 relative z-10">
        <img 
          alt={name} 
          className="w-20 h-20 rounded-full object-cover border-2 border-stitch-primary/20" 
          src={image}
        />
        <div>
          <h4 className="text-xl font-extrabold mb-1 font-headline">{name}</h4>
          <div className="flex gap-0.5 text-stitch-primary mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-3 fill-current" />
            ))}
          </div>
          <p className="text-xs text-stitch-primary/80 tracking-[0.2em] font-black uppercase font-headline">
            {stats} • {location}
          </p>
        </div>
      </div>
      <p className="text-stitch-on-surface-variant text-xl italic leading-[1.8] font-body relative z-10">
        "{quote}"
      </p>
    </div>
  )
}
