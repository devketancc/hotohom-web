"use client"

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center px-8 py-6 max-w-screen-2xl mx-auto">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-stitch-primary-container">
          Motohom
        </Link>
        <div className="hidden md:flex space-x-10 items-center">
          <Link 
            href="/destinations" 
            className="font-headline tracking-tight text-sm font-medium uppercase text-stitch-primary-container border-b-2 border-stitch-primary-container pb-1"
          >
            Destinations
          </Link>
          <Link 
            href="/fleet" 
            className="font-headline tracking-tight text-sm font-medium uppercase text-slate-200 hover:text-stitch-primary-container transition-colors"
          >
            Fleet
          </Link>
          <Link 
            href="/packages" 
            className="font-headline tracking-tight text-sm font-medium uppercase text-slate-200 hover:text-stitch-primary-container transition-colors"
          >
            Packages
          </Link>
          <Link 
            href="/about" 
            className="font-headline tracking-tight text-sm font-medium uppercase text-slate-200 hover:text-stitch-primary-container transition-colors"
          >
            About
          </Link>
        </div>
        <Link 
          href="/select-caravan"
          className={cn(
            "bg-stitch-primary-container text-stitch-on-primary-container px-6 py-2.5 rounded-md font-headline text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity",
            buttonVariants({ variant: "default" })
          )}
        >
          Book Your Journey
        </Link>
      </div>
    </nav>
  )
}
