'use client';

import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import { Loader2, MapPin } from 'lucide-react';
import { googleMapDarkStyles } from '@/components/booking/GoogleMapView';

export interface PackageMapPoint {
  lat: number;
  lng: number;
  title: string;
}

interface PackagePickupDropMapProps {
  pickup: PackageMapPoint | null;
  dropoff: PackageMapPoint | null;
}

export function PackagePickupDropMap({ pickup, dropoff }: PackagePickupDropMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        } catch {
          setError('Failed to initialize map.');
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Google Maps could not load.');
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const key = `${pickup?.lat ?? ''},${pickup?.lng ?? ''}|${dropoff?.lat ?? ''},${dropoff?.lng ?? ''}`;

  useEffect(() => {
    if (!map) return;
    const markers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    const add = (p: PackageMapPoint | null, label: string) => {
      if (!p || !Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return;
      const pos = { lat: p.lat, lng: p.lng };
      bounds.extend(pos);
      markers.push(
        new google.maps.Marker({
          map,
          position: pos,
          title: p.title || label,
        })
      );
    };

    add(pickup, 'Pickup');
    add(dropoff, 'Drop-off');

    if (markers.length === 1) {
      map.setCenter(markers[0].getPosition()!);
      map.setZoom(12);
    } else if (markers.length >= 2) {
      map.fitBounds(bounds, 48);
    }

    return () => {
      markers.forEach((m) => m.setMap(null));
    };
  }, [map, key, pickup, dropoff]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-stitch-outline/20">
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-stitch-background flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-stitch-primary" size={40} />
          <p className="text-stitch-on-surface-variant font-bold uppercase tracking-widest text-sm">
            Loading map…
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 bg-stitch-background/90 flex flex-col items-center justify-center p-8 text-center gap-4">
          <MapPin className="text-destructive rotate-45" size={40} />
          <p className="text-stitch-on-surface-variant max-w-xs">{error}</p>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full min-h-[420px]" />
    </div>
  );
}
