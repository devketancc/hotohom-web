"use client"

import Link from 'next/link'
import { Instagram, Facebook, Youtube, Phone, Mail } from 'lucide-react'
import { MotohomLogo } from '@/components/brand/MotohomLogo'

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Explore',
    links: [
      { label: 'Experiences', href: '/packages' },
      { label: 'Destinations', href: '/about' },
      { label: 'Fleet', href: '/fleet' },
      { label: 'Journal', href: '/journal' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Partners', href: '/about' },
      { label: 'Careers', href: '/about' },
      { label: 'Contact Us', href: '/support' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'FAQs', href: '/support' },
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
]

export const Footer = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-surface-0">
      <div className="mx-auto max-w-screen-2xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-flex transition-opacity hover:opacity-90">
              <MotohomLogo className="h-8 w-auto max-w-[180px]" blendOnDark />
            </Link>
            <p className="mt-4 max-w-xs font-body text-sm text-ink-muted">
              Not just travel. A way of living.
            </p>
            <div className="mt-6 flex gap-4">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-full border border-white/[0.08] text-ink-muted transition-colors hover:border-gold/40 hover:text-gold"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
                {col.heading}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-ink-muted transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
              Contact
            </h3>
            <ul className="mt-5 space-y-3 font-body text-sm text-ink-muted">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-ink-faint" />
                +91 88888 88888
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-ink-faint" />
                hello@motohom.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/[0.06] pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            © {new Date().getFullYear()} MotoHom. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
