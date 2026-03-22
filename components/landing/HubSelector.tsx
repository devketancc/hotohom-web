"use client"

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useBookingStore } from '@/store/bookingStore'
import { useClickOutside } from '@/hooks/useClickOutside'
import { HubPickerPanel } from '@/components/booking/HubPickerPanel'

export const HubSelector = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { hub, hubName, setData } = useBookingStore()

  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false))

  return (
    <div ref={containerRef} className="flex-1 relative">
      <button 
        type="button"
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
        <div className="absolute bottom-full left-0 w-full mb-6 z-[100] overflow-hidden animate-in fade-in slide-in-from-bottom-4 zoom-in-95 self-start duration-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <HubPickerPanel
            selectedHubId={hub}
            onSelect={(item) => {
              setData({ hub: item.id, hubName: item.name })
              setIsOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
