'use client'

import { ArrowRight } from 'lucide-react'
import { HubSelector } from './HubSelector'
import { DatePicker } from './DatePicker'
import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/store/bookingStore'
import {
  BOOKING_PANEL_CLASS,
  DATE_COLUMN_SHELL,
  HUB_COLUMN_SHELL,
} from './booking-control-classes'

export default function BookingControlInner() {
  const router = useRouter()
  const { hub, dates } = useBookingStore()

  const isValid = hub !== null && dates.start !== null && dates.end !== null

  const handleStartPlanning = () => {
    if (!isValid) return
    router.push('/select-caravan')
  }


  return (
    <div className={BOOKING_PANEL_CLASS}>
      <div className={HUB_COLUMN_SHELL}>
        <HubSelector />
      </div>
      <div className={DATE_COLUMN_SHELL}>
        <DatePicker />
      </div>

      <button
        onClick={handleStartPlanning}
        disabled={!isValid}
        className="group md:ml-2 min-h-[56px] md:min-h-[60px] lg:min-h-[68px] xl:min-h-[74px] gradient-cta text-stitch-on-primary-container px-6 md:px-8 lg:px-10 rounded-2xl font-headline font-semibold text-[12px] uppercase tracking-[0.2em] hover:brightness-[1.06] hover:-translate-y-px hover:shadow-[0_18px_48px_-18px_rgba(229,185,92,0.72)] active:translate-y-0 disabled:opacity-35 disabled:grayscale disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-500 ease-out flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0"
      >
        Start Planning
        <ArrowRight className="size-4 transition-transform duration-500 ease-out group-hover:translate-x-1" />
      </button>
    </div>
  )
}
