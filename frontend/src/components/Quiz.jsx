import React, { useState } from 'react';

const Quiz = ({ questions }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const calculateScore = () => {
    return questions.reduce((score, q) => (answers[q.id] === q.correct_option ? score + 1 : score), 0);
  };

  return (
    <div>
      {questions.map((q) => (
        <div key={q.id}>
          <p>{q.question}</p>
          {['a', 'b', 'c', 'd'].map(opt => (
            <div key={opt}>
              <input type="radio" id={`${q.id}-${opt}`} name={q.id} onChange={() => handleSelect(q.id, opt.toUpperCase())} disabled={submitted} />
              <label htmlFor={`${q.id}-${opt}`}>{q[`option_${opt}`]}</label>
            </div>
          ))}
        </div>
      ))}
      <button onClick={() => setSubmitted(true)} disabled={submitted}>Submit Quiz</button>
      {submitted && <p>Your score: {calculateScore()} / {questions.length}</p>}
    </div>
  );
};

export default Quiz;