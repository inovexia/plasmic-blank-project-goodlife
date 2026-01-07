'use client';

import { useEffect, useRef } from 'react';
import { PLASMIC } from '../plasmic-init';

export default function DemoCard({ rewardText }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    // scratch logic
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width={300} height={150} />
      <p>{rewardText}</p>
    </div>
  );
}
