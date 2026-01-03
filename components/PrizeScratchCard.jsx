import { useEffect, useRef, useState } from 'react';

export default function PrizeScratchCard({
  width = 300,
  height = 180,
  coverColor = '#B0B0B0',

  apiUrl,
  imageKey = 'file',

  fallbackImage = 'https://picsum.photos/400/300',

  scratchThreshold = 60,

  popupTitle = '🎉 Congratulations!',
  popupMessage = 'You won a special prize',
  buttonText = 'Claim Now',
  buttonLink = '#',

  buttonBgColor = '#28a745',
  buttonTextColor = '#ffffff',
  popupBgColor = '#ffffff',
  showClose = true,
}) {
  const canvasRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [prizeImage, setPrizeImage] = useState(null);
  const [error, setError] = useState(false);

  /* ✅ FETCH IMAGE SAFELY */
  useEffect(() => {
    if (!apiUrl) {
      setPrizeImage(fallbackImage);
      return;
    }

    // Direct image API (no JSON)
    if (!imageKey) {
      setPrizeImage(apiUrl);
      return;
    }

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then((data) => {
        const img = data?.[imageKey];
        if (!img) throw new Error('Invalid image key');
        setPrizeImage(img);
      })
      .catch(() => {
        console.warn('ScratchCard API failed, using fallback image');
        setError(true);
        setPrizeImage(fallbackImage);
      });
  }, [apiUrl, imageKey, fallbackImage]);

  /* ✅ INIT SCRATCH ONLY WHEN IMAGE IS READY */
  useEffect(() => {
    if (!prizeImage || !canvasRef.current) return;

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
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
    };

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches?.[0];
      return {
        x: (touch ? touch.clientX : e.clientX) - rect.left,
        y: (touch ? touch.clientY : e.clientY) - rect.top,
      };
    };

    const down = () => (isDrawing = true);
    const up = () => {
      isDrawing = false;
      checkScratch();
    };

    const move = (e) => {
      if (!isDrawing) return;
      const { x, y } = getPos(e);
      scratch(x, y);
    };

    const checkScratch = () => {
      const data = ctx.getImageData(0, 0, width, height).data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] === 0) cleared++;
      }
      if ((cleared / (width * height)) * 100 > scratchThreshold) {
        setShowPopup(true);
      }
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
  }, [prizeImage, width, height, coverColor, scratchThreshold]);

  if (!prizeImage) return <p>Loading scratch card…</p>;

  return (
    <>
      <div style={{ position: 'relative', width, height }}>
        <img
          src={prizeImage}
          alt='Prize'
          style={{ width, height, borderRadius: 8 }}
        />

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
        <div style={overlayStyle}>
          <div style={{ ...popupStyle, background: popupBgColor }}>
            {showClose && (
              <button onClick={() => setShowPopup(false)} style={closeStyle}>
                ✕
              </button>
            )}
            <h2>{popupTitle}</h2>
            <p>{popupMessage}</p>
            <a href={buttonLink} target='_blank' rel='noopener noreferrer'>
              <button
                style={{
                  ...buttonStyle,
                  background: buttonBgColor,
                  color: buttonTextColor,
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
