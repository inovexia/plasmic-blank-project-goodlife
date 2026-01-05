'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/* Normalize API response */
function normalizeQuiz(data) {
  return data.questions.map((q, qIndex) => {
    const choiceObj = q.choices[0];
    const options = Object.values(choiceObj).map((arr) => arr[0]);

    return {
      id: qIndex,
      question: q.question,
      options: options.map((o, i) => ({
        id: i,
        label: o.choice,
        isCorrect: o.isCorrect,
        feedback: o.feedback,
      })),
    };
  });
}

export default function QuizFlow({
  apiUrl = '/api/quiz',

  submitApiUrl = '/api/quiz-submit',
  redirectUrl = '/quiz-result',

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
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  // ⭐ Store all answers
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setQuestions(normalizeQuiz(data)));
  }, [apiUrl]);

  if (!questions.length) return <div>Loading quiz…</div>;

  const q = questions[current];
  const selectedOption = selected !== null ? q.options[selected] : null;
  const isLast = current === questions.length - 1;

  function handleSelect(index) {
    if (locked) return;

    setSelected(index);
    setLocked(true);

    // ⭐ Save answer
    setAnswers((prev) => [
      ...prev,
      {
        questionId: q.id,
        question: q.question,
        selectedOption: q.options[index].label,
        isCorrect: q.options[index].isCorrect,
      },
    ]);
  }

  async function handleNext() {
    if (isLast) {
      // ⭐ Submit all answers
      const res = await fetch(submitApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const result = await res.json();

      // ⭐ Redirect with result ID
      router.push(`${redirectUrl}?resultId=${result.id}`);
      return;
    }

    setSelected(null);
    setLocked(false);
    setCurrent((c) => c + 1);
  }

  return (
    <div>
      <h2
        style={{
          color: questionColor,
          fontSize: questionFontSize,
          lineHeight: questionLineHeight,
        }}
      >
        {q.question}
      </h2>

      {q.options.map((opt, i) => (
        <label key={i} style={{ display: 'block', margin: '12px 0' }}>
          <input
            type='radio'
            disabled={locked}
            checked={selected === i}
            onChange={() => handleSelect(i)}
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

      {selectedOption && (
        <p
          style={{
            color: selectedOption.isCorrect ? correctColor : incorrectColor,
          }}
        >
          {selectedOption.feedback}
        </p>
      )}

      {selectedOption && (
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
          onClick={handleNext}
        >
          {isLast ? 'Submit' : buttonText}
        </button>
      )}
    </div>
  );
}
