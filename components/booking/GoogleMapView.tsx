'use client';

import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import { Loader2, Navigation, Clock, Ruler } from 'lucide-react';
import { formatEstimatedKmRange, formatEstimatedMinutesRange } from '@/utils/routeDisplay';

export interface MapRouteStop {
  name: string;
  lat?: number;
  lng?: number;
}

export interface HubMapPoint {
  name: string;
  lat: number;
  lng: number;
}

function stopsRouteKey(stops: MapRouteStop[]) {
  return stops.map((s) => [s.name, s.lat ?? '', s.lng ?? ''].join('|')).join('>');
}

function fullRouteKey(hub: HubMapPoint | null, stops: MapRouteStop[], stopTitles?: string[]) {
  const h = hub ? `${hub.lat},${hub.lng},${hub.name}` : '';
  const titles = stopTitles?.join('\x1e') ?? '';
  return `${h}>${stopsRouteKey(stops)}>${titles}`;
}

export interface RouteLeg {
  distanceKm: number;
  durationMin: number;
}

export interface RouteDetails {
  /** Total round-trip distance (hub → stops → hub). */
  distanceKm: number;
  /** Total driving time in minutes. */
  durationMin: number;
  /** Per-leg breakdown in route order (leg 0 = hub → first stop). */
  legs: RouteLeg[];
}

interface GoogleMapViewProps {
  stops: MapRouteStop[];
  hub: HubMapPoint | null;
  stopTitles?: string[];
  onRouteCalculated?: (distanceKm: number) => void;
  /** Richer route data (total + per-leg) for custom summaries / route overview. */
  onRouteDetails?: (details: RouteDetails) => void;
  /** Hide the built-in floating summary card (when the parent renders its own). */
  hideSummary?: boolean;
}

function toDirectionsLocation(s: MapRouteStop): google.maps.LatLngLiteral | string {
  const hasCoords =
    Number.isFinite(s.lat) &&
    Number.isFinite(s.lng) &&
    !(s.lat === 0 && s.lng === 0);
  if (hasCoords) return { lat: s.lat!, lng: s.lng! };
  return s.name;
}

const MAX_WAYPOINTS = 25;

