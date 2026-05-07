/**
 * Builds FleetExperience-style scenes for `/fleet` and `/fleet/[slug]` from catalog + config.
 */

import type { FleetStoryScene } from '@/components/fleet/FleetStoryScroll';
import type { FleetClassSummary } from '@/types/fleet';
import type { FleetExperienceConfig } from '@/config/fleet-experience';
import { Compass, MoonStar, Mountain, Sparkles, Tent, type LucideIcon } from 'lucide-react';

/** Ambients aligned with home FleetExperience scenes (rotated by index). */
const AMBIENT_PRESETS = [
  'radial-gradient(ellipse at 20% 30%, rgba(229,185,92,0.22), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(184,146,63,0.18), transparent 60%)',
  'radial-gradient(ellipse at 18% 24%, rgba(120,153,214,0.22), transparent 56%), radial-gradient(ellipse at 86% 78%, rgba(229,185,92,0.10), transparent 60%)',
  'radial-gradient(ellipse at 22% 32%, rgba(255,176,90,0.22), transparent 54%), radial-gradient(ellipse at 82% 76%, rgba(229,143,74,0.15), transparent 60%)',
  'radial-gradient(ellipse at 18% 28%, rgba(70,140,150,0.24), transparent 56%), radial-gradient(ellipse at 84% 80%, rgba(40,80,120,0.22), transparent 62%)',
  'radial-gradient(ellipse at 22% 24%, rgba(240,220,190,0.22), transparent 54%), radial-gradient(ellipse at 80% 80%, rgba(229,185,92,0.18), transparent 60%)',
] as const;

const ICON_ROUND: LucideIcon[] = [
  Sparkles,
  Compass,
  Tent,
  MoonStar,
  Mountain,
];

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2400&auto=format&fit=crop';

function excerpt(text: string, max = 200) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

export function buildFleetLandingScene(
  summary: FleetClassSummary,
  exp: FleetExperienceConfig,
  index: number
): FleetStoryScene {
  const cover = summary.coverImage ?? FALLBACK_COVER;
  const feat =
    summary.klass.amenities.length > 0
      ? summary.klass.amenities.slice(0, 3)
      : exp.sections.smartFeatures.lines.slice(0, 3);

  const desc =
    summary.klass.description?.trim() ||
    exp.sections.lifestyleIntro[0] ||
    exp.sections.heroTagline;

  return {
    id: exp.slug,
    index: String(index + 1).padStart(2, '0'),
    eyebrow: exp.seriesLabel,
    title: exp.headline,
    paragraph: excerpt(`${exp.sections.heroTagline} ${desc}`.trim(), 260),
    features: feat.length > 0 ? feat : ['MotoHom fleet', 'Curated hubs', 'Concierge-backed'],
    image: cover,
    imageAlt: `${exp.headline} — MotoHom fleet`,
    ambient: AMBIENT_PRESETS[index % AMBIENT_PRESETS.length],
    Icon: ICON_ROUND[index % ICON_ROUND.length],
    ctaHref: `/fleet/${exp.slug}`,
    ctaLabel: 'View Class',
  };
}

/** Detail page: storyline chapters (scroll + static parity). */
export function buildFleetDetailScenes(params: {
  summary: FleetClassSummary;
  exp: FleetExperienceConfig;
  hero: string;
  interior: string;
  technology: string;
  living: string;
  smartHighlights: string[];
}): FleetStoryScene[] {
  const { summary, exp, hero, interior, technology, living, smartHighlights } = params;
  const k = summary.klass;
  const feats = k.amenities.slice(0, 3);

  const storyParagraph = [
    exp.sections.lifestyleIntro.join(' '),
    k.description?.trim(),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return [
    {
      id: 'story',
      index: '01',
      eyebrow: exp.seriesLabel,
      title: exp.sections.heroTagline,
      paragraph: excerpt(storyParagraph || exp.sections.heroTagline, 280),
      features: feats.length > 0 ? feats : smartHighlights.slice(0, 3),
      image: hero,
      imageAlt: `${exp.headline}`,
      ambient: AMBIENT_PRESETS[0],
      Icon: Sparkles,
      ctaHref: '#fleet-gallery',
      ctaLabel: 'Gallery',
    },
    {
      id: 'interior',
      index: '02',
      eyebrow: 'Interior',
      title: exp.sections.interior.headline,
      paragraph: exp.sections.interior.body.join(' '),
      features: k.amenities.slice(0, 3).length ? k.amenities.slice(0, 3) : ['Comfort', 'Ambient light', 'Layout'],
      image: interior,
      imageAlt: `Interior — ${exp.headline}`,
      ambient: AMBIENT_PRESETS[1],
      Icon: Tent,
    },
    {
      id: 'comfort',
      index: '03',
      eyebrow: 'Technology & Comfort',
      title: exp.sections.technology.headline,
      paragraph: exp.sections.technology.body.join(' '),
      features: smartHighlights.length > 0 ? smartHighlights.slice(0, 4) : k.amenities.slice(3, 6),
      image: technology,
      imageAlt: `${exp.headline} — onboard`,
      ambient: AMBIENT_PRESETS[2],
      Icon: Compass,
    },
    {
      id: 'living',
      index: '04',
      eyebrow: 'Living',
      title: exp.sections.living.headline,
      paragraph: exp.sections.living.body.join(' '),
      features: exp.sections.smartFeatures.lines.slice(0, 3),
      image: living,
      imageAlt: `Living — ${exp.headline}`,
      ambient: AMBIENT_PRESETS[3],
      Icon: MoonStar,
    },
    {
      id: 'journey',
      index: '05',
      eyebrow: 'Next step',
      title: excerpt(exp.sections.ctaTitle, 72),
      paragraph: `${exp.sections.specsIntro} Guests: ${k.full_capacity}. ${summary.unitCount} ${summary.unitCount === 1 ? 'unit' : 'units'} in circulation.`,
      features: [`Class ${k.code}`, k.is_pet_friendly ? 'Pet friendly' : 'Ask about pets', 'Concierge journeys'],
      image: hero,
      imageAlt: `${exp.headline} — journeys`,
      ambient: AMBIENT_PRESETS[4],
      Icon: Mountain,
      ctaHref: `/packages?class=${k.code}`,
      ctaLabel: 'Plan journey',
    },
  ];
}
