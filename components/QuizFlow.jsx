'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PLASMIC } from '../plasmic-init';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ---------------- NORMALIZE QUESTIONS ---------------- */
function normalizeQuestions(questions = []) {
  return questions.map((q, qIndex) => ({
    id: q.id ?? qIndex + 1,
    question: q.question,
    options: q.answers.map((a, i) => ({
      id: a.id ?? i,
      label: a.choice,
      isCorrect: a.is_correct,
      feedback: a.feedback,
    })),
  }));
}

function QuizFlow({
  quizId,
  redirectUrl = '/quiz-result',

  /* ---------- QUESTION ---------- */
  questionFontSize = 48,
  questionFontSizeMobile = 28,
  questionColor = '#ffffff',
  questionAlign = 'center',

  /* ---------- OPTIONS ---------- */
  optionFontSize = 18,
  optionFontSizeMobile = 16,
  optionColor = '#ffffff',
  radioSize = 18,

  /* ---------- FEEDBACK ---------- */
  feedbackFontSize = 16,
  feedbackFontSizeMobile = 14,
  feedbackColor = '#000000',
  correctColor = '#1fbf75',
  incorrectColor = '#ff4d4f',

  /* ---------- BUTTON ---------- */
  buttonText = 'Next',
  buttonBg = '#0b4a8b',
  buttonColor = '#ffffff',
}) {
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ---------------- LOAD QUIZ ---------------- */
  useEffect(() => {
    if (!quizId) return;

    async function loadQuiz() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/collections/quizzes/entries/${quizId}`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error();

        const json = await res.json();
        setQuestions(normalizeQuestions(json?.data?.questions || []));
      } catch {
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [quizId]);

  if (loading) return <div>Loading quiz…</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const selectedOption = selected !== null ? q.options[selected] : null;

  function handleSelect(index) {
    if (locked) return;
    setSelected(index);
    setLocked(true);

    setAnswers((prev) => ({
      ...prev,
      [q.id]: q.options[index].id,
    }));
  }

  async function handleNext() {
    if (!isLast) {
      setSelected(null);
      setLocked(false);
      setCurrent((c) => c + 1);
      return;
    }

    try {
      const formData = new FormData();

      const storedEmail =
        typeof window !== 'undefined' ? localStorage.getItem('lead_email') : '';

      const storedFormHandle =
        typeof window !== 'undefined'
          ? localStorage.getItem('form_handle')
          : '';

      if (storedEmail) formData.append('email', storedEmail);
      if (storedFormHandle) formData.append('form_handle', storedFormHandle);

      Object.entries(answers).forEach(([qid, oid]) => {
        formData.append(`answers[${qid}]`, oid);
      });

      await fetch(`${API_BASE_URL}/quiz/${quizId}/submit`, {
        method: 'POST',
        body: formData,
      });

      router.push(redirectUrl);
    } catch {
      alert('Quiz submission failed');
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div
      style={{
        padding: 40,
        textAlign: questionAlign,
        /* CSS VARIABLES */
        '--q-font': `${questionFontSize}px`,
        '--q-font-m': `${questionFontSizeMobile}px`,
        '--opt-font': `${optionFontSize}px`,
        '--opt-font-m': `${optionFontSizeMobile}px`,
        '--fb-font': `${feedbackFontSize}px`,
        '--fb-font-m': `${feedbackFontSizeMobile}px`,
      }}
    >
      <style>{`
        .quiz-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          max-width: 900px;
          margin: 40px auto 0;
          align-items: start;
        }

        .quiz-question {
          font-size: var(--q-font);
        }

        .quiz-option {
          font-size: var(--opt-font);
        }

        .quiz-feedback {
          font-size: var(--fb-font);
        }

        @media (max-width: 768px) {
          .quiz-grid {
            grid-template-columns: 1fr;
          }
          .quiz-question {
            font-size: var(--q-font-m);
          }
          .quiz-option {
            font-size: var(--opt-font-m);
          }
          .quiz-feedback {
            font-size: var(--fb-font-m);
          }
        }
      `}</style>

      <h2
        className='quiz-question'
        style={{
          color: questionColor,
          marginBottom: 40,
          textAlign: questionAlign,
        }}
      >
        {q.question}
      </h2>

      <div className='quiz-grid'>
        {/* OPTIONS */}
        <div style={{ textAlign: 'left' }}>
          {q.options.map((opt, i) => (
            <label
              key={opt.id}
              className='quiz-option'
              style={{
                display: 'flex',
                gap: 10,
                marginBottom: 16,
                color: optionColor,
                cursor: locked ? 'default' : 'pointer',
              }}
            >
              <input
                type='radio'
                disabled={locked}
                checked={selected === i}
                onChange={() => handleSelect(i)}
                style={{ width: radioSize, height: radioSize }}
              />
              {opt.label}
            </label>
          ))}
        </div>

        {/* FEEDBACK */}
        <div style={{ textAlign: 'left', minHeight: 120 }}>
          {selectedOption && (
            <>
              <div
                className='quiz-feedback'
                style={{
                  fontWeight: 600,
                  color: selectedOption.isCorrect
                    ? correctColor
                    : incorrectColor,
                  marginBottom: 8,
                }}
              >
                {selectedOption.isCorrect ? 'Correct!' : 'Incorrect'}
              </div>

              {selectedOption.feedback && (
                <div className='quiz-feedback' style={{ color: feedbackColor }}>
                  {selectedOption.feedback}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selected !== null && (
        <button
          onClick={handleNext}
          style={{
            marginTop: 50,
            padding: '14px 44px',
            background: buttonBg,
            color: buttonColor,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isLast ? 'Submit' : buttonText}
        </button>
      )}
    </div>
  );
}

/* ---------------- PLASMIC REGISTRATION ---------------- */
PLASMIC.registerComponent(QuizFlow, {
  name: 'Quiz Flow',
  props: {
    quizId: { type: 'string' },
    redirectUrl: { type: 'string', defaultValue: '/quiz-result' },

    questionFontSize: { type: 'number' },
    questionFontSizeMobile: { type: 'number', defaultValue: 28 },
    questionColor: { type: 'color' },
    questionAlign: {
      type: 'choice',
      options: ['left', 'center', 'right'],
      defaultValue: 'center',
    },

    optionFontSize: { type: 'number' },
    optionFontSizeMobile: { type: 'number', defaultValue: 16 },
    optionColor: { type: 'color' },
    radioSize: { type: 'number' },

    feedbackFontSize: { type: 'number' },
    feedbackFontSizeMobile: { type: 'number', defaultValue: 14 },
    feedbackColor: { type: 'color' },
    correctColor: { type: 'color' },
    incorrectColor: { type: 'color' },

    buttonText: { type: 'string' },
    buttonBg: { type: 'color' },
    buttonColor: { type: 'color' },
  },
});

export default QuizFlow;
