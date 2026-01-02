import { useEffect, useState } from 'react';

export default function QuizFlow() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    fetch('/api/quiz')
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, []);

  if (!questions.length) return null;

  const q = questions[current];
  const isCorrect = selected === q.correctIndex;

  return (
    <div style={{ padding: 40 }}>
      <h1>{q.question}</h1>

      {q.options.map((opt, index) => (
        <label key={index} style={{ display: 'block', margin: '10px 0' }}>
          <input
            type='radio'
            name='option'
            checked={selected === index}
            onChange={() => {
              setSelected(index);
              setShowFeedback(true);
            }}
          />
          {opt}
        </label>
      ))}

      {showFeedback && (
        <p style={{ color: isCorrect ? 'green' : 'red' }}>
          {isCorrect ? q.correctFeedback : q.incorrectFeedback}
        </p>
      )}

      {showFeedback && (
        <button
          onClick={() => {
            setSelected(null);
            setShowFeedback(false);
            setCurrent(current + 1);
          }}
          disabled={current === questions.length - 1}
        >
          Next
        </button>
      )}
    </div>
  );
}
