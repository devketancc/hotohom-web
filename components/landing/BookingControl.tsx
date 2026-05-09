'use client'

import dynamic from 'next/dynamic'
import { BookingControlPlaceholder } from './BookingControlPlaceholder'

const BookingInteractive = dynamic(() => import('./BookingControlInner'), {
  ssr: false,
  loading: BookingControlPlaceholder,
})

/**
 * Interactive booking strip is client-only (`ssr: false`) so persisted store + selectors
 * never participate in SSR/hydration. Server + hydration always render `BookingControlPlaceholder`
 * via `loading`; the real widget mounts after load without hydrating against mismatched HTML.
 */
export function BookingControl() {
  return <BookingInteractive />
}
