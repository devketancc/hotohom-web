const STAY_TYPE_LABELS: Record<string, string> = {
  caravan_park: 'Caravan park',
  campsite: 'Campsite',
  hotel: 'Hotel',
  private_land: 'Private land',
  none: 'No overnight stay',
};

const STOP_TYPE_LABELS: Record<string, string> = {
  hub_start: 'Departure',
  waypoint: 'Waypoint',
  hub_end: 'Return',
};

export function formatStayType(stayType: string): string {
  return STAY_TYPE_LABELS[stayType] ?? stayType.replace(/_/g, ' ');
}

export function formatStopType(stopType: string): string {
  return STOP_TYPE_LABELS[stopType] ?? stopType.replace(/_/g, ' ');
}
