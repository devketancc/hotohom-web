"use client"

import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useBookingStore } from '@/store/bookingStore'
import { useClickOutside } from '@/hooks/useClickOutside'
import { formatBookingTravelWindow } from '@/utils/format'
import { DateRangePickerPanel } from '@/components/booking/DateRangePickerPanel'

export const DatePicker = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { dates } = useBookingStore()
  
  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false))

  return (
    <div ref={containerRef} className="flex-1 relative h-full">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full flex flex-col items-start justify-center rounded-2xl px-5 hover:bg-white/[0.04] transition-all duration-300 group text-left"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stitch-on-surface-variant/70 mb-1.5 group-hover:text-stitch-primary-container transition-colors duration-300">
          Travel Dates
        </span>
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="size-4 text-stitch-primary-container/85" />
          <span className="text-[15px] font-medium text-stitch-on-background truncate">
            {formatBookingTravelWindow(dates)}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 mb-6 z-[100] animate-in fade-in slide-in-from-bottom-4 zoom-in-95 self-start duration-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <DateRangePickerPanel onRangeComplete={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  )
}
