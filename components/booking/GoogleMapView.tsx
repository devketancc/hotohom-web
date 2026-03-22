'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { env } from '@/config/env';
import { Loader2, Navigation, Clock, Ruler } from 'lucide-react';

interface GoogleMapViewProps {
  pickup: string;
  dropoff: string;
  onRouteCalculated?: (distanceKm: number) => void;
}

export const GoogleMapView = ({ pickup, dropoff, onRouteCalculated }: GoogleMapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  const initMap = () => {
    if (!mapRef.current) return;

    try {
      const google = window.google;
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        styles: darkThemeStyles, // Custom dark theme
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
  };

  useEffect(() => {
    if (map && pickup && dropoff) {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#ffd682',
          strokeWeight: 6,
          strokeOpacity: 0.8,
        },
      });

      directionsService.route(
        {
          origin: pickup,
          destination: dropoff,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (
          result: google.maps.DirectionsResult | null,
          status: google.maps.DirectionsStatus
        ) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
            const route = result.routes[0].legs[0];
            setRouteInfo({
              distance: route.distance?.text || 'N/A',
              duration: route.duration?.text || 'N/A',
            });
            
            if (onRouteCalculated && route.distance?.value) {
              onRouteCalculated(route.distance.value / 1000); // km
            }
          } else {
            setError(`Could not calculate route: ${status}`);
          }
        }
      );
    }
  }, [map, pickup, dropoff, onRouteCalculated]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-stitch-outline/20">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${env.GOOGLE_MAPS_KEY}&libraries=places`}
        onLoad={initMap}
      />
      
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-stitch-background flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-stitch-primary" size={40} />
          <p className="text-stitch-on-surface-variant font-bold uppercase tracking-widest text-sm animate-pulse">
            Calibrating Map Satellite...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 bg-stitch-background/90 flex flex-col items-center justify-center p-8 text-center gap-4">
          <div className="bg-destructive/10 p-4 rounded-full">
            <Navigation className="text-destructive rotate-45" size={40} />
          </div>
          <h3 className="text-xl font-black uppercase text-stitch-on-background">Navigation Error</h3>
          <p className="text-stitch-on-surface-variant max-w-xs">{error}</p>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Floating Route Info Overlay */}
      {routeInfo && !error && (
        <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-80 glass-card rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-stitch-primary flex items-center gap-2">
              <Navigation size={12} />
              Journey Summary
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-stitch-on-surface-variant/60 flex items-center gap-1">
                  <Ruler size={10} /> Distance
                </span>
                <p className="text-xl font-black text-stitch-on-background">{routeInfo.distance}</p>
              </div>
              <div className="space-y-1 border-l border-stitch-outline/20 pl-4">
                <span className="text-[10px] uppercase font-bold text-stitch-on-surface-variant/60 flex items-center gap-1">
                  <Clock size={10} /> Duration
                </span>
                <p className="text-xl font-black text-stitch-on-background">{routeInfo.duration}</p>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="text-[10px] text-stitch-on-surface-variant/80 italic">
                Optimizing for premium caravan experiences...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const darkThemeStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1c2025" }], // Match stitch surface
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];
