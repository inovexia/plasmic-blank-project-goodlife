'use client';

import { useEffect, useRef, useState } from 'react';
import { PLASMIC } from '../plasmic-init';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const DEFAULT_EVENT_ID = 'fa69234d-55c1-4439-9c32-6dbfcacfb48a';

const PREVIEW_PRIZE = {
  title: '🎁 Sample Prize',
  url: null,
};

const isValidUUID = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export default function PrizeScratchCard(props) {
  const {
    eventId,
    width = 300,
    height = 180,
    coverColor = '#B0B0B0',
    scratchThreshold = 60,
    scratchBrushSize = 30,

    popupTitle = 'Congratulations!',
    popupMessage = 'You won a special prize',
    buttonText = 'Claim Now',
    buttonLink = '#',

    buttonBgColor = '#28a745',
    buttonTextColor = '#ffffff',
    popupBgColor = '#ffffff',
    showClose = true,
  } = props;

  const canvasRef = useRef(null);

  const [prize, setPrize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [imageError, setImageError] = useState(false);

  /* ✅ OFFICIAL PLASMIC PREVIEW FLAG */
  const isPlasmicPreview =
    typeof window !== 'undefined' && !!window.__PLASMIC_PREVIEW__;

  /* ================= FETCH PRIZE ================= */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchPrize = async () => {
      try {
        setLoading(true);
        setError(false);

        /* ✅ PLASMIC EDITOR → SAMPLE DATA */
        if (isPlasmicPreview) {
          setPrize(PREVIEW_PRIZE);
          setLoading(false);
          return;
        }

        const email = localStorage.getItem('lead_email');
        const form_handle = localStorage.getItem('form_handle');

        /* ❌ LIVE SITE → DO NOT SHOW SAMPLE */
        if (!email || !form_handle) {
          throw new Error('Missing email or form_handle');
        }

        const cleanedEventId = (eventId || '').trim();
        const finalEventId =
          cleanedEventId && isValidUUID(cleanedEventId)
            ? cleanedEventId
            : DEFAULT_EVENT_ID;

        const res = await fetch(
          `${API_BASE_URL}/event/${finalEventId}/prize`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, form_handle }),
          }
        );

        if (!res.ok) throw new Error('API failed');

        const data = await res.json();
        if (!data?.success || !data?.payload)
          throw new Error('Invalid API response');

        setPrize({
          title: data.payload.title,
          url: data.payload.url || null,
        });
      } catch (err) {
        console.error('Prize API error:', err);
        setError(true);
        setPrize(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrize();
  }, [eventId, isPlasmicPreview]);

  /* ================= SCRATCH LOGIC ================= */
  useEffect(() => {
    if (!prize || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = coverColor;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'destination-out';

    let isDrawing = false;

    const scratch = (x, y) => {
      ctx.beginPath();
      ctx.arc(x, y, scratchBrushSize, 0, Math.PI * 2);
      ctx.fill();
    };

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches?.[0];
      return {
        x: (t ? t.clientX : e.clientX) - rect.left,
        y: (t ? t.clientY : e.clientY) - rect.top,
      };
    };

    const down = () => (isDrawing = true);

    const up = () => {
      isDrawing = false;

      const pixels = ctx.getImageData(0, 0, width, height).data;
      let cleared = 0;

      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) cleared++;
      }

      if ((cleared / (width * height)) * 100 >= scratchThreshold) {
        setShowPopup(true);
      }
    };

    const move = (e) => {
      if (!isDrawing) return;
      const { x, y } = getPos(e);
      scratch(x, y);
    };

    canvas.addEventListener('mousedown', down);
    canvas.addEventListener('mouseup', up);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('touchstart', down);
    canvas.addEventListener('touchend', up);
    canvas.addEventListener('touchmove', move);

    return () => {
      canvas.removeEventListener('mousedown', down);
      canvas.removeEventListener('mouseup', up);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('touchstart', down);
      canvas.removeEventListener('touchend', up);
      canvas.removeEventListener('touchmove', move);
    };
  }, [prize, width, height, coverColor, scratchThreshold, scratchBrushSize]);

  /* ================= UI ================= */
  if (loading) return <p>Loading prize…</p>;

  if (error)
    return (
      <p style={{ color: 'red', textAlign: 'center' }}>
        Unable to load prize
      </p>
    );

  if (!prize) return null;

  return (
    <>
      <div style={{ position: 'relative', width, height }}>
        <div
          style={{
            width,
            height,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
          }}
        >
          {prize.url && !imageError ? (
            <img
              src={prize.url}
              alt={prize.title}
              style={{ width, height, borderRadius: 8 }}
              onError={() => setImageError(true)}
            />
          ) : (
            <span style={{ fontWeight: 'bold', fontSize: 18 }}>
              {prize.title}
            </span>
          )}
        </div>

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            cursor: 'pointer',
            borderRadius: 8,
          }}
        />
      </div>

      {showPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: popupBgColor,
              padding: 24,
              borderRadius: 12,
              width: 320,
              position: 'relative',
              textAlign: 'center',
            }}
          >
            {showClose && (
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 20,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            )}

            <h2>{popupTitle}</h2>
            <p>{popupMessage}</p>

            <a href={buttonLink} target="_blank" rel="noopener noreferrer">
              <button
                style={{
                  marginTop: 16,
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: buttonBgColor,
                  color: buttonTextColor,
                  cursor: 'pointer',
                }}
              >
                {buttonText}
              </button>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= PLASMIC ================= */
PLASMIC.registerComponent(PrizeScratchCard, {
  name: 'Prize Scratch Card',
  props: {
    eventId: { type: 'string' },
    width: { type: 'number', defaultValue: 300 },
    height: { type: 'number', defaultValue: 180 },
    coverColor: { type: 'color', defaultValue: '#B0B0B0' },
    scratchThreshold: { type: 'number', defaultValue: 60 },
    scratchBrushSize: { type: 'number', defaultValue: 30 },
    popupTitle: { type: 'string', defaultValue: 'Congratulations!' },
    popupMessage: { type: 'string', defaultValue: 'You won a special prize!' },
    popupBgColor: { type: 'color', defaultValue: '#ffffff' },
    showClose: { type: 'boolean', defaultValue: true },
    buttonText: { type: 'string', defaultValue: 'Claim Now' },
    buttonLink: { type: 'href' },
    buttonBgColor: { type: 'color', defaultValue: '#28a745' },
    buttonTextColor: { type: 'color', defaultValue: '#ffffff' },
  },
});
