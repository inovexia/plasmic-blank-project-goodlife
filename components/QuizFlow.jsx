'use client';
import React, { useEffect, useState } from 'react';

/* Normalize API response */
function normalizeQuiz(data) {
  return data.questions.map((q) => {
    const choiceObj = q.choices[0];
    const options = Object.values(choiceObj).map((arr) => arr[0]);

    return {
      question: q.question,
      options: options.map((o) => ({
        label: o.choice,
        isCorrect: o.isCorrect,
        feedback: o.feedback,
      })),
    };
  });
}

export default function QuizFlow({
  apiUrl = '/api/quiz',

  questionColor = '#000',
  questionFontSize = 32,
  questionLineHeight = 1.3,

  optionColor = '#333',
  optionFontSize = 18,
  optionLineHeight = 1.4,

  correctColor = 'green',
  incorrectColor = 'red',

  buttonText = 'Next',
  buttonBg = '#0b4a8b',
  buttonColor = '#fff',
  buttonFontSize = 16,
}) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(normalizeQuiz(data));
      });
  }, [apiUrl]);

  if (!questions.length) return <div>Loading quiz…</div>;

  const q = questions[current];
  const selectedOption = selected !== null ? q.options[selected] : null;

  return (
    <div>
      {/* Question */}
      <h2
        style={{
          color: questionColor,
          fontSize: questionFontSize,
          lineHeight: questionLineHeight,
        }}
      >
        {q.question}
      </h2>

      {/* Options */}
      {q.options.map((opt, i) => (
        <label key={i} style={{ display: 'block', margin: '12px 0' }}>
          <input
            type='radio'
            name={`q-${current}`}
            disabled={locked}
            checked={selected === i}
            onChange={() => {
              if (locked) return;
              setSelected(i);
              setLocked(true);
            }}
          />
          <span
            style={{
              marginLeft: 8,
              color: optionColor,
              fontSize: optionFontSize,
              lineHeight: optionLineHeight,
            }}
          >
            {opt.label}
          </span>
        </label>
      ))}

      {/* Feedback */}
      {selectedOption && (
        <p
          style={{
            color: selectedOption.isCorrect ? correctColor : incorrectColor,
          }}
        >
          {selectedOption.feedback}
        </p>
      )}

      {/* Next Button */}
      {selectedOption && current < questions.length - 1 && (
        <button
          style={{
            marginTop: 20,
            background: buttonBg,
            color: buttonColor,
            fontSize: buttonFontSize,
            padding: '12px 24px',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => {
            setSelected(null);
            setLocked(false);
            setCurrent((c) => c + 1);
          }}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
