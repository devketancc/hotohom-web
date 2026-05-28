'use client'

import {
  BOOKING_PANEL_CLASS,
  DATE_COLUMN_SHELL,
  HUB_COLUMN_SHELL,
} from './booking-control-classes'

/** Static shell only — safe for SSR and for `next/dynamic` `loading` (matches server HTML). */
export function BookingControlPlaceholder() {
  return (
    <div className={BOOKING_PANEL_CLASS}>
      <div className={`${HUB_COLUMN_SHELL} bg-white/[0.03]`} />
      <div className={`${DATE_COLUMN_SHELL} bg-white/[0.03]`} />
      <div className="md:ml-2 min-h-[56px] md:min-h-[60px] lg:min-h-[68px] xl:min-h-[74px] shrink-0 rounded-2xl bg-[var(--color-gold)]/35 px-6 md:px-8 lg:px-10 md:flex md:min-w-fit md:items-center md:justify-center" />
    </div>
  )
}
