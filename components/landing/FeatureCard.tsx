"use client"

import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
}

export const FeatureCard = ({ title, description, icon: Icon }: FeatureCardProps) => {
  return (
    <div className="p-12 bg-stitch-surface-highest/40 rounded-3xl border border-white/5 hover:border-stitch-primary-container/30 transition-all group hover:bg-stitch-surface-highest/60">
      <div className="w-16 h-16 rounded-2xl bg-stitch-primary/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
        <Icon className="text-stitch-primary-container size-9" />
      </div>
      <h3 className="text-2xl font-bold mb-6 font-headline">{title}</h3>
      <p className="text-stitch-on-surface-variant text-base leading-relaxed font-body">{description}</p>
    </div>
  )
}
