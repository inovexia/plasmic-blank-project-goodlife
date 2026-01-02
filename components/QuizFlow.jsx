'use client';

import React, { useState, useEffect } from 'react';

export default function QuizFlow({
  questionColor = '#ffffff',
  questionFontSize = 36,

  optionColor = '#ffffff',
  optionFontSize = 18,

  correctColor = 'green',
  incorrectColor = 'red',

  buttonText = 'Next',
  buttonBg = '#0b4a8b',
  buttonColor = '#ffffff',
}) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    fetch('/api/quiz')
      .then((res) => res.json())
      .then(setQuestions);
  }, []);

  if (!questions.length) return null;

  const q = questions[current];
  const isCorrect = selected === q.correctIndex;

  return (
    <div>
      {/* Question */}
      <h1
        style={{
          color: questionColor,
          fontSize: questionFontSize,
        }}
      >
        {q.question}
      </h1>

      {/* Options */}
      {q.options.map((opt, i) => (
        <label key={i} style={{ display: 'block', margin: '12px 0' }}>
          <input
            type='radio'
            name={`option-${current}`}
            checked={selected === i}
            disabled={locked}
            onChange={() => {
              if (locked) return;
              setSelected(i);
              setShowFeedback(true);
              setLocked(true);
            }}
          />
          <span
            style={{
              color: optionColor,
              fontSize: optionFontSize,
              marginLeft: 8,
            }}
          >
            {opt}
          </span>
        </label>
      ))}

      {/* Feedback */}
      {showFeedback && (
        <p style={{ color: isCorrect ? correctColor : incorrectColor }}>
          {isCorrect ? q.correctFeedback : q.incorrectFeedback}
        </p>
      )}

      {/* Next Button */}
      {showFeedback && (
        <button
          style={{
            background: buttonBg,
            color: buttonColor,
            padding: '12px 24px',
            marginTop: 20,
            border: 'none',
            cursor: 'pointer',
            opacity: current === questions.length - 1 ? 0.6 : 1,
          }}
          onClick={() => {
            setSelected(null);
            setShowFeedback(false);
            setLocked(false);
            setCurrent((prev) => prev + 1);
          }}
          disabled={current === questions.length - 1}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
