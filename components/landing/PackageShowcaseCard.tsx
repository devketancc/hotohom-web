"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { MagneticButton } from "@/components/shared/MagneticButton";

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export type ShowcaseSize = "cinema" | "editorial" | "tapestry";

const SIZE_CLASSES: Record<
  ShowcaseSize,
  string
> = {
  cinema:
    "w-[min(88vw,560px)] sm:w-[min(82vw,600px)] lg:w-[min(58vw,680px)] min-h-[min(72vh,580px)] lg:min-h-[620px]",
  editorial:
    "w-[min(84vw,480px)] sm:w-[min(76vw,520px)] lg:w-[min(48vw,520px)] min-h-[min(68vh,540px)] lg:min-h-[580px]",
  tapestry:
    "w-[min(80vw,420px)] sm:w-[min(72vw,460px)] lg:w-[min(42vw,480px)] min-h-[min(74vh,600px)] lg:min-h-[640px]",
};

export type PackageShowcaseCardProps = {
  href: string;
  title: string;
  location: string;
  tag: string;
  duration: string;
  price: string;
  image: string;
  tagline: string;
  size: ShowcaseSize;
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
  size,
  index,
}: PackageShowcaseCardProps) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const shouldParallax = mounted && !reduced;
  const shouldEntrance = mounted && !reduced;
  const cardRef = React.useRef<HTMLDivElement>(null);
  const imgX = useMotionValue(0);
  const imgY = useMotionValue(0);
  const springX = useSpring(imgX, { stiffness: 120, damping: 24, mass: 0.35 });
  const springY = useSpring(imgY, { stiffness: 120, damping: 24, mass: 0.35 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldParallax || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    imgX.set(px * 14);
    imgY.set(py * 14);
  };

  const handleLeave = () => {
    imgX.set(0);
    imgY.set(0);
  };

  const offsetClass =
    index % 2 === 0 ? "lg:mt-0" : "lg:mt-12";
  const rotateClass =
    index % 3 === 1 ? "lg:-rotate-[0.4deg]" : index % 3 === 2 ? "lg:rotate-[0.35deg]" : "";

  return (
    <div
      ref={cardRef}
      className={`group/card relative shrink-0 snap-center ${SIZE_CLASSES[size]} ${offsetClass} ${rotateClass}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <MagneticButton className="block h-full" strength={0.28}>
        <Link href={href} className="relative block h-full outline-none">
          <motion.div
            className="relative h-full overflow-hidden rounded-[2rem] ring-1 ring-[var(--color-line)] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.07)] transition-shadow duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:shadow-[0_52px_120px_-36px_rgba(229,185,92,0.12),0_40px_90px_-50px_rgba(0,0,0,0.9)]"
            initial={shouldEntrance ? { opacity: 0, y: 36, scale: 0.98 } : false}
            whileInView={shouldEntrance ? { opacity: 1, y: 0, scale: 1 } : undefined}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{
              duration: 1.1,
              ease: LUXURY_EASE,
              delay: Math.min(index * 0.07, 0.35),
            }}
          >
            {shouldParallax ? (
              <motion.div
                className="absolute inset-0 will-change-transform"
                style={{ x: springX, y: springY, scale: 1.08 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.04]"
                />
              </motion.div>
            ) : (
              <div className="absolute inset-0 scale-[1.08]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.04]"
                />
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-stitch-background/55 via-transparent to-stitch-primary-container/12" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(229,185,92,0.15),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-stitch-background via-stitch-background/40 to-transparent" />

            <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-stitch-primary-container/12 blur-3xl" />

            <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2 md:left-7 md:top-7">
              <span className="rounded-full border border-white/12 bg-stitch-background/35 px-4 py-1.5 font-headline text-[10px] font-semibold uppercase tracking-[0.22em] text-stitch-primary-container backdrop-blur-md">
                {location}
              </span>
              <span className="rounded-full border border-white/8 bg-black/35 px-3 py-1.5 font-headline text-[9px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur-md">
                {tag}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-8">
              <p className="max-w-md font-body text-[13px] font-medium italic leading-relaxed text-stitch-on-surface-variant/90 md:text-sm">
                {tagline}
              </p>
              <h3 className="mt-4 font-headline text-2xl font-semibold leading-[1.05] tracking-[-0.03em] text-stitch-on-background md:text-3xl lg:text-[2rem]">
                {title}
              </h3>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-5">
                <div>
                  <p className="font-headline text-[10px] font-semibold uppercase tracking-[0.24em] text-stitch-on-surface-variant/65">
                    Journey
                  </p>
                  <p className="mt-1 font-body text-sm font-medium text-stitch-on-background/95">
                    {duration}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-headline text-[10px] font-semibold uppercase tracking-[0.24em] text-stitch-on-surface-variant/65">
                    From
                  </p>
                  <p className="mt-1 font-headline text-xl font-semibold tabular-nums text-stitch-primary-container md:text-2xl">
                    {price}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-stitch-primary-container/25 bg-stitch-primary-container/12 px-4 py-2 font-headline text-[10px] font-semibold uppercase tracking-[0.2em] text-stitch-primary-container transition-colors duration-500 group-hover/card:border-stitch-primary-container/50 group-hover/card:bg-stitch-primary-container/18">
                  Explore
                  <ArrowUpRight className="size-3.5" />
                </span>
              </div>
            </div>
          </motion.div>
        </Link>
      </MagneticButton>
    </div>
  );
}

export function sizeForIndex(i: number): ShowcaseSize {
  const m = i % 3;
  if (m === 0) return "cinema";
  if (m === 1) return "editorial";
  return "tapestry";
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
