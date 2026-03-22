"use client"

import { ArrowRight } from 'lucide-react'
import { HubSelector } from './HubSelector'
import { DatePicker } from './DatePicker'
import { PassengerStepper } from './PassengerStepper'
import { useBookingStore } from '@/store/bookingStore'

export const BookingControl = () => {
  const { hub, hubName, dates, passengers } = useBookingStore()

  const isValid = hub !== null && dates.start !== null && dates.end !== null && passengers >= 1
  
  const handleStartPlanning = () => {
    if (!isValid) return
    
    const selectedData = {
      hub: {
        id: hub,
        name: hubName
      },
      dates: {
        from: dates.start,
        to: dates.end,
        totalDays: dates.totalDays
      },
      passengers
    }
    
    console.log('🚀 Finalizing Selection:', selectedData)
    // Trigger any callback here if provided as prop
    alert(`Success! Selected ${hubName} for ${dates.totalDays} days with ${passengers} traveler(s).`)
  }

  return (
    <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-2xl h-24 p-2.5 flex items-stretch gap-1 booking-control-focus">
      <HubSelector />
      <DatePicker />
      <PassengerStepper />
      
      <button 
        onClick={handleStartPlanning}
        disabled={!isValid}
        className="gradient-cta text-stitch-on-primary-container px-10 py-5 md:py-4 rounded-lg font-headline font-bold text-sm uppercase tracking-widest hover:brightness-110 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap"
      >
        Start Planning
        <ArrowRight className="size-5" />
      </button>
    </div>
  )
}
