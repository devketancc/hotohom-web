/**
 * Editorial spec lines for fleet detail pages. API carries capacity / amenities / media;
 * these rows complete a full “brochure” table without implying backend fields exist.
 */

import type { FleetClassSummary } from '@/types/fleet';
import type { FleetClassCode } from '@/config/fleet-experience';

export interface FleetDetailSpecRow {
  label: string;
  value: string;
}

/**
 * PLACEHOLDER editorial spec figures — NOT API-backed and NOT confirmed.
 * Exported so detail pages can render them under a clearly-labelled
 * "To confirm" group. Replace with real data (or new API fields) before launch.
 */
export const EDITORIAL_BY_CODE: Record<FleetClassCode, FleetDetailSpecRow[]> = {
  T: [
    { label: 'Berths (configured)', value: '2 berth + convertible lounge' },
    { label: 'Overall length (approx.)', value: '6.8 m · road-legal agile' },
    { label: 'Fresh water capacity', value: '95 L' },
    { label: 'Grey water capacity', value: '68 L' },
    { label: 'House battery (LiFe)', value: '200 Ah usable' },
    { label: 'Solar assist', value: '220 W rooftop array' },
    { label: 'Climate', value: 'Roof-mount AC + auxiliary heating' },
    { label: 'Kitchen', value: 'Two-burner, microwave, compressor fridge' },
    { label: 'Wet bath', value: 'Compact cassette toilet + shower' },
    { label: 'Entertainment', value: 'Interior LED zones · Bluetooth audio' },
  ],
  U: [
    { label: 'Berths (configured)', value: '4 berth zones + workstation niche' },
    { label: 'Overall length (approx.)', value: '7.9 m · wide-track stability' },
    { label: 'Fresh water capacity', value: '130 L' },
    { label: 'Grey water capacity', value: '92 L' },
    { label: 'House battery (LiFe)', value: '320 Ah usable' },
    { label: 'Solar assist', value: '390 W bifacial-ready array' },
    { label: 'Climate', value: 'Dual-zone climate + whisper fan stack' },
    { label: 'Kitchen', value: 'Induction-ready · combi microwave · 110 L fridge' },
    { label: 'Wet bath', value: 'Full-height shower · cassette + exterior service' },
    { label: 'Connectivity', value: 'Work-stable power · interior Wi-Fi amplification' },
  ],
  M: [
    { label: 'Berths (configured)', value: '6 berth family layout + bunk annex' },
    { label: 'Overall length (approx.)', value: '8.6 m · touring profile' },
    { label: 'Fresh water capacity', value: '180 L' },
    { label: 'Grey water capacity', value: '120 L' },
    { label: 'House battery (LiFe)', value: '400 Ah usable · load-sharing' },
    { label: 'Solar assist', value: '540 W expandable array' },
    { label: 'Climate', value: 'Quiet-night climate · blackout berth prep' },
    { label: 'Kitchen', value: 'U-shaped lounge galley · family fridge/freezer' },
    { label: 'Wet bath', value: 'Family wet room · external shower valve' },
    { label: 'Storage', value: 'Garage-adjacent stow · bike-friendly tunnel' },
  ],
  V: [
    { label: 'Berths (configured)', value: '4 executive berths · residential lounge' },
    { label: 'Overall length (approx.)', value: '9.4 m · flagship stance' },
    { label: 'Fresh water capacity', value: '240 L · heated service loop' },
    { label: 'Grey water capacity', value: '150 L' },
    { label: 'House battery (LiFe)', value: '600 Ah usable · shore-grade inverter' },
    { label: 'Solar assist', value: '740 W concealed array' },
    { label: 'Climate', value: 'Four-season hydronic comfort' },
    { label: 'Galley', value: 'Full-size refrigeration · convection + induction' },
    { label: 'Wet zones', value: 'Spa rainfall shower · partitioned vanity' },
    { label: 'Ambience', value: 'Theatre lighting orchestration · signature scent loop' },
  ],
};

export function buildFleetDetailSpecRows(
  summary: FleetClassSummary,
  code: FleetClassCode
): FleetDetailSpecRow[] {
  const { klass, units } = summary;
  const hubs = [
    ...new Set(units.map((u) => u.home_hub_name).filter(Boolean)),
  ].sort();
  const hubLine =
    hubs.length === 0
      ? 'MotoHom network'
      : hubs.length <= 3
        ? hubs.join(' · ')
        : `${hubs.slice(0, 2).join(' · ')} · +${hubs.length - 2} more`;

  const amenitiesPreview =
    klass.amenities.length > 0
      ? klass.amenities.slice(0, 6).join(' · ')
      : 'Configured at assignment';

  const petLine =
    klass.capacity_pets <= 0
      ? 'Not configured for pets on this silhouette'
      : `Up to ${klass.capacity_pets} pets · each removes ${klass.human_capacity_decreased_by_each_pet} guest seat`;

  const apiFirst: FleetDetailSpecRow[] = [
    { label: 'Fleet name', value: klass.name },
    { label: 'Class code', value: klass.code },
    { label: 'Guest capacity', value: `${klass.full_capacity} passengers (configured maximum)` },
    { label: 'Pet policy', value: petLine },
    { label: 'Pet-friendly', value: klass.is_pet_friendly ? 'Yes' : 'No' },
    { label: 'Hub presence', value: hubLine },
    { label: 'Active fleet units', value: `${summary.unitCount} curated ${summary.unitCount === 1 ? 'unit' : 'units'}` },
    { label: 'Amenity highlights', value: amenitiesPreview },
  ];

  return [...apiFirst, ...EDITORIAL_BY_CODE[code]];
}
