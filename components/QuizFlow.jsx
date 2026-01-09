'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PLASMIC } from '../plasmic-init';

/* ---------------- NORMALIZE QUESTIONS ---------------- */
function normalizeQuestions(questions = []) {
  return questions.map((q, qIndex) => ({
    id: qIndex,
    question: q.question,
    options: q.answers.map((a, i) => ({
      id: i,
      label: a.choice,
      isCorrect: a.is_correct,
      feedback: a.feedback,
    })),
  }));
}

function QuizFlow(props) {
  const {
    quizId = '32b396df-fb0c-46ca-ac1c-6ba455c5c8e1',
    apiBaseUrl = 'https://imgen3.dev.developer1.website/api/collections/quizzes/entries',
    submitApiUrl = '/api/quiz-submit',
    redirectUrl = '/quiz-result',

    questionFontSize = 48,
    questionColor = '#000000',

    optionFontSize = 18,
    optionColor = '#000000',
    radioSize = 18,

    feedbackFontSize = 16,
    feedbackColor = '#000000',
    correctColor = '#1fbf75',
    incorrectColor = '#ff4d4f',

    buttonText = 'Next',
    buttonBg = '#0b4a8b',
    buttonColor = '#ffffff',
  } = props;

  const router = useRouter();

  const [quizMeta, setQuizMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ---------------- LOAD QUIZ ---------------- */
  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`${apiBaseUrl}/${quizId}`, {
          cache: 'no-store',
        });

        if (res.status === 404) {
          setError('Quiz ID is not valid');
          return;
        }

        if (!res.ok) throw new Error('Quiz fetch failed');

        const json = await res.json();
        const quiz = json?.data;

        if (!quiz) {
          setError('Quiz ID is not valid'); // No quiz data
          return;
        }

        setQuizMeta({
          quiz_id: quiz.id,
          quiz_title: quiz.title,
          event_id: quiz.event?.id || '',
          event_title: quiz.event?.title || '',
        });

        setQuestions(normalizeQuestions(quiz.questions || []));
      } catch (err) {
        console.error(err);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [quizId, apiBaseUrl]);

  /* ---------------- STATES ---------------- */
  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>Loading quiz…</div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: 'red', textAlign: 'center' }}>
        {error}
      </div>
    );
  }

  if (!quizMeta || !questions.length) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        Quiz has no questions.
      </div>
    );
  }

  const q = questions[current];
  const isLast = current === questions.length - 1;

  /* ---------------- HANDLERS ---------------- */
  function handleSelect(index) {
    if (locked) return;

    setSelected(index);
    setLocked(true);

    setAnswers((prev) => [
      ...prev,
      {
        question: q.question,
        selected_option: q.options[index].label,
        is_correct: q.options[index].isCorrect,
      },
    ]);
  }

  async function handleNext() {
    if (isLast) {
      try {
        const res = await fetch(submitApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...quizMeta, answers }),
        });

        const result = await res.json();
        router.push(`${redirectUrl}?resultId=${result?.id || ''}`);
      } catch (err) {
        console.error('Submit error:', err);
      }
      return;
    }

    setSelected(null);
    setLocked(false);
    setCurrent((c) => c + 1);
  }

  /* ---------------- UI ---------------- */
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1000,
          textAlign: 'center',
        }}
      >
        {/* QUESTION */}
        <h2
          style={{
            fontSize: questionFontSize,
            color: questionColor,
            fontWeight: 600,
            marginBottom: 40,
          }}
        >
          {q.question}
        </h2>

        {/* OPTIONS + FEEDBACK */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '300px 360px',
            gap: 60,
            justifyContent: 'center',
            alignItems: 'flex-start',
            marginBottom: 40,
          }}
        >
          {/* OPTIONS */}
          <div style={{ textAlign: 'left' }}>
            {q.options.map((opt, i) => (
              <label
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 16,
                  fontSize: optionFontSize,
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
          <div style={{ minHeight: 120, textAlign: 'left' }}>
            {selected !== null && (
              <>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: feedbackFontSize,
                    color: q.options[selected].isCorrect
                      ? correctColor
                      : incorrectColor,
                    marginBottom: 8,
                  }}
                >
                  {q.options[selected].isCorrect ? 'Correct!' : 'Incorrect'}
                </div>

                <div
                  style={{
                    fontSize: feedbackFontSize,
                    color: feedbackColor,
                    lineHeight: 1.5,
                  }}
                >
                  {q.options[selected].feedback}
                </div>
              </>
            )}
          </div>
        </div>

        {/* BUTTON */}
        {selected !== null && (
          <button
            onClick={handleNext}
            style={{
              padding: '14px 44px',
              background: buttonBg,
              color: buttonColor,
              border: 'none',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            {isLast ? 'Submit' : buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- PLASMIC REGISTRATION ---------------- */
PLASMIC.registerComponent(QuizFlow, {
  name: 'Quiz Flow',
  props: {
    quizId: { type: 'string' },
    apiBaseUrl: { type: 'string' },
    submitApiUrl: { type: 'string' },
    redirectUrl: { type: 'string' },

    questionFontSize: { type: 'number' },
    questionColor: { type: 'color' },

    optionFontSize: { type: 'number' },
    optionColor: { type: 'color' },
    radioSize: { type: 'number' },

    feedbackFontSize: { type: 'number' },
    feedbackColor: { type: 'color' },
    correctColor: { type: 'color' },
    incorrectColor: { type: 'color' },

    buttonText: { type: 'string' },
    buttonBg: { type: 'color' },
    buttonColor: { type: 'color' },
  },
});

export default QuizFlow;
