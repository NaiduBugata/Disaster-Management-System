import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseExams, getExamQuestions } from '../../api/api';
import Exam from '../components/Exam';

const FinalExam = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [examQuestions, setExamQuestions] = useState([]);

  useEffect(() => {
    getCourseExams(courseId).then(res => {
      const finalExam = res.data.find(e => e.module_id === null);
      if (finalExam) {
        getExamQuestions(finalExam.id).then(qRes => setExamQuestions(qRes.data));
      }
    });
  }, [courseId]);

  const handleFinalExamComplete = (passed) => {
    if (passed) {
      alert('Congratulations! You have completed the course and earned a badge!');
      navigate('/courses');
    } else {
      alert('You did not pass the final exam. Please review the course content.');
    }
  };

  return (
    <div>
      <h2>Final Course Exam</h2>
      <Exam questions={examQuestions} requiredScore={75} onComplete={handleFinalExamComplete} />
    </div>
  );
};

export default FinalExam;