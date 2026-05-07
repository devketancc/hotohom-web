/**
 * Frontend-only fleet showcase: slugs, marketing copy, tiered motion/visual hints.
 * Maps to API caravan class `code` (T | U | M | V). Backend is not modified.
 */

export type FleetClassCode = 'T' | 'U' | 'M' | 'V';

export type FleetExperienceTier = 'base' | 'urbania' | 'family' | 'flagship';

export interface FleetSectionBlocks {
  heroEyebrow: string;
  heroTagline: string;
  lifestyleIntro: string[];
  interior: { headline: string; body: string[] };
  technology: { headline: string; body: string[] };
  smartFeatures: { headline: string; lines: string[] };
  living: { headline: string; body: string[] };
  specsIntro: string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
}

export interface FleetExperienceConfig {
  code: FleetClassCode;
  slug: string;
  /** Display headline; API `name` is fallback elsewhere */
  headline: string;
  /** Lineup label shown in eyebrow rails */
  seriesLabel: string;
  tier: FleetExperienceTier;
  /** Parallax / motion multipliers vs base (respect reduced-motion in components) */
  motionScale: number;
  /** Accent: warm | cool — drives gradient presets in CSS utilities */
  accentTone: 'warm' | 'cool' | 'champagne';
  sections: FleetSectionBlocks;
}

const shared = {
  ctaEyebrow: 'The journey',
  ctaBody:
    'Hand-picked pacing, concierge support, and routes composed for how you travel.',
} as const;

export const FLEET_SLUG_BY_CODE: Record<FleetClassCode, string> = {
  T: 'traveller',
  U: 'urbania',
  M: 'monarch',
  V: 'viceroy',
};

export const FLEET_CODE_BY_SLUG: Record<string, FleetClassCode> =
  Object.fromEntries(
    Object.entries(FLEET_SLUG_BY_CODE).map(([code, slug]) => [
      slug.toLowerCase(),
      code as FleetClassCode,
    ])
  ) as Record<string, FleetClassCode>;

/** Single-letter codes for backwards compatibility */
const LETTER_ALIASES: Record<string, FleetClassCode> = {
  t: 'T',
  u: 'U',
  m: 'M',
  v: 'V',
};

export function resolveFleetParamToCode(param: string | undefined): FleetClassCode | null {
  if (!param || !param.trim()) return null;
  const key = param.trim().toLowerCase();
  if (FLEET_CODE_BY_SLUG[key]) return FLEET_CODE_BY_SLUG[key];
  if (LETTER_ALIASES[key]) return LETTER_ALIASES[key];
  return null;
}

export function getCanonicalSlugForCode(code: string): string | null {
  const upper = code.toUpperCase() as FleetClassCode;
  if (upper in FLEET_SLUG_BY_CODE) return FLEET_SLUG_BY_CODE[upper];
  return null;
}

