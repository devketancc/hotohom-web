"use client"

import { ArrowRight } from 'lucide-react'
import { HubSelector } from './HubSelector'
import { DatePicker } from './DatePicker'
import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/store/bookingStore'

export const BookingControl = () => {
  const router = useRouter()
  const { hub, dates } = useBookingStore()

  const isValid = hub !== null && dates.start !== null && dates.end !== null

  const handleStartPlanning = () => {
    if (!isValid) return
    router.push('/select-caravan')
  }

  return (
    <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-2xl h-24 p-2.5 flex items-stretch gap-1 booking-control-focus">
      <HubSelector />
      <DatePicker />

      <button 
        onClick={handleStartPlanning}
        disabled={!isValid}
        className="gradient-cta text-stitch-on-primary-container px-10 py-5 md:py-4 rounded-lg font-headline font-bold text-sm uppercase tracking-widest hover:brightness-110 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
      >
        Start Planning
        <ArrowRight className="size-5" />
      </button>
    </div>
  )
}
