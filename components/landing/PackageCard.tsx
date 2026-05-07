"use client"

import Link from 'next/link'
import { Clock, ArrowUpRight } from 'lucide-react'

interface PackageCardProps {
  title: string
  duration: string
  location: string
  tag: string
  price: string
  image: string
  /** When set, the whole card navigates to package detail. */
  href?: string
}

export const PackageCard = ({ title, duration, location, tag, price, image, href }: PackageCardProps) => {
  const inner = (
    <>
      <div className="card-lift relative aspect-[4/5] overflow-hidden rounded-2xl mb-8 ring-1 ring-[var(--color-line)]">
        <img
          alt={title}
          className="w-full h-full object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          src={image}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stitch-background/85 via-stitch-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-end justify-center pb-12">
          <span className="text-stitch-on-background font-semibold tracking-[0.22em] uppercase text-[11px] flex items-center gap-2 font-headline">
            View details <ArrowUpRight className="size-4 text-stitch-primary-container" />
          </span>
        </div>
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="glass-card px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-stitch-primary-container font-headline">
            {location}
          </div>
          <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-white/80 self-start font-headline">
            {tag}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-start px-2">
        <div>
          <h3 className="text-3xl font-bold mb-3 group-hover:text-stitch-primary transition-[color,letter-spacing] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:tracking-tight font-headline">
            {title}
          </h3>
          <p className="text-stitch-on-surface-variant flex items-center gap-3 font-medium font-body">
            <Clock className="size-5 text-stitch-primary" />
            {duration}
          </p>
        </div>
        <div className="text-right">
          <span className="text-stitch-primary font-black text-2xl font-headline">{price}</span>
        </div>
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={href} className="group block cursor-pointer">
        {inner}
      </Link>
    )
  }

  return <div className="group cursor-pointer">{inner}</div>
}