export const FLEET_EXPERIENCE_BY_CODE: Record<FleetClassCode, FleetExperienceConfig> = {
  T: {
    code: 'T',
    slug: FLEET_SLUG_BY_CODE.T,
    headline: 'Traveller',
    seriesLabel: 'Class T · Traveller',
    tier: 'base',
    motionScale: 1,
    accentTone: 'warm',
    sections: {
      heroEyebrow: 'Essential silhouette',
      heroTagline: 'Compact presence. Quiet confidence.',
      lifestyleIntro: [
        'Born for narrower roads and longer horizons—the Traveller is our most agile interpretation of motel-on-wheels philosophy.',
      ],
      interior: {
        headline: 'Crafted restraint',
        body: [
          'Premium seating textiles and considered ambient washes create a cockpit that breathes—a refuge after miles of asphalt.',
          'Panoramic glass and tactile surfaces keep the exterior world present without intrusion.',
        ],
      },
      technology: {
        headline: 'Comfort, distilled',
        body: [
          'Climate, light, and power management stay intuitive so attention stays where it belongs: with your crew.',
        ],
      },
      smartFeatures: {
        headline: 'Considered touches',
        lines: ['Efficient kitchens and wet zones', 'Solar-aware energy rhythm', 'Storage that earns its footprint'],
      },
      living: {
        headline: 'Room to arrive',
        body: [
          'Layouts favour flow over clutter—wake, brew, and reset with the same choreography you would expect from a boutique stay.',
        ],
      },
      specsIntro: 'The essentials, elevated.',
      ...shared,
      ctaTitle: 'Plan a Traveller escape',
    },
  },
  U: {
    code: 'U',
    slug: FLEET_SLUG_BY_CODE.U,
    headline: 'Urbania',
    seriesLabel: 'Urbania',
    tier: 'urbania',
    motionScale: 1.05,
    accentTone: 'cool',
    sections: {
      heroEyebrow: 'Urbania series',
      heroTagline: 'Futurist calm. Wired for the next mile.',
      lifestyleIntro: [
        'Urbania reframes connectivity as atmosphere—glass, light gradients, and a tech-forward cockpit for travellers who refuse generic.',
      ],
      interior: {
        headline: 'Interiors as interface',
        body: [
          'Layered materials and programmable mood lighting frame every journey like a deliberate scene change.',
          'Seating geometries favour dialogue and gesture—the cabin feels authored, not assembled.',
        ],
      },
      technology: {
        headline: 'Comfort at signal speed',
        body: [
          'Power, bandwidth, and environmental control sit behind minimal surfaces—premium should feel effortless, never busy.',
        ],
      },
      smartFeatures: {
        headline: 'Intelligent comforts',
        lines: ['Always-on ambience layers', 'Work-ready calm zones', 'Kitchen and climate in quiet sync'],
      },
      living: {
        headline: 'The modern lounge',
        body: [
          'Horizontals widen the sense of space; vertical storage disappears into the architecture of the caravan itself.',
        ],
      },
      specsIntro: 'Precision without noise.',
      ...shared,
      ctaTitle: 'Reserve Urbania',
    },
  },
  M: {
    code: 'M',
    slug: FLEET_SLUG_BY_CODE.M,
    headline: 'Monarch',
    seriesLabel: 'Class M · Family luxury',
    tier: 'family',
    motionScale: 0.92,
    accentTone: 'warm',
    sections: {
      heroEyebrow: 'Sanctuary grade',
      heroTagline: 'Family-soft. Generously orchestrated.',
      lifestyleIntro: [
        'Monarch is where soft gradients meet durable craft—thought for bedtime stories, sunrise coffee, and the small rituals between destinations.',
      ],
      interior: {
        headline: 'Warmth by design',
        body: [
          'Textiles lean plush; lighting stays honeyed deep into dusk so no one swaps wonder for glare.',
          'Panoramic living zones keep everyone in the same conversational orbit.',
        ],
      },
      technology: {
        headline: 'Comfort that scales',
        body: [
          'Climate zoning and blackout-ready berth prep mean restless nights rarely make the itinerary.',
        ],
      },
      smartFeatures: {
        headline: 'Family-forward',
        lines: ['Multi-zone rest', 'Generous berth staging', 'Wet-room confidence'],
      },
      living: {
        headline: 'The shared rhythm',
        body: [
          'Circulation lanes stay wide; storage anticipates scooters, coolers, and the beautiful chaos of group travel.',
        ],
      },
      specsIntro: 'Capacity with composure.',
      ...shared,
      ctaTitle: 'Orchestrate a Monarch voyage',
    },
  },
  V: {
    code: 'V',
    slug: FLEET_SLUG_BY_CODE.V,
    headline: 'Viceroy',
    seriesLabel: 'Class V · Flagship',
    tier: 'flagship',
    motionScale: 1.15,
    accentTone: 'champagne',
    sections: {
      heroEyebrow: 'Signature flagship',
      heroTagline: 'The pinnacle of the MotoHom lineage.',
      lifestyleIntro: [
        'Viceroy trades compromise for choreography—broadcast-scale glass, ceremonial entry light, and the kind of hush wealth reserves for yachts.',
      ],
      interior: {
        headline: 'Cinematic interior',
        body: [
          'Hand-stitched horizons of upholstery wrap lounge architecture built for lingering conversations.',
          'Ambient washes stage each hour—dawn silver, noon clarity, midnight brass.',
        ],
      },
      technology: {
        headline: 'Invisible mastery',
        body: [
          'Power, multimedia, and climate orchestration stay below the surface until you need them—then they answer instantly.',
        ],
      },
      smartFeatures: {
        headline: 'Flagship intelligence',
        lines: ['Theatre-grade lighting scenes', 'Executive wet zones', 'Concierge-ready amenity depth'],
      },
      living: {
        headline: 'Residence in motion',
        body: [
          'Volume and sightlines mimic penthouse rhythm—floating planes, sculpted storage, vistas that insist on slowing down.',
        ],
      },
      specsIntro: 'Fewer units. Finer thresholds.',
      ...shared,
      ctaTitle: 'Commission Viceroy',
    },
  },
};

export function getFleetExperience(code: string | undefined): FleetExperienceConfig | null {
  if (!code) return null;
  const upper = code.toUpperCase() as FleetClassCode;
  return FLEET_EXPERIENCE_BY_CODE[upper] ?? null;
}

/** Keywords in API amenities bucketed for “smart features” augmentation */
export const AMENITY_SMART_KEYS = /\b(wifi|solar|ac|kitchen|tv|shower|toilet)/i;
