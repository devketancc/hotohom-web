"use client"

import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
}

export const FeatureCard = ({ title, description, icon: Icon }: FeatureCardProps) => {
  return (
    <div className="card-lift relative h-full p-12 bg-stitch-surface-highest/40 rounded-3xl border border-white/5 hover:border-stitch-primary-container/30 group hover:bg-stitch-surface-highest/60 transition-[transform,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
      <div className="relative w-16 h-16 rounded-2xl bg-stitch-primary/10 flex items-center justify-center mb-10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(229,185,92,0.32), transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
        <Icon className="relative text-stitch-primary-container size-9" />
      </div>
      <h3 className="text-2xl font-bold mb-6 font-headline">{title}</h3>
      <p className="text-stitch-on-surface-variant text-base leading-relaxed font-body">{description}</p>
    </div>
  )
}
