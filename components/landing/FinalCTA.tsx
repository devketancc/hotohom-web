"use client"

import Link from 'next/link'

export const FinalCTA = () => {
  return (
    <section className="relative py-60 overflow-hidden">
      <div className="absolute inset-0 z-0 scale-110">
        <img 
          alt="Caravan under a starry night sky" 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGvK9qkpcWpYop4hVYNUzOzR3zKGRzVnA17MeyW1YQhmAn5QYEvklWWhVyBoXldDspoU8WUgQf9ICzh3I_x6waP1wS4qjXQ7qeS5ID8FU8DhuKxbEWXI1fmG7YRAif16-mHMUCPXsA_cLjLDyaKJlp1kuSk5OddQW8CWFmN48XiqfSGoVZdi5eNud0QiGY6z6s3uspIZQJUwJSPGCZVuFTSo4jVk0JEbCHKimh6dtfswEibqoUt6qFxjOqMbMrgj1aMpi4ZbKXFs"
        />
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto text-center px-8">
        <h2 className="text-6xl md:text-8xl font-black tracking-tight mb-10 leading-none font-headline animate-in fade-in slide-in-from-bottom-5 duration-700">
          Your Next Adventure <br/><span className="text-stitch-primary-container">Starts Here</span>
        </h2>
        <p className="text-2xl text-stitch-on-surface-variant/90 mb-16 max-w-3xl mx-auto leading-relaxed font-medium font-body animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          Join a global community of modern nomads. Rediscover the freedom of the road with Motohom's premium caravan experiences.
        </p>
        
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
          <Link 
            href="/select-caravan"
            className="gradient-cta text-stitch-on-primary-container px-16 py-7 h-auto rounded-2xl font-headline font-black text-xl uppercase tracking-[0.15em] hover:scale-105 hover:brightness-110 transition-all shadow-2xl shadow-stitch-primary/20"
          >
            Start Your Journey
          </Link>
          <Link 
            href="/fleet"
            className="bg-transparent border-2 border-stitch-primary/40 text-stitch-primary px-16 py-7 h-auto rounded-2xl font-headline font-black text-xl uppercase tracking-[0.15em] hover:bg-stitch-primary/5 hover:border-stitch-primary transition-all"
          >
            View Fleet
          </Link>
        </div>
      </div>
    </section>
  )
}
