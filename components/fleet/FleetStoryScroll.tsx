'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { ArrowUpRight, Compass, Sparkles, type LucideIcon } from 'lucide-react';
import { MagneticButton } from '@/components/shared/MagneticButton';
import {
  fleetPlateauInteriorKeys,
  fleetProgressTickFillInputs,
  fleetSlideOpacityInputs,
  fleetSlideOpacityOutputs,
} from '@/lib/fleet-scroll-tracks';

export const STORY_SCROLL_EASE: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

export type FleetStoryScene = {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  paragraph: string;
  features: string[];
  image: string;
  imageAlt: string;
  ambient: string;
  Icon?: LucideIcon;
  /** Primary action in footer (e.g. “View class”). */
  ctaHref?: string;
  ctaLabel?: string;
};

type SceneLayerProps = {
  scene: FleetStoryScene;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  isFirst: boolean;
};

function SceneImageLayer({
  scene,
  index,
  total,
  scrollYProgress,
  isFirst,
}: SceneLayerProps) {
  const opacityIn = fleetSlideOpacityInputs(index, total);
  const opacityOut = fleetSlideOpacityOutputs(index, total);

  const opacity = useTransform(scrollYProgress, [...opacityIn], [...opacityOut]);
  /** Gentle Ken Burns plateau — feels smooth paired with sprung scroll scrub. */
  const scale = useTransform(
    scrollYProgress,
    [opacityIn[1], opacityIn[2]],
    [1.04, 1.085]
  );
  const ty = useTransform(scrollYProgress, [opacityIn[1], opacityIn[2]], [22, -18]);

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 will-change-[opacity,transform]"
      style={{ opacity, scale, y: ty }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scene.image}
        alt=""
        loading={isFirst ? 'eager' : 'lazy'}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </motion.div>
  );
}

function AmbientTintLayer({
  scene,
  index,
  total,
  scrollYProgress,
}: Omit<SceneLayerProps, 'isFirst'>) {
  const opacityIn = fleetSlideOpacityInputs(index, total);
  const opacityOut = fleetSlideOpacityOutputs(index, total);

  const opacity = useTransform(scrollYProgress, [...opacityIn], [...opacityOut]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ opacity, background: scene.ambient }}
    />
  );
}

