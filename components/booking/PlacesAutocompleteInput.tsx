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
  const [error, setError] = React.useState<string | null>(null);
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
          const types = Array.isArray(place.types) ? [...place.types] : [];

          // Identify if the location is a specific point vs a broad region
          const isPrecise = types.some((t) => 
            ['establishment', 'point_of_interest', 'street_address', 'premise', 'subpremise', 'route', 'airport', 'park', 'sublocality', 'neighborhood'].includes(t)
          );
          
          const isGeneric = types.some((t) => 
            ['locality', 'administrative_area_level_1', 'administrative_area_level_2', 'country', 'political', 'postal_code'].includes(t)
          );

          // If it's a broad region and doesn't have a precise point marker, reject it
          if (!geom || !place.place_id || (isGeneric && !isPrecise)) {
            input.value = '';
            onResolvedRef.current(null);
            setError('Please select a specific landmark or address, not just a city.');
            return;
          }

          setError(null);
          const name = place.formatted_address || place.name || input.value;
          const formatted_address = place.formatted_address ?? name;
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
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'relative flex items-center border-b-2 border-stitch-outline/30 focus-within:border-stitch-primary transition-all pb-2',
          error && 'border-red-400',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <span className={cn('mr-4 shrink-0 text-stitch-primary', error && 'text-red-400')}>
          {icon}
        </span>
        <input
          ref={inputRef}
          type="text"
          defaultValue={location?.name ?? ''}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            if (error) setError(null);
            if (e.target.value.trim() === '') {
              onResolved(null);
            }
          }}
          className="bg-transparent border-none focus:ring-0 w-full text-stitch-on-surface placeholder:text-stitch-surface-highest/60 font-medium"
        />
      </div>
      
      {error && (
        <div className="absolute top-full left-10 mt-2 text-[10px] font-medium uppercase tracking-wider text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </div>
      )}
    </div>
  );
}
