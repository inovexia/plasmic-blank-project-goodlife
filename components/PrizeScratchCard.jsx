'use client';

import { useEffect, useRef, useState } from 'react';
import { PLASMIC } from '../plasmic-init';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEFAULT_EVENT_ID = 'fa69234d-55c1-4439-9c32-6dbfcacfb48a';

/* ---------- PREVIEW ONLY PRIZE ---------- */
const PREVIEW_PRIZE = {
  title: '🎁 Sample Prize',
  url: null,
};

/* ---------- HELPERS ---------- */
const isValidUUID = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/* ---------- PLASMIC FLAG ---------- */
const isPlasmicPreview =
  typeof window !== 'undefined' && !!window.__PLASMIC_PREVIEW__;

export default function PrizeScratchCard(props) {
  const {
    eventId,
    width = 300,
    height = 180,
    coverColor = '#B0B0B0',
    scratchThreshold = 60,
    scratchBrushSize = 30,

    popupTitle = 'Congratulations!',
    popupMessage = 'You won a prize!',
    buttonText = 'Continue',
    buttonLink = '#',

    buttonBgColor = '#28a745',
    buttonTextColor = '#ffffff',
  } = props;

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [prize, setPrize] = useState({ title: '', url: null });
  const [revealed, setRevealed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPrizeAvailable, setIsPrizeAvailable] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: width, h: height });

  /* ---------- MOBILE DETECT ---------- */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ---------- RESPONSIVE SIZE ---------- */
  useEffect(() => {
    if (!containerRef.current) return;

    if (isMobile) {
      const w = containerRef.current.offsetWidth;
      const h = (w / width) * height;
      setCanvasSize({ w, h });
    } else {
      setCanvasSize({ w: width, h: height });
    }
  }, [isMobile, width, height]);

  /* ================= FETCH PRIZE ================= */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isPlasmicPreview) {
      setPrize(PREVIEW_PRIZE);
      setIsPrizeAvailable(true);
      return;
    }

    const email = localStorage.getItem('lead_email');
    const form_handle = localStorage.getItem('form_handle');

    if (!email || !form_handle) {
      setPrize({ title: 'No prizes available', url: null });
      setIsPrizeAvailable(false);
      return;
    }

    const fetchPrize = async () => {
      try {
        const finalEventId =
          eventId && isValidUUID(eventId.trim())
            ? eventId.trim()
            : DEFAULT_EVENT_ID;

        const res = await fetch(`${API_BASE_URL}/event/${finalEventId}/prize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, form_handle }),
        });

        const data = await res.json();

        if (!data?.success) {
          setPrize({ title: data?.message || 'No prizes available', url: null });
          setIsPrizeAvailable(false);
          return;
        }

        setPrize({
          title: data.payload.title,
          url: data.payload.url || null,
        });
        setIsPrizeAvailable(true);
      } catch {
        setPrize({ title: 'No prizes available', url: null });
        setIsPrizeAvailable(false);
      }
    };

    fetchPrize();
  }, [eventId]);

  /* ================= SCRATCH LOGIC ================= */
  useEffect(() => {
    if (isPlasmicPreview || !canvasRef.current || revealed) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = coverColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'destination-out';

    let drawing = false;

    const lockScroll = () => (document.body.style.overflow = 'hidden');
    const unlockScroll = () => (document.body.style.overflow = '');

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

    const down = () => {
      drawing = true;
      if (isMobile) lockScroll();
    };

    const up = () => {
      drawing = false;
      unlockScroll();

      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) cleared++;
      }

      if ((cleared / (canvas.width * canvas.height)) * 100 >= scratchThreshold) {
        setRevealed(true);
        setShowPopup(true);
      }
    };

    const move = (e) => {
      if (!drawing) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      scratch(x, y);
    };

    canvas.addEventListener('mousedown', down);
    canvas.addEventListener('mouseup', up);
    canvas.addEventListener('mousemove', move);

    canvas.addEventListener('touchstart', down, { passive: false });
    canvas.addEventListener('touchend', up);
    canvas.addEventListener('touchmove', move, { passive: false });

    return () => {
      unlockScroll();
      canvas.removeEventListener('mousedown', down);
      canvas.removeEventListener('mouseup', up);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('touchstart', down);
      canvas.removeEventListener('touchend', up);
      canvas.removeEventListener('touchmove', move);
    };
  }, [canvasSize, scratchBrushSize, scratchThreshold, revealed, isMobile]);

  /* ================= UI ================= */
  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: isMobile ? '100%' : width,
          height: canvasSize.h,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 8,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            textAlign: 'center',
            padding: 12,
          }}
        >
          {prize.url && !imageError ? (
            <img
              src={prize.url}
              alt={prize.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImageError(true)}
            />
          ) : (
            prize.title
          )}
        </div>

        {!isPlasmicPreview && !revealed && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 8,
              cursor: 'pointer',
              touchAction: 'none',
            }}
          />
        )}
      </div>

      {showPopup && (
        <div
          style={{
            marginTop: 24,
            textAlign: 'center',
            maxWidth: isMobile ? '100%' : width,
            marginInline: 'auto',
          }}
        >
          <h2>{popupTitle}</h2>
          <p>
            {isPrizeAvailable
              ? popupMessage
              : 'Thank you for participating! Better luck next time 🎉'}
          </p>

          <a href={buttonLink} target="_blank" rel="noopener noreferrer">
            <button
              style={{
                background: buttonBgColor,
                color: buttonTextColor,
                padding: '10px 22px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {buttonText}
            </button>
          </a>
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
    popupTitle: { type: 'string' },
    popupMessage: { type: 'string' },
    buttonText: { type: 'string' },
    buttonLink: { type: 'href' },
    buttonBgColor: { type: 'color' },
    buttonTextColor: { type: 'color' },
  },
});
