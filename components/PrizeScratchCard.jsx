import { useEffect, useRef, useState } from 'react';

export default function PrizeScratchCard({
  width = 300,
  height = 180,
  coverColor = '#B0B0B0',
  prizeImage,
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = coverColor;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'destination-out';

    let isDrawing = false;

    const scratch = (x, y) => {
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
    };

    const down = () => (isDrawing = true);
    const up = () => {
      isDrawing = false;
      checkScratch();
    };

    const move = (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      scratch(e.clientX - rect.left, e.clientY - rect.top);
    };

    const checkScratch = () => {
      const data = ctx.getImageData(0, 0, width, height).data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] === 0) cleared++;
      }
      const percent = (cleared / (width * height)) * 100;
      if (percent > scratchThreshold) setShowPopup(true);
    };

    canvas.addEventListener('mousedown', down);
    canvas.addEventListener('mouseup', up);
    canvas.addEventListener('mousemove', move);

    return () => {
      canvas.removeEventListener('mousedown', down);
      canvas.removeEventListener('mouseup', up);
      canvas.removeEventListener('mousemove', move);
    };
  }, [width, height, coverColor, scratchThreshold]);

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

/* Styles */
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const popupStyle = {
  position: 'relative',
  padding: 24,
  borderRadius: 12,
  textAlign: 'center',
  width: 320,
};

const buttonStyle = {
  marginTop: 16,
  padding: '10px 20px',
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer',
  fontSize: 16,
};

const closeStyle = {
  position: 'absolute',
  top: 10,
  right: 10,
  border: 'none',
  background: 'transparent',
  fontSize: 20,
  cursor: 'pointer',
};
