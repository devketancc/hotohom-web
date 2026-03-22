"use client"

import Link from 'next/link'
import { Globe, Share2, Mail } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="bg-slate-900 w-full pt-20 pb-12 border-t border-white/5">
      <div className="max-w-screen-2xl mx-auto px-8 flex flex-col items-center">
        <Link href="/" className="text-2xl font-bold text-stitch-primary-container mb-6 block font-headline">
          Motohom
        </Link>
        <div className="flex flex-wrap justify-center gap-12 mb-16">
          <Link href="/privacy" className="font-body text-sm text-slate-400 hover:text-stitch-primary-container transition-all">Privacy Policy</Link>
          <Link href="/terms" className="font-body text-sm text-slate-400 hover:text-stitch-primary-container transition-all">Terms of Service</Link>
          <Link href="/cookies" className="font-body text-sm text-slate-400 hover:text-stitch-primary-container transition-all">Cookie Policy</Link>
          <Link href="/support" className="font-body text-sm text-slate-400 hover:text-stitch-primary-container transition-all">Support</Link>
        </div>
        <div className="flex gap-8 mb-16">
          <Link href="#" className="text-slate-400 hover:text-stitch-primary-container transition-all">
            <Globe className="size-6" />
          </Link>
          <Link href="#" className="text-slate-400 hover:text-stitch-primary-container transition-all">
            <Share2 className="size-6" />
          </Link>
          <Link href="#" className="text-slate-400 hover:text-stitch-primary-container transition-all">
            <Mail className="size-6" />
          </Link>
        </div>
        <p className="font-body text-[10px] text-slate-500 tracking-[0.3em] uppercase">
          © {new Date().getFullYear()} Motohom. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
