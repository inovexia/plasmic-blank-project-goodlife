'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { PLASMIC } from '../plasmic-init';

/* ---------------- FALLBACK CAPTCHA HELPERS ---------------- */

function generateText(length = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

function drawCaptcha(canvas, text) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random()})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
  }

  ctx.font = '26px Arial';
  ctx.fillStyle = '#555';
  ctx.setTransform(1, 0.1, -0.1, 1, 0, 0);
  ctx.fillText(text, 20, 35);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = '#999';
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }
}

/* ---------------- COMPONENT ---------------- */

export default function PlasmicRecaptcha({
  siteKey,
  version = 'v2', // 🔹 NEW
  enabled = true,
  fallbackEnabled = true,
  onVerify,
}) {
  const recaptchaRef = useRef(null);
  const canvasRef = useRef(null);

  const [captcha, setCaptcha] = useState(generateText());
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle');

  /* ---------- FALLBACK ---------- */

  useEffect(() => {
    if (canvasRef.current) {
      drawCaptcha(canvasRef.current, captcha);
    }
  }, [captcha]);

  const refresh = () => {
    setCaptcha(generateText());
    setInput('');
    setStatus('idle');
    onVerify?.(false);
  };

  const verifyFallback = () => {
    const ok = input.toUpperCase() === captcha;
    setStatus(ok ? 'success' : 'error');
    onVerify?.(ok);
  };

  /* ---------- GOOGLE CAPTCHA VERIFY ---------- */

  const verifyToken = async (token) => {
    const res = await fetch('/api/verify-captcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, version }),
    });

    const data = await res.json();
    onVerify?.(!!data.success);
  };

  /* ---------- V3 AUTO EXECUTION ---------- */

  useEffect(() => {
    if (enabled && version === 'v3' && siteKey && recaptchaRef.current) {
      recaptchaRef.current.executeAsync().then((token) => {
        verifyToken(token);
      });
    }
  }, [enabled, version, siteKey]);

  /* ---------- FALLBACK UI ---------- */

  if (!enabled || !siteKey) {
    if (!fallbackEnabled) return null;

    return (
      <div style={{ maxWidth: 300 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <canvas
            ref={canvasRef}
            width={180}
            height={50}
            style={{ border: '1px solid #ccc' }}
          />
          <button onClick={refresh}>🔄</button>
        </div>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Enter text'
          style={{ width: '100%', padding: 6 }}
        />

        <button
          onClick={verifyFallback}
          style={{ width: '100%', marginTop: 6 }}
        >
          Verify
        </button>

        {status === 'success' && (
          <div style={{ color: 'green' }}>✔ Verified</div>
        )}
        {status === 'error' && <div style={{ color: 'red' }}>✖ Incorrect</div>}
      </div>
    );
  }

  /* ---------- GOOGLE reCAPTCHA ---------- */

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={siteKey}
      size={version === 'v3' ? 'invisible' : 'normal'}
      onChange={verifyToken}
    />
  );
}

/* ---------------- PLASMIC REGISTRATION ---------------- */

PLASMIC.registerComponent(PlasmicRecaptcha, {
  name: 'Recaptcha',
  props: {
    siteKey: {
      type: 'string',
      defaultValue: '',
    },
    version: {
      type: 'choice',
      options: ['v2', 'v3'],
      defaultValue: 'v2',
      description: 'Select reCAPTCHA version',
    },
    enabled: {
      type: 'boolean',
      defaultValue: true,
    },
    fallbackEnabled: {
      type: 'boolean',
      defaultValue: true,
    },
    onVerify: {
      type: 'eventHandler',
      argTypes: [{ name: 'success', type: 'boolean' }],
    },
  },
});
