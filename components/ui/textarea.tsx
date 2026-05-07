import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface-1)]/60 px-3 py-2 text-base transition-[border-color,box-shadow,background-color] outline-none placeholder:text-[color:var(--color-ink-faint)] focus-visible:border-[var(--color-gold)]/60 focus-visible:ring-[3px] focus-visible:ring-[color:var(--color-gold)]/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
