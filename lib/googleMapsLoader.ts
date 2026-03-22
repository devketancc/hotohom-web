import { env } from '@/config/env';

const SCRIPT_ID = 'motohom-google-maps-js';

/** Google Maps browser keys are typically ~39 characters. */
const MIN_BROWSER_KEY_LEN = 35;

function scriptSrcForKey(key: string) {
  return `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
}

/**
 * Loads Maps JavaScript API + places library once (shared with map embeds).
 */
export function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  const key = env.GOOGLE_MAPS_KEY;

  if (!key) {
    return Promise.reject(new Error('NEXT_PUBLIC_GOOGLE_MAPS_KEY is not set'));
  }
  if (key.length < MIN_BROWSER_KEY_LEN) {
    console.error(
      `[Motohom] NEXT_PUBLIC_GOOGLE_MAPS_KEY looks truncated or invalid (length ${key.length}, expected ~39). ` +
        'Check .env.local first — it overrides .env.development. Remove placeholder values or paste the full AIza… key, then restart `npm run dev`.'
    );
    return Promise.reject(
      new Error(
        `Google Maps API key is too short (${key.length} chars). Paste the full key from Google Cloud and restart the dev server.`
      )
    );
  }

  const desiredSrc = scriptSrcForKey(key);
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  const existingMatchesKey =
    existing &&
    (existing.src === desiredSrc ||
      existing.src.includes(`key=${encodeURIComponent(key)}`) ||
      existing.src.includes(`key=${key}`));

  if (existing && !existingMatchesKey) {
    existing.remove();
    try {
      delete (window as unknown as { google?: unknown }).google;
    } catch {
      /* ignore */
    }
  } else if (existingMatchesKey && window.google?.maps?.places) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const stillThere = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (stillThere && (stillThere.src === desiredSrc || stillThere.src.includes(key))) {
      const done = () => {
        if (window.google?.maps?.places) resolve();
        else reject(new Error('Google Maps Places failed to initialize'));
      };
      if (stillThere.getAttribute('data-loaded') === '1' || window.google?.maps?.places) {
        done();
        return;
      }
      stillThere.addEventListener('load', done);
      stillThere.addEventListener('error', () => reject(new Error('Google Maps script error')));
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = desiredSrc;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.setAttribute('data-loaded', '1');
      if (window.google?.maps?.places) resolve();
      else reject(new Error('Google Maps Places failed to initialize'));
    };
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}
