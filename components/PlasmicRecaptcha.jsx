import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export default function PlasmicRecaptcha({
  siteKey,
  enabled = true,
  fallbackEnabled = true,
  onVerify,
}) {
  const [fallbackValue] = useState(
    Math.floor(1000 + Math.random() * 9000).toString()
  );
  const [userInput, setUserInput] = useState('');

  const handleCaptcha = async (token) => {
    const res = await fetch('/api/verify-captcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    onVerify?.(data.success);
  };

  // 🚨 Fallback if no site key
  if (!enabled || !siteKey) {
    if (!fallbackEnabled) return null;

    return (
      <div>
        <p>
          Enter the number: <strong>{fallbackValue}</strong>
        </p>
        <input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button onClick={() => onVerify?.(userInput === fallbackValue)}>
          Verify
        </button>
      </div>
    );
  }

  return <ReCAPTCHA sitekey={siteKey} onChange={handleCaptcha} />;
}
