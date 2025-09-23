import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getModuleQuizzes, getCourseExams, getExamQuestions } from '../../api/api';
import Quiz from '../../components/Quiz';
import Exam from '../../components/Exam';
import { Typography, CircularProgress, Box } from '@mui/material';

const Module = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [exam, setExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Placeholder for module content — replace with API data if available
  const [moduleContent, setModuleContent] = useState({
    title: "Module Title",
    theory: "This is the theory content for the module...",
    videoUrl: "https://www.youtube.com/embed/example"
  });

  useEffect(() => {
    if (!courseId || !moduleId) return; // prevent undefined API calls

    setLoading(true);
    Promise.all([
      getModuleQuizzes(moduleId),
      getCourseExams(courseId)
    ])
      .then(([quizRes, examRes]) => {
        setQuizzes(quizRes.data);

        const currentExam = examRes.data.find(e => e.module_id === parseInt(moduleId));
        if (currentExam) {
          setExam(currentExam);
          getExamQuestions(currentExam.id).then(qRes => setExamQuestions(qRes.data));
        }
      })
      .catch(err => {
        console.error("Failed to fetch module data:", err);
        setError("Could not load module data. Please check the course/module IDs.");
      })
      .finally(() => setLoading(false));
  }, [courseId, moduleId]);

  const handleExamComplete = (passed) => {
    if (passed) {
      alert('You passed! You can now proceed to the next module.');
      navigate(`/courses/${courseId}`);
    } else {
      alert('Please review the material and retake the exam.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>{moduleContent.title}</Typography>
      <Typography paragraph>{moduleContent.theory}</Typography>
      <Box sx={{ my: 2 }}>
        <iframe
          title="Module Video"
          src={moduleContent.videoUrl}
          width="100%"
          height="360"
          allowFullScreen
          style={{ border: 'none' }}
        ></iframe>
      </Box>

      <Typography variant="h5" gutterBottom>Quick Quiz</Typography>
      <Quiz questions={quizzes} />

      {exam && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Qualifier Exam</Typography>
          <Exam questions={examQuestions} requiredScore={70} onComplete={handleExamComplete} />
        </>
      )}
    </Box>
  );
};

export default Module;
