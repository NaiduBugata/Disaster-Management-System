import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getCourseModules, getCourseProgress, getCourseExams } from '../../api/api';
import {
  Container, Typography, List, ListItem, ListItemButton, ListItemText,
  Paper, CircularProgress, Box, Alert, Button, Divider
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockIcon from '@mui/icons-material/Lock';

const CourseDetail = () => {
  // Use the same param name as your route: /courses/:courseId
  const { courseId } = useParams();

  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({ modules: [] });
  const [finalExam, setFinalExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) {
      setError("Invalid course ID.");
      setLoading(false);
      return;
    }

    // Fetch all course-related data in parallel
    Promise.all([
      getCourseModules(courseId),
      getCourseProgress(courseId),
      getCourseExams(courseId),
    ])
      .then(([modulesRes, progressRes, examsRes]) => {
        setModules(modulesRes.data);
        setProgress(progressRes.data);

        // Final exam has module_id = null
        const finalExamData = examsRes.data.find(e => e.module_id === null);
        setFinalExam(finalExamData);
      })
      .catch(err => {
        console.error("Failed to load course details:", err);
        setError("Could not load the course. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  const allModulesCompleted = progress.summary?.percentage === 100;

  return (
    <Container component={Paper} sx={{ p: { xs: 2, md: 4 }, mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        Course Content
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <List>
        {modules.map((module, index) => {
          const moduleProgress = progress.modules.find(m => m.module_id === module.id) || {};
          const isUnlocked = moduleProgress.unlocked ?? true;
          const isCompleted = moduleProgress.completed ?? false;

          return (
            <ListItem key={module.id} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={`/courses/${courseId}/module/${module.id}`} // Correct route
                disabled={!isUnlocked}
              >
                <ListItemText
                  primary={`${index + 1}. ${module.title}`}
                  secondary={isUnlocked ? (isCompleted ? "Module Completed" : "Click to start") : "Locked"}
                />
                {isCompleted
                  ? <CheckCircleOutlineIcon color="success" />
                  : (!isUnlocked ? <LockIcon color="disabled" /> : null)}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {allModulesCompleted && finalExam && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to={`/courses/${courseId}/final-exam`}
          >
            Proceed to Final Exam
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default CourseDetail;
