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
  const [status, setStatus] = useState('idle');
  // idle | success | error

  const handleCaptcha = async (token) => {
    try {
      const res = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      setStatus(data.success ? 'success' : 'error');
      onVerify?.(data.success);
    } catch {
      setStatus('error');
      onVerify?.(false);
    }
  };

  // 🚨 Fallback if no site key
  if (!enabled || !siteKey) {
    if (!fallbackEnabled) return null;

    const verifyFallback = () => {
      const isValid = userInput === fallbackValue;
      setStatus(isValid ? 'success' : 'error');
      onVerify?.(isValid);
    };

    return (
      <div style={{ maxWidth: 260 }}>
        <p>
          Enter the number:{' '}
          <strong style={{ letterSpacing: 2 }}>{fallbackValue}</strong>
        </p>

        <input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{
            width: '100%',
            padding: 6,
            marginBottom: 6,
            border: '1px solid #ccc',
            borderRadius: 4,
          }}
        />

        <button
          onClick={verifyFallback}
          style={{
            width: '100%',
            padding: 6,
            cursor: 'pointer',
          }}
        >
          Verify
        </button>

        {status === 'success' && (
          <div style={{ color: 'green', marginTop: 6 }}>✔ Verified</div>
        )}

        {status === 'error' && (
          <div style={{ color: 'red', marginTop: 6 }}>✖ Incorrect code</div>
        )}
      </div>
    );
  }

  return <ReCAPTCHA sitekey={siteKey} onChange={handleCaptcha} />;
}
