"use client"

import { useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { locationService } from '@/services/location.service'
import { LocationHub } from '@/types/location'
import { useBookingStore } from '@/store/bookingStore'
import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/lib/utils'

export const HubSelector = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { hub, hubName, setData } = useBookingStore()
  
  const { data: hubs, isLoading } = useQuery<LocationHub[]>({
    queryKey: ['hubs'],
    queryFn: () => locationService.getHubs(),
    staleTime: 1000 * 60 * 30, // Cache hubs for 30 minutes
  })

  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false))

  return (
    <div ref={containerRef} className="flex-1 relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full flex flex-col items-start justify-center px-4 hover:bg-white/5 transition-colors group text-left"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stitch-on-surface-variant mb-1 group-hover:text-stitch-primary transition-colors">Pick-up Hub</span>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-stitch-primary" />
          <span className="text-sm font-bold truncate">
            {hubName || "Select Hub"}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-6 bg-zinc-900 border border-white/10 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] z-[100] overflow-hidden animate-in fade-in slide-in-from-bottom-4 zoom-in-95 self-start duration-200">
          {isLoading ? (
            <div className="p-8 flex flex-col items-center justify-center gap-3">
              <Loader2 className="size-6 text-stitch-primary animate-spin" />
              <span className="text-xs font-medium text-stitch-on-surface-variant">Searching for hubs...</span>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {hubs?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setData({ hub: item.id, hubName: item.name })
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full px-5 py-4 flex flex-col items-start gap-1 hover:bg-stitch-primary hover:text-stitch-on-primary transition-colors border-b border-white/5 last:border-0 text-left",
                    hub === item.id && "bg-stitch-primary/10 text-stitch-primary"
                  )}
                >
                  <span className="font-bold text-sm uppercase tracking-wider">{item.name}</span>
                  <span className="text-[10px] opacity-70 font-medium">{item.city} • {item.address ?? item.formatted_address ?? ''}</span>
                </button>
              ))}
              {(!hubs || hubs.length === 0) && !isLoading && (
                <div className="p-8 text-center text-xs text-stitch-on-surface-variant font-medium">
                  No hubs found in your area.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
