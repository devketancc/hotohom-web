"use client"

import { BookingControl } from './BookingControl'

export const Hero = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          alt="Cinematic luxury caravan driving through scenic mountains at sunset" 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXibFzxuZ03QkcW1_fZb8YjVJNoIXMg_C3O5AeV2QckYgDaEizJEa9Ky95eSAwbpC1NSpfvDpHFeQNPaVidtWzXOVZFBFxpteaDcsqELw9BomMGHTm6Lo6w3CzrS7m2g29i_K-yZc9J5qC_QGMUsZf8YTqnM5vVDTDvce07NGB8fYQUn4XWLdvSo_FLJXZ2vKazfTFCQaHVNEpGssm9eS2N_dw1GAGCYewYCuc5JTPHcwxzvXJjCAee5pbAZTq3EQG-Clizgt3EUM"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-stitch-background/20 to-stitch-background"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-5xl px-6 animate-in fade-in slide-in-from-bottom-5 duration-1000">
        <h1 className="text-6xl md:text-9xl font-extrabold tracking-tighter text-stitch-on-background mb-8 leading-[1.1] font-headline">
          Plan Your <br/><span className="text-stitch-primary-container">Perfect Road Trip</span>
        </h1>
        <p className="text-xl md:text-2xl text-stitch-on-surface-variant font-body max-w-3xl mx-auto mb-16 opacity-90">
          Experience Freedom, Without the Hassle
        </p>
      </div>

      {/* Premium Single-Row Booking Control */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 z-20">
        <BookingControl />
      </div>
    </section>
  )
}
