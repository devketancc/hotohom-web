/** Shared layout tokens for hero booking shell + interactive widget */
export const BOOKING_PANEL_CLASS =
  'luxury-glass luxury-glass-focus booking-panel-reflection rounded-3xl p-2 md:p-2.5 flex flex-col gap-2 md:h-[96px] md:flex-row md:items-stretch md:gap-0 transition-all duration-500 ease-out md:hover:-translate-y-0.5 md:hover:shadow-[0_26px_72px_-30px_rgba(0,0,0,0.75)]'

/** First segment — rounded inset pad only */
export const HUB_COLUMN_SHELL =
  'flex-1 flex min-h-[74px] items-stretch rounded-2xl'

/**
 * Travel dates — md+ left border must stay vertical (no rounded corners on the left).
 * Mobile stays fully rounded when stacked.
 */
export const DATE_COLUMN_SHELL =
  'flex-1 flex min-h-[74px] items-stretch rounded-2xl md:rounded-l-none md:rounded-r-2xl md:border-l-2 md:border-[var(--color-line-gold)]'

/** Guests — straight divider; md row keeps square corners until inner buttons shape hover surface */
export const GUESTS_COLUMN_SHELL =
  'relative flex-1 min-h-[74px] rounded-2xl md:rounded-none md:border-l-2 md:border-[var(--color-line-gold)]'
