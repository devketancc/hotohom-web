'use client';

import React, { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import type { JourneyStopLocation } from '@/types/booking';
import { cn } from '@/lib/utils';

const INDIA = { south: 6.4, west: 68.1, north: 35.5, east: 97.4 };

interface PlacesAutocompleteInputProps {
  stopId: string;
  location: JourneyStopLocation | null;
  onResolved: (loc: JourneyStopLocation | null) => void;
  placeholder?: string;
  icon: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function PlacesAutocompleteInput({
  stopId,
  location,
  onResolved,
  placeholder,
  icon,
  disabled,
  className,
}: PlacesAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onResolvedRef = useRef(onResolved);
  onResolvedRef.current = onResolved;

  useEffect(() => {
    if (disabled || !inputRef.current) return;
    let cancelled = false;
    let removeListener: (() => void) | undefined;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !inputRef.current) return;
        const google = window.google;
        const input = inputRef.current;
        const ac = new google.maps.places.Autocomplete(input, {
          fields: ['formatted_address', 'geometry', 'name', 'place_id', 'types'],
          componentRestrictions: { country: 'in' },
        });
        ac.setBounds(
          new google.maps.LatLngBounds(
            new google.maps.LatLng(INDIA.south, INDIA.west),
            new google.maps.LatLng(INDIA.north, INDIA.east)
          )
        );

        const listener = ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          const geom = place.geometry?.location;
          if (!geom || !place.place_id) return;
          const name = place.formatted_address || place.name || input.value;
          const formatted_address = place.formatted_address ?? name;
          const types = Array.isArray(place.types) ? [...place.types] : [];
          onResolvedRef.current({
            name,
            lat: geom.lat(),
            lng: geom.lng(),
            place_id: place.place_id,
            meta: { formatted_address, types },
          });
        });
        removeListener = () => listener.remove();
      })
      .catch(() => {
        /* key missing — input still works as plain text; parent may show hint */
      });

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, [disabled, stopId]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el || document.activeElement === el) return;
    el.value = location?.name ?? '';
  }, [location?.name, location?.place_id]);

  return (
    <div
      className={cn(
        'relative flex items-center border-b-2 border-stitch-outline/30 focus-within:border-stitch-primary transition-all pb-2',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <span className="mr-4 shrink-0 text-stitch-primary">{icon}</span>
      <input
        ref={inputRef}
        type="text"
        defaultValue={location?.name ?? ''}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          if (e.target.value.trim() === '') {
            onResolved(null);
          }
        }}
        className="bg-transparent border-none focus:ring-0 w-full text-stitch-on-surface placeholder:text-stitch-surface-highest/60 font-medium"
      />
    </div>
  );
}
