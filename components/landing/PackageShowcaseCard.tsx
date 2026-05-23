"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export type PackageShowcaseCardProps = {
  href: string;
  title: string;
  location: string;
  tag: string;
  duration: string;
  price: string;
  image: string;
  tagline: string;
  index: number;
};

export function PackageShowcaseCard({
  href,
  title,
  location,
  tag,
  duration,
  price,
  image,
  tagline,
  index,
}: PackageShowcaseCardProps) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const cardRef = React.useRef<HTMLDivElement>(null);
  const imgX = useMotionValue(0);
  const imgY = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(imgX, { stiffness: 40, damping: 15 });
  const springY = useSpring(imgY, { stiffness: 40, damping: 15 });
  const lightX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const lightY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mounted || reduced || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    
    imgX.set(px * 25);
    imgY.set(py * 25);
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  };

  const handleLeave = () => {
    imgX.set(0);
    imgY.set(0);
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className="group/card relative shrink-0 snap-center px-4"
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleLeave}
    >
      <div className="relative h-[min(65vh,540px)] w-[min(80vw,440px)] md:w-[480px]">
        <Link href={href} className="relative block h-full w-full outline-none">
          <motion.div
            className="relative h-full w-full overflow-hidden rounded-[2rem] bg-stitch-surface-variant/5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:shadow-[0_50px_100px_-30px_rgba(229,185,92,0.1)] group-hover/card:ring-white/20"
            initial={mounted ? { opacity: 0, y: 30 } : false}
            whileInView={mounted ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.5, ease: LUXURY_EASE, delay: Math.min(index * 0.1, 0.4) }}
          >
            {/* Ambient Mouse Light */}
            <motion.div
              className="pointer-events-none absolute z-30 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-stitch-primary-container/10 blur-[100px] opacity-0 transition-opacity duration-1000 group-hover/card:opacity-100"
              style={{ left: lightX, top: lightY }}
            />

            {/* Cinematic Image Container */}
            <motion.div
              className="absolute inset-0 will-change-transform"
              style={{ x: springX, y: springY, scale: 1.2 }}
            >
              <motion.img
                src={image}
                alt={title}
                className="h-full w-full object-cover"
                animate={{ scale: isHovered ? 1.08 : 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </motion.div>

            {/* Multi-Layered Atmosphere */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
            <div className="pointer-events-none absolute inset-0 bg-black/10 transition-opacity duration-700 group-hover/card:bg-black/0" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,185,92,0.1),transparent_50%)]" />
            
            {/* Top Badges (Minimalist) */}
            <div className="absolute left-8 top-8 z-20 flex gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-headline text-[9px] font-bold uppercase tracking-[0.3em] text-white/60 backdrop-blur-md">
                {location}
              </span>
              <span className="rounded-full border border-stitch-primary-container/20 bg-stitch-primary-container/5 px-3 py-1 font-headline text-[9px] font-bold uppercase tracking-[0.3em] text-stitch-primary-container backdrop-blur-md">
                {tag}
              </span>
            </div>

            {/* Bottom Content (Editorial Hierarchy) */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-8 md:p-10">
              <div className="space-y-4">
                {/* Secondary: Tagline (Hover Reveal) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                  transition={{ duration: 0.8, ease: LUXURY_EASE }}
                  className="hidden md:block"
                >
                  <p className="max-w-xs font-body text-sm italic leading-relaxed text-white/50">
                    &ldquo;{tagline}&rdquo;
                  </p>
                </motion.div>

                {/* Primary: Title */}
                <div className="space-y-2">
                  <h3 className="font-headline text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-white md:text-4xl">
                    {title.split(' ').map((word, i) => (
                       <React.Fragment key={i}>
                         {word}{i === 0 && title.split(' ').length > 2 ? <br /> : ' '}
                       </React.Fragment>
                    ))}
                  </h3>
                  <p className="font-headline text-xl font-bold tracking-tight text-stitch-primary-container/90">
                    {price}
                  </p>
                </div>

                {/* Tertiary Reveal Container */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex items-end justify-between border-t border-white/5 pt-6"
                >
                  <div className="space-y-1">
                    <p className="font-headline text-[9px] font-bold uppercase tracking-[0.4em] text-white/30">
                      Journey Length
                    </p>
                    <p className="font-body text-xs font-medium text-white/70">
                      {duration}
                    </p>
                  </div>

                  {/* Minimalist CTA */}
                  <div className="flex items-center gap-2 group/cta transition-colors text-white/60 hover:text-stitch-primary-container">
                    <span className="font-headline text-[9px] font-bold uppercase tracking-[0.4em] transition-colors">
                      Explore
                    </span>
                    <ArrowUpRight className="size-3.5 transition-all duration-500 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Glass Grain Overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
          </motion.div>
        </Link>
      </div>
    </div>
  );
}

export function taglineForIndex(i: number): string {
  const lines = [
    "Where every mile feels like a quiet exhale.",
    "Built for roads that refuse to be rushed.",
    "Sunrise windows, starlit stops, and room to breathe.",
    "A private world that moves with you.",
    "Curated comfort for those who travel deliberately.",
    "Let the landscape rewrite your definition of home.",
  ];
  return lines[i % lines.length];
}
