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
  /** 'underline' (default, legacy) or 'boxed' (rounded field used in the journey planner). */
  variant?: 'underline' | 'boxed';
}

export function PlacesAutocompleteInput({
  stopId,
  location,
  onResolved,
  placeholder,
  icon,
  disabled,
  className,
  variant = 'underline',
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

  const boxed = variant === 'boxed';

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'relative flex items-center transition-all',
          boxed
            ? 'gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 focus-within:border-stitch-primary/40 focus-within:bg-white/[0.05]'
            : 'gap-0 border-b-2 border-stitch-outline/30 pb-2 focus-within:border-stitch-primary',
          error && (boxed ? 'border-red-400/60' : 'border-red-400'),
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <span className={cn('shrink-0 text-stitch-primary', !boxed && 'mr-4', error && 'text-red-400')}>
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
          className={cn(
            'w-full border-none bg-transparent font-medium text-stitch-on-surface placeholder:text-stitch-surface-highest/60 focus:ring-0 focus:outline-none',
            boxed && 'text-sm'
          )}
        />
      </div>

      {error && (
        <div className={cn('mt-1.5 text-[10px] font-medium uppercase tracking-wider text-red-400 animate-in fade-in slide-in-from-top-1 duration-200', !boxed && 'absolute top-full left-10')}>
          {error}
        </div>
      )}
    </div>
  );
}