function SceneCopy({
  scene,
  index,
  total,
  scrollYProgress,
}: {
  scene: FleetStoryScene;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const Icon = scene.Icon ?? Sparkles;
  const opacityIn = fleetSlideOpacityInputs(index, total);
  const opacityOut = fleetSlideOpacityOutputs(index, total);
  const micro = fleetPlateauInteriorKeys(opacityIn);

  const opacity = useTransform(scrollYProgress, [...opacityIn], [...opacityOut]);
  const titleClip = useTransform(
    scrollYProgress,
    [micro.clipA, micro.clipB],
    ['inset(0 0 100% 0)', 'inset(0 0 0% 0)']
  );
  const paragraphY = useTransform(scrollYProgress, [micro.fadeFrom, micro.fadeThru], [20, 0]);
  const featureY = useTransform(scrollYProgress, [micro.staggerA, micro.staggerB], [18, 0]);

  const showFooterCta = Boolean(scene.ctaHref && scene.ctaLabel);

  return (
    <motion.div
      className="pointer-events-auto absolute inset-x-0 bottom-10 z-20 flex justify-center px-5 md:bottom-16 md:px-10 lg:inset-y-0 lg:right-10 lg:left-auto lg:items-center lg:justify-end lg:px-0"
      style={{ opacity }}
    >
      <div className="surface-glass card-lift w-full max-w-xl rounded-3xl p-7 md:p-10">
        <div className="flex items-center gap-3 font-headline text-[10px] font-semibold uppercase tracking-[0.32em] text-stitch-primary-container/95">
          <Icon className="size-4" />
          {scene.eyebrow}
        </div>

        <motion.h3
          className="mt-6 font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-stitch-on-background md:text-4xl lg:text-[2.6rem]"
          style={{ clipPath: titleClip }}
        >
          {scene.title}
        </motion.h3>

        <motion.p
          className="mt-6 max-w-md font-body text-base leading-relaxed text-stitch-on-surface-variant/85"
          style={{ y: paragraphY }}
        >
          {scene.paragraph}
        </motion.p>

        {scene.features.length > 0 && (
          <motion.ul
            className="mt-8 flex flex-wrap gap-2"
            style={{ y: featureY }}
          >
            {scene.features.map((feature) => (
              <li
                key={feature}
                className="inline-flex items-center rounded-full border border-stitch-primary-container/25 bg-stitch-primary-container/10 px-3.5 py-1.5 font-headline text-[10px] font-semibold uppercase tracking-[0.18em] text-stitch-primary-container"
              >
                {feature}
              </li>
            ))}
          </motion.ul>
        )}

        <div className="mt-9 flex items-center justify-between gap-4 border-t border-[var(--color-line)] pt-6">
          <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.28em] text-stitch-on-surface-variant/65">
            Chapter {scene.index} / {String(total).padStart(2, '0')}
          </span>
          {showFooterCta ? (
            <MagneticButton strength={0.32}>
              <Link
                href={scene.ctaHref!}
                className="group inline-flex items-center gap-2 rounded-full border border-stitch-primary-container/35 bg-stitch-primary-container px-5 py-2.5 font-headline text-[11px] font-semibold uppercase tracking-[0.2em] text-stitch-on-primary-container transition-[transform,box-shadow,filter,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06] hover:shadow-[0_18px_50px_-18px_rgba(229,185,92,0.65)]"
              >
                {scene.ctaLabel}
                <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </MagneticButton>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function ProgressTick({
  index,
  total,
  scrollYProgress,
}: {
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const fillIn = fleetProgressTickFillInputs(index, total);
  const fill = useTransform(scrollYProgress, [...fillIn], ['0%', '100%', '100%', '100%']);

  return (
    <div className="relative h-[3px] w-10 overflow-hidden rounded-full bg-white/10 md:w-14">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-stitch-primary-container"
        style={{ width: fill }}
      />
    </div>
  );
}

function ProgressRail({
  scrollYProgress,
  total,
}: {
  scrollYProgress: MotionValue<number>;
  total: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center px-6 md:bottom-10">
      <div className="surface-glass flex items-center gap-3 rounded-full px-5 py-3">
        {Array.from({ length: total }).map((_, i) => (
          <ProgressTick
            key={`progress-tick-${i}`}
            index={i}
            total={total}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
}

/** Alternating editorial grid — matches home Fleet Experience fallback. */
export function FleetStoryStatic({
  eyebrow,
  title,
  scenes,
  showHeader = true,
}: {
  eyebrow: string;
  title: string;
  scenes: FleetStoryScene[];
  showHeader?: boolean;
}) {
  return (
    <section className="section-ambient-warm bg-stitch-background py-24 md:py-32">
      <div className="mx-auto flex max-w-screen-xl flex-col px-6 md:px-10">
        {showHeader ? (
          <header className="max-w-2xl">
            <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
              {eyebrow}
            </span>
            <h2 className="mt-5 font-headline text-4xl font-semibold leading-[0.98] tracking-[-0.035em] text-stitch-on-background md:text-5xl">
              {title}
            </h2>
          </header>
        ) : null}

        <div
          className={`flex flex-col gap-16 md:gap-20 ${showHeader ? 'mt-20 md:mt-24' : ''}`}
        >
          {scenes.map((scene, index) => {
            const Icon = scene.Icon ?? Sparkles;
            return (
              <article
                key={scene.id}
                className="grid gap-10 lg:grid-cols-12 lg:items-center"
              >
                <div
                  className={`relative overflow-hidden rounded-[2rem] ring-1 ring-[var(--color-line)] shadow-luxury-lg lg:col-span-7 ${index % 2 ? 'lg:order-2' : ''}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scene.image}
                    alt={scene.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-[22rem] w-full object-cover md:h-[28rem]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-stitch-background/45 via-transparent to-stitch-primary-container/10" />
                </div>
                <div
                  className={`flex flex-col gap-6 lg:col-span-5 ${index % 2 ? 'lg:order-1' : ''}`}
                >
                  <div className="flex items-center gap-3 font-headline text-[10px] font-semibold uppercase tracking-[0.32em] text-stitch-primary-container/95">
                    <Icon className="size-4" />
                    <span>
                      {scene.index} · {scene.eyebrow}
                    </span>
                  </div>
                  <h3 className="font-headline text-2xl font-semibold leading-[1.1] tracking-[-0.02em] text-stitch-on-background md:text-3xl">
                    {scene.title}
                  </h3>
                  <p className="font-body text-base leading-relaxed text-stitch-on-surface-variant/85">
                    {scene.paragraph}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {scene.features.map((feature) => (
                      <li
                        key={feature}
                        className="inline-flex items-center rounded-full border border-stitch-primary-container/25 bg-stitch-primary-container/10 px-3.5 py-1.5 font-headline text-[10px] font-semibold uppercase tracking-[0.18em] text-stitch-primary-container"
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {scene.ctaHref && scene.ctaLabel ? (
                    <MagneticButton strength={0.32}>
                      <Link
                        href={scene.ctaHref}
                        className="group mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-stitch-primary-container/35 bg-stitch-primary-container px-5 py-2.5 font-headline text-[11px] font-semibold uppercase tracking-[0.2em] text-stitch-on-primary-container transition-[transform,box-shadow,filter,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06]"
                      >
                        {scene.ctaLabel}
                        <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    </MagneticButton>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type FleetStoryScrollInnerProps = {
  scenes: FleetStoryScene[];
  topEyebrow: string;
  /** Scroll height multiplier per chapter (Fleet Experience ≈84vh × N). */
  vhPerScene?: number;
};

function FleetStoryScrollInner({
  scenes,
  topEyebrow,
  vhPerScene = 84,
}: FleetStoryScrollInnerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const total = scenes.length;
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 58,
    damping: 40,
    mass: 0.42,
    restDelta: 0.001,
    restSpeed: 0.001,
  });

  const [activeIndex, setActiveIndex] = React.useState(0);
  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    const next = Math.min(
      total - 1,
      Math.max(0, Math.floor(latest * total))
    );
    setActiveIndex((prev) => (next !== prev ? next : prev));
  });

  if (total === 0) return null;

  const scrollHeightVh = total * vhPerScene;

  return (
    <section className="relative bg-stitch-background" aria-label={topEyebrow}>
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${scrollHeightVh}vh` }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(229,185,92,0.10),transparent_55%),radial-gradient(ellipse_at_50%_100%,rgba(11,15,20,0.6),transparent_60%)]" />

          {scenes.map((scene, i) => (
            <SceneImageLayer
              key={`img-${scene.id}`}
              scene={scene}
              index={i}
              total={total}
              scrollYProgress={smoothProgress}
              isFirst={i === 0}
            />
          ))}

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(11,15,20,0.55)_85%,rgba(11,15,20,0.85)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stitch-background via-stitch-background/55 to-transparent" />

          {scenes.map((scene, i) => (
            <AmbientTintLayer
              key={`tint-${scene.id}`}
              scene={scene}
              index={i}
              total={total}
              scrollYProgress={smoothProgress}
            />
          ))}

          {scenes.map((scene, i) => (
            <SceneCopy
              key={`copy-${scene.id}`}
              scene={scene}
              index={i}
              total={total}
              scrollYProgress={smoothProgress}
            />
          ))}

          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-6 md:px-10 md:pt-10">
            <div className="flex items-center gap-3 font-headline text-[10px] font-semibold uppercase tracking-[0.4em] text-stitch-on-background/85">
              <span className="size-1.5 rounded-full bg-stitch-primary-container" />
              {topEyebrow}
            </div>
            <div className="flex items-baseline gap-2 font-headline tabular-nums">
              <div className="relative h-9 overflow-hidden md:h-10">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={scenes[activeIndex]?.index ?? '0'}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.55, ease: STORY_SCROLL_EASE }}
                    className="block text-3xl font-semibold text-stitch-on-background md:text-4xl"
                  >
                    {scenes[activeIndex]?.index ?? '01'}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-sm font-medium uppercase tracking-[0.3em] text-stitch-on-surface-variant/70">
                / {String(total).padStart(2, '0')}
              </span>
            </div>
          </div>

          <ProgressRail scrollYProgress={smoothProgress} total={total} />
        </div>
      </div>
    </section>
  );
}

/** Sticky Fleet Experience scroll; falls back to the same alternating grid when reduced-motion. */
export function FleetStoryScroll({
  scenes,
  topEyebrow,
  staticEyebrow,
  staticTitle,
  /** Shown above the sticky scrub when motion is enabled */
  scrollIntroEyebrow,
  scrollIntroTitle,
  scrollIntroBody,
  vhPerScene,
  scrollIntroRibbon,
  staticShowHeader,
}: FleetStoryScrollInnerProps & {
  staticEyebrow: string;
  staticTitle: string;
  scrollIntroEyebrow?: string;
  scrollIntroTitle?: string;
  scrollIntroBody?: string;
  /** When false, skips the ribbon above the scrub (page supplies its own intro). Default true when motion is enabled. */
  scrollIntroRibbon?: boolean;
  /** Reduced-motion layouts skip the FleetStoryStatic title block when false. Default true when reduced-motion. */
  staticShowHeader?: boolean;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const animate = mounted && !reduced && scenes.length > 0;

  const introE = scrollIntroEyebrow ?? staticEyebrow;
  const introT = scrollIntroTitle ?? staticTitle;
  const introB =
    scrollIntroBody ??
    'Scroll through each chapter—the same choreography as our home Fleet Experience—with your real imagery and story.';

  if (!animate) {
    return (
      <FleetStoryStatic
        eyebrow={staticEyebrow}
        title={staticTitle}
        scenes={scenes}
        showHeader={staticShowHeader ?? true}
      />
    );
  }

  const showRibbon = scrollIntroRibbon !== false;

  return (
    <>
      {showRibbon ? (
        <div className="section-ambient-warm border-b border-[var(--color-line)] bg-stitch-background">
          <div className="mx-auto max-w-screen-xl px-6 py-16 md:px-10 md:py-20">
            <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
              {introE}
            </span>
            <h2 className="mt-5 max-w-2xl font-headline text-3xl font-semibold leading-[0.98] tracking-[-0.035em] text-stitch-on-background md:text-4xl lg:text-5xl">
              {introT}
            </h2>
            <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-stitch-on-surface-variant/82">
              {introB}
            </p>
          </div>
        </div>
      ) : null}
      <FleetStoryScrollInner
        scenes={scenes}
        topEyebrow={topEyebrow}
        vhPerScene={vhPerScene}
      />
    </>
  );
}

export const FLEET_STORY_ICONS_ROUND_ROBIN = [Sparkles, Compass] as LucideIcon[];