export const GoogleMapView = ({
  stops,
  hub,
  stopTitles,
  onRouteCalculated,
  onRouteDetails,
  hideSummary = false,
}: GoogleMapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const onRouteCalculatedRef = useRef(onRouteCalculated);
  onRouteCalculatedRef.current = onRouteCalculated;
  const onRouteDetailsRef = useRef(onRouteDetails);
  onRouteDetailsRef.current = onRouteDetails;
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current) return;
        try {
          const google = window.google;
          const newMap = new google.maps.Map(mapRef.current, {
            center: { lat: 20.5937, lng: 78.9629 },
            zoom: 5,
            styles: googleMapDarkStyles,
            disableDefaultUI: true,
            zoomControl: true,
          });
          setMap(newMap);
          setIsLoading(false);
        } catch (err) {
          console.error('Error initializing map:', err);
          setError('Failed to initialize Google Maps.');
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Google Maps could not load. Check NEXT_PUBLIC_GOOGLE_MAPS_KEY.');
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const routeKey = fullRouteKey(hub, stops, stopTitles);

  useEffect(() => {
    if (!map) return;

    let routeCancelled = false;
    const markers: google.maps.Marker[] = [];
    let directionsRenderer: google.maps.DirectionsRenderer | null = null;

    const teardown = () => {
      routeCancelled = true;
      markers.forEach((m) => m.setMap(null));
      markers.length = 0;
      directionsRenderer?.setMap(null);
      directionsRenderer = null;
    };

    if (!hub || stops.length < 2) {
      setError(null);
      setRouteInfo(null);
      return teardown;
    }

    if (stops.length > MAX_WAYPOINTS) {
      setError(`Too many stops for one route (max ${MAX_WAYPOINTS}).`);
      setRouteInfo(null);
      return teardown;
    }

    const hubPoint = { lat: hub.lat, lng: hub.lng };
    const waypoints: google.maps.DirectionsWaypoint[] = stops.map((s) => ({
      location: toDirectionsLocation(s),
      stopover: true,
    }));

    setError(null);
    setRouteInfo(null);

    const directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#ffd682',
        strokeWeight: 6,
        strokeOpacity: 0.8,
      },
    });

    directionsService.route(
      {
        origin: hubPoint,
        destination: hubPoint,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (
        result: google.maps.DirectionsResult | null,
        status: google.maps.DirectionsStatus
      ) => {
        if (routeCancelled) return;
        if (status !== google.maps.DirectionsStatus.OK || !result) {
          setError(`Could not calculate route: ${status}`);
          return;
        }

        directionsRenderer?.setDirections(result);
        const route = result.routes[0];
        const legs = route?.legs ?? [];

        if (route?.bounds) {
          map.fitBounds(route.bounds);
        }

        let meters = 0;
        let seconds = 0;
        const perLeg: RouteLeg[] = [];
        for (const leg of legs) {
          const m = leg.distance?.value ?? 0;
          const s = leg.duration?.value ?? 0;
          meters += m;
          seconds += s;
          perLeg.push({ distanceKm: m / 1000, durationMin: s / 60 });
        }

        const actualKm = meters / 1000;
        const actualMin = seconds / 60;

        setRouteInfo({
          distance:
            meters > 0
              ? formatEstimatedKmRange(actualKm)
              : legs[0]?.distance?.text ?? 'N/A',
          duration:
            seconds > 0
              ? formatEstimatedMinutesRange(actualMin)
              : legs[0]?.duration?.text ?? 'N/A',
        });

        if (meters > 0) {
          onRouteCalculatedRef.current?.(actualKm);
          onRouteDetailsRef.current?.({ distanceKm: actualKm, durationMin: actualMin, legs: perLeg });
        }

        if (legs.length > 0 && legs[0].start_location) {
          markers.push(
            new google.maps.Marker({
              map,
              position: legs[0].start_location,
              title: `Hub: ${hub.name} (depart & return)`,
            })
          );
        }

        for (let i = 0; i < stops.length; i++) {
          const leg = legs[i];
          if (!leg?.end_location) continue;
          const title =
            stopTitles?.[i] ??
            (i === 0
              ? `Pickup: ${stops[i].name}`
              : i === stops.length - 1
                ? `Drop-off: ${stops[i].name}`
                : `Stop: ${stops[i].name}`);
          markers.push(
            new google.maps.Marker({
              map,
              position: leg.end_location,
              title,
            })
          );
        }
      }
    );

    return () => {
      teardown();
    };
  }, [map, routeKey]);

  const missingHub = !hub;

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-3xl overflow-hidden shadow-2xl border border-stitch-outline/20">
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-stitch-background flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-stitch-primary" size={40} />
          <p className="text-stitch-on-surface-variant font-bold uppercase tracking-widest text-sm animate-pulse">
            Calibrating Map Satellite...
          </p>
        </div>
      )}

      {(error || missingHub) && (
        <div className="absolute inset-0 z-10 bg-stitch-background/90 flex flex-col items-center justify-center p-8 text-center gap-4">
          <div className="bg-destructive/10 p-4 rounded-full">
            <Navigation className="text-destructive rotate-45" size={40} />
          </div>
          <h3 className="text-xl font-black uppercase text-stitch-on-background">Navigation Error</h3>
          <p className="text-stitch-on-surface-variant max-w-xs">
            {missingHub
              ? 'Hub location is missing. Re-select your hub from the home page or context bar so we can plot the round trip (hub → journey → hub).'
              : error}
          </p>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />

      {routeInfo && !error && !missingHub && !hideSummary && (
        <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-80 glass-card rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-stitch-primary flex items-center gap-2">
              <Navigation size={12} />
              Estimated Journey Summary
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-stitch-on-surface-variant/60 flex items-center gap-1">
                  <Ruler size={10} /> Distance
                </span>
                <p className="text-lg font-black text-stitch-on-background leading-tight">{routeInfo.distance}</p>
              </div>
              <div className="space-y-1 border-l border-stitch-outline/20 pl-4">
                <span className="text-[10px] uppercase font-bold text-stitch-on-surface-variant/60 flex items-center gap-1">
                  <Clock size={10} /> On wheel time
                </span>
                <p className="text-lg font-black text-stitch-on-background leading-tight">{routeInfo.duration}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const googleMapDarkStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1c2025' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];
