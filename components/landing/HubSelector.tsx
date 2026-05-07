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
        className="w-full h-full flex flex-col items-start justify-center rounded-2xl px-5 hover:bg-white/[0.04] transition-all duration-300 group text-left"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stitch-on-surface-variant/70 mb-1.5 group-hover:text-stitch-primary-container transition-colors duration-300">
          Destination
        </span>
        <div className="flex items-center gap-2.5 min-w-0">
          <MapPin className="size-4 text-stitch-primary-container/85" />
          <span className="text-[15px] font-medium text-stitch-on-background truncate">
            {hubName || "Select Hub"}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-6 z-[100] overflow-hidden animate-in fade-in slide-in-from-bottom-4 zoom-in-95 self-start duration-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <HubPickerPanel
            selectedHubId={hub}
            onSelect={(item) => {
              setData({
                hub: item.id,
                hubName: item.name,
                hubLocation: {
                  lat: item.coordinates.lat,
                  lng: item.coordinates.lng,
                },
              })
              setIsOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
