import React, { useState } from 'react';

const Exam = ({ questions, requiredScore, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const score = questions.reduce((acc, q) => (answers[q.id] === q.correct_option ? acc + 1 : acc), 0);
    const percentage = (score / questions.length) * 100;
    onComplete(percentage >= requiredScore);
    setSubmitted(true);
  };

  return (
    <div>
      {questions.map((q) => (
        <div key={q.id}>
          <p>{q.question}</p>
          {['a', 'b', 'c', 'd'].map(opt => (
            <div key={opt}>
              <input type="radio" id={`${q.id}-${opt}`} name={q.id} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value.toUpperCase() })} value={opt} disabled={submitted} />
              <label htmlFor={`${q.id}-${opt}`}>{q[`option_${opt}`]}</label>
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={submitted}>Submit Exam</button>
    </div>
  );
};

export default Exam;