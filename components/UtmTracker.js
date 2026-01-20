'use client';

import { useEffect } from 'react';

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
];

export default function UtmTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const utms = {};
    let found = false;

    UTM_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) {
        utms[key] = value;
        found = true;
      }
    });

    // If no UTMs in URL, keep previous ones (optional behavior)
    if (!found) return;

    const payload = {
      ...utms,
      landing_page: window.location.href,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('utm_last_touch', JSON.stringify(payload));
  }, []);

  return null;
}
