'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PLASMIC } from '../plasmic-init';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

function QuizFlow({
  quizId,
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
}) {
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
    if (!quizId) return;

    async function loadQuiz() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(
          `${API_BASE_URL}/collections/quizzes/entries/${quizId}`,
          { cache: 'no-store' }
        );

        if (!res.ok) throw new Error('Quiz fetch failed');

        const json = await res.json();
        const quiz = json?.data;

        if (!quiz) {
          setError('Invalid quiz ID');
          return;
        }

        // Hidden fields
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
  }, [quizId]);

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

  if (!questions.length) {
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
        const formData = new FormData();

        // Hidden fields
        formData.append('quiz_id', quizMeta.quiz_id);
        formData.append('quiz_title', quizMeta.quiz_title);
        formData.append('event_id', quizMeta.event_id);
        formData.append('event_title', quizMeta.event_title);

        // Answers (stringified)
        formData.append('answers', JSON.stringify(answers));

        const res = await fetch(`${API_BASE_URL}/quiz/submit`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Quiz submit failed');

        const result = await res.json();

        router.push(`${redirectUrl}?resultId=${result?.id || ''}`);
      } catch (err) {
        console.error(err);
        alert('Quiz submission failed');
      }
      return;
    }

    setSelected(null);
    setLocked(false);
    setCurrent((c) => c + 1);
  }

  /* ---------------- UI ---------------- */
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h2
        style={{
          fontSize: questionFontSize,
          color: questionColor,
          marginBottom: 40,
        }}
      >
        {q.question}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 360px',
          gap: 60,
          justifyContent: 'center',
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
                gap: 10,
                marginBottom: 16,
                fontSize: optionFontSize,
                color: optionColor,
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
                }}
              >
                {q.options[selected].isCorrect ? 'Correct!' : 'Incorrect'}
              </div>
              <div style={{ fontSize: feedbackFontSize, color: feedbackColor }}>
                {q.options[selected].feedback}
              </div>
            </>
          )}
        </div>
      </div>

      {selected !== null && (
        <button
          onClick={handleNext}
          style={{
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
