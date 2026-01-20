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

    // Prevent overwrite
    if (localStorage.getItem('utm_first_touch')) return;

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

    if (!found) return;

    const payload = {
      ...utms,
      landing_page: window.location.href,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('utm_first_touch', JSON.stringify(payload));
  }, []);

  return null;
}
