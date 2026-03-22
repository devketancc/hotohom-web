"use client"

import { MapPin, Calendar, Users, ArrowRight } from 'lucide-react'

export const BookingControl = () => {
  return (
    <div className="glass-card p-4 md:p-2 rounded-xl flex flex-col md:flex-row items-stretch md:items-center gap-2">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Pick Up Hub */}
        <div className="px-6 py-3 flex flex-col justify-center hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
          <span className="text-[10px] uppercase tracking-widest text-stitch-primary-container font-bold mb-1 font-headline">
            Pick Up Hub
          </span>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-stitch-on-surface-variant" />
            <span className="text-stitch-on-surface font-medium font-body">Select Location</span>
          </div>
        </div>

        {/* Travel Dates */}
        <div className="px-6 py-3 flex flex-col justify-center hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-y md:border-y-0 md:border-x border-stitch-outline/20">
          <span className="text-[10px] uppercase tracking-widest text-stitch-primary-container font-bold mb-1 font-headline">
            Travel Dates
          </span>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-stitch-on-surface-variant" />
            <span className="text-stitch-on-surface font-medium font-body">Add Dates</span>
          </div>
        </div>

        {/* Travelers */}
        <div className="px-6 py-3 flex flex-col justify-center hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
          <span className="text-[10px] uppercase tracking-widest text-stitch-primary-container font-bold mb-1 font-headline">
            Travelers
          </span>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-stitch-on-surface-variant" />
            <span className="text-stitch-on-surface font-medium font-body">2 Adults, 1 Child</span>
          </div>
        </div>
      </div>

      <button className="gradient-cta text-stitch-on-primary-container px-10 py-5 md:py-4 rounded-lg font-headline font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
        Start Planning
        <ArrowRight className="size-5" />
      </button>
    </div>
  )
}
