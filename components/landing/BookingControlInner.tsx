'use client'

import { useState } from 'react'
import { ArrowRight, Minus, Plus, Users } from 'lucide-react'
import { HubSelector } from './HubSelector'
import { DatePicker } from './DatePicker'
import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/store/bookingStore'
import { useClickOutside } from '@/hooks/useClickOutside'
import {
  BOOKING_PANEL_CLASS,
  DATE_COLUMN_SHELL,
  GUESTS_COLUMN_SHELL,
  HUB_COLUMN_SHELL,
} from './booking-control-classes'

export default function BookingControlInner() {
  const router = useRouter()
  const { hub, dates, passengers, pets, setData } = useBookingStore()
  const [guestMenuOpen, setGuestMenuOpen] = useState(false)
  const guestsRef = useClickOutside<HTMLDivElement>(() => setGuestMenuOpen(false))

  const isValid = hub !== null && dates.start !== null && dates.end !== null

  const handleStartPlanning = () => {
    if (!isValid) return
    router.push('/select-caravan')
  }

  const updatePassengers = (value: number) => {
    setData({ passengers: Math.max(1, value) })
  }

  const updatePets = (value: number) => {
    setData({ pets: Math.max(0, value) })
  }

  return (
    <div className={BOOKING_PANEL_CLASS}>
      <div className={HUB_COLUMN_SHELL}>
        <HubSelector />
      </div>
      <div className={DATE_COLUMN_SHELL}>
        <DatePicker />
      </div>

      <div ref={guestsRef} className={GUESTS_COLUMN_SHELL}>
        <button
          type="button"
          onClick={() => setGuestMenuOpen((prev) => !prev)}
          className="w-full h-full flex flex-col items-start justify-center rounded-2xl px-5 hover:bg-white/[0.04] transition-all duration-300 text-left group"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stitch-on-surface-variant/70 mb-1.5 group-hover:text-stitch-primary-container transition-colors duration-300">
            Guests
          </span>
          <div className="flex items-center gap-2.5 min-w-0">
            <Users className="size-4 text-stitch-primary-container/85" />
            <span className="text-[15px] font-medium text-stitch-on-background truncate">
              {passengers} {passengers > 1 ? 'Guests' : 'Guest'}
              {pets > 0 ? `, ${pets} Pet${pets > 1 ? 's' : ''}` : ''}
            </span>
          </div>
        </button>

        {guestMenuOpen && (
          <div className="absolute bottom-[calc(100%+12px)] left-0 z-[100] w-[260px] rounded-2xl border border-white/10 bg-stitch-surface/90 p-4 backdrop-blur-2xl shadow-[0_28px_60px_-20px_rgba(0,0,0,0.65)] animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-stitch-on-surface-variant/80">
                  Guests
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updatePassengers(passengers - 1)}
                    className="inline-flex size-7 items-center justify-center rounded-full border border-white/15 text-stitch-on-background/85 transition-colors hover:bg-white/10"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-stitch-on-background">{passengers}</span>
                  <button
                    type="button"
                    onClick={() => updatePassengers(passengers + 1)}
                    className="inline-flex size-7 items-center justify-center rounded-full border border-white/15 text-stitch-on-background/85 transition-colors hover:bg-white/10"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-stitch-on-surface-variant/80">
                  Pets
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updatePets(pets - 1)}
                    className="inline-flex size-7 items-center justify-center rounded-full border border-white/15 text-stitch-on-background/85 transition-colors hover:bg-white/10"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-stitch-on-background">{pets}</span>
                  <button
                    type="button"
                    onClick={() => updatePets(pets + 1)}
                    className="inline-flex size-7 items-center justify-center rounded-full border border-white/15 text-stitch-on-background/85 transition-colors hover:bg-white/10"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleStartPlanning}
        disabled={!isValid}
        className="group md:ml-2 min-h-[74px] gradient-cta text-stitch-on-primary-container px-10 rounded-2xl font-headline font-semibold text-[12px] uppercase tracking-[0.2em] hover:brightness-[1.06] hover:-translate-y-px hover:shadow-[0_18px_48px_-18px_rgba(229,185,92,0.72)] active:translate-y-0 disabled:opacity-35 disabled:grayscale disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-500 ease-out flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0"
      >
        Start Planning
        <ArrowRight className="size-4 transition-transform duration-500 ease-out group-hover:translate-x-1" />
      </button>
    </div>
  )
}
