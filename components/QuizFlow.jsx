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
  const [questions, setQuestions] = React.useState([]);
  const [current, setCurrent] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [showFeedback, setShowFeedback] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/quiz')
      .then((res) => res.json())
      .then(setQuestions);
  }, []);

  if (!questions.length) return null;

  const q = questions[current];
  const isCorrect = selected === q.correctIndex;

  return (
    <div>
      <h1
        style={{
          color: questionColor,
          fontSize: questionFontSize,
        }}
      >
        {q.question}
      </h1>

      {q.options.map((opt, i) => (
        <label key={i} style={{ display: 'block', margin: '12px 0' }}>
          <input
            type='radio'
            name='option'
            checked={selected === i}
            onChange={() => {
              setSelected(i);
              setShowFeedback(true);
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

      {showFeedback && (
        <p style={{ color: isCorrect ? correctColor : incorrectColor }}>
          {isCorrect ? q.correctFeedback : q.incorrectFeedback}
        </p>
      )}

      {showFeedback && (
        <button
          style={{
            background: buttonBg,
            color: buttonColor,
            padding: '12px 24px',
            marginTop: 20,
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => {
            setSelected(null);
            setShowFeedback(false);
            setCurrent(current + 1);
          }}
          disabled={current === questions.length - 1}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
