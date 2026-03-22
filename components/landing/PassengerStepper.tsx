"use client"

import { useState } from 'react'
import { Users, Minus, Plus } from 'lucide-react'
import { useBookingStore } from '@/store/bookingStore'
import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/lib/utils'

export const PassengerStepper = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { passengers, setData } = useBookingStore()
  
  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false))

  const updateCount = (newCount: number) => {
    if (newCount >= 1 && newCount <= 10) {
      setData({ passengers: newCount })
    }
  }

  return (
    <div ref={containerRef} className="flex-1 relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full flex flex-col items-start justify-center px-4 hover:bg-white/5 transition-colors group text-left"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stitch-on-surface-variant mb-1 group-hover:text-stitch-primary transition-colors">Travelers</span>
        <div className="flex items-center gap-2">
          <Users className="size-4 text-stitch-primary" />
          <span className="text-sm font-bold truncate">
            {passengers} {passengers === 1 ? 'Adult' : 'Adults'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 w-[240px] mb-6 bg-zinc-900 border border-white/10 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] z-[100] p-6 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 self-start duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold uppercase tracking-wider">Adults</span>
              <span className="text-[10px] font-medium text-stitch-on-surface-variant">Ages 13 or above</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => updateCount(passengers - 1)}
                disabled={passengers <= 1}
                className="size-8 rounded-lg border border-white/10 flex items-center justify-center hover:border-stitch-primary hover:text-stitch-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <Minus className="size-4" />
              </button>
              <span className="text-sm font-black w-4 text-center">{passengers}</span>
              <button 
                onClick={() => updateCount(passengers + 1)}
                disabled={passengers >= 10}
                className="size-8 rounded-lg border border-white/10 flex items-center justify-center hover:border-stitch-primary hover:text-stitch-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 text-[10px] font-medium text-stitch-on-surface-variant text-center">
            Max 10 travelers per journey
          </div>
        </div>
      )}
    </div>
  )
}
