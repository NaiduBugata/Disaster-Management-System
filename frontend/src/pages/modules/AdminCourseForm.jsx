import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, TextField, Button, Box, Paper, Stepper, Step, StepLabel,
  Card, CardContent, Accordion, AccordionSummary, AccordionDetails,
  RadioGroup, FormControlLabel, Radio, Snackbar, Alert, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// UPDATED: Import the new API functions
import {
    createCourse, createModule, createExam, createExamQuestion,
    createFlashcard, createFeynmanActivity
} from '../../api/api';

// UPDATED: The title of the last step for clarity
const steps = ['Create Course', 'Add Modules', 'Add Learning Activities'];

const AdminCourseForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // UPDATED: The state for modules is now much more powerful
  const [course, setCourse] = useState({ title: '', description: '' });
  const [modules, setModules] = useState([{
    title: '', content: '', video_url: '', module_order: 1,
    activity_type: 'exam', // 'exam', 'flashcards', or 'feynman'
    exam: { questions: [] },
    flashcards: [{ front_text: '', back_text: '' }],
    feynman: { concept_to_explain: '', simple_explanation: '' }
  }]);
  const [finalExam, setFinalExam] = useState({ questions: [] });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });


  // --- HANDLERS for updating state ---

  const handleModuleChange = (index, field, value) => {
    const updatedModules = [...modules];
    updatedModules[index][field] = value;
    setModules(updatedModules);
  };

  const handleAddModule = () => {
    setModules([...modules, {
      title: '', content: '', video_url: '', module_order: modules.length + 1,
      activity_type: 'exam', // Default for new modules
      exam: { questions: [] },
      flashcards: [{ front_text: '', back_text: '' }],
      feynman: { concept_to_explain: '', simple_explanation: '' }
    }]);
  };

  // UPDATED: Handlers for all three activity types
  const handleActivityTypeChange = (index, newType) => {
    if (newType) {
        const updatedModules = [...modules];
        updatedModules[index].activity_type = newType;
        setModules(updatedModules);
    }
  };

  const handleAddExamQuestion = (moduleIndex) => {
    const newQuestion = { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' };
    if (moduleIndex === 'final') {
        setFinalExam({ questions: [...finalExam.questions, newQuestion] });
    } else {
        const updatedModules = [...modules];
        updatedModules[moduleIndex].exam.questions.push(newQuestion);
        setModules(updatedModules);
    }
  };

  const handleExamQuestionChange = (moduleIndex, qIndex, field, value) => {
    if (moduleIndex === 'final') {
        const updatedQuestions = [...finalExam.questions];
        updatedQuestions[qIndex][field] = value;
        setFinalExam({ questions: updatedQuestions });
    } else {
        const updatedModules = [...modules];
        const updatedQuestions = [...updatedModules[moduleIndex].exam.questions];
        updatedQuestions[qIndex][field] = value;
        updatedModules[moduleIndex].exam.questions = updatedQuestions;
        setModules(updatedModules);
    }
  };
  
  const handleAddFlashcard = (moduleIndex) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].flashcards.push({ front_text: '', back_text: '' });
    setModules(updatedModules);
  };

  const handleFlashcardChange = (moduleIndex, cardIndex, field, value) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].flashcards[cardIndex][field] = value;
    setModules(updatedModules);
  };

  const handleFeynmanChange = (moduleIndex, field, value) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].feynman[field] = value;
    setModules(updatedModules);
  };


  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);


  // UPDATED: Submission logic now handles different activity types
  const handleSubmit = async () => {
    try {
      const courseResponse = await createCourse(course);
      const courseId = courseResponse.data.course_id;

      for (const module of modules) {
        const moduleResponse = await createModule({ ...module, course_id: courseId });
        const moduleId = moduleResponse.data.module_id;

        // Create the specific activity chosen for the module
        if (module.activity_type === 'exam' && module.exam.questions.length > 0) {
            const examResponse = await createExam({ course_id: courseId, module_id: moduleId, title: `Qualifier: ${module.title}` });
            const examId = examResponse.data.exam_id;
            for (const q of module.exam.questions) {
                await createExamQuestion({ ...q, exam_id: examId });
            }
        } else if (module.activity_type === 'flashcards' && module.flashcards.length > 0) {
            for (const card of module.flashcards) {
                if (card.front_text && card.back_text) { // Only save non-empty cards
                    await createFlashcard({ ...card, module_id: moduleId });
                }
            }
        } else if (module.activity_type === 'feynman' && module.feynman.concept_to_explain) {
            await createFeynmanActivity({ ...module.feynman, module_id: moduleId });
        }
      }
      
      if (finalExam.questions.length > 0) {
        const finalExamResponse = await createExam({ course_id: courseId, module_id: null, title: `Final Exam: ${course.title}` });
        const finalExamId = finalExamResponse.data.exam_id;
        for (const q of finalExam.questions) {
            await createExamQuestion({ ...q, exam_id: finalExamId });
        }
      }

      setNotification({ open: true, message: 'Course created successfully!', severity: 'success' });
      setTimeout(() => navigate('/courses'), 1500);

    } catch (error) {
      console.error("Failed to create course:", error);
      setNotification({ open: true, message: 'Failed to create course. Check console for details.', severity: 'error' });
    }
  };
  
  const getStepContent = (step) => {
    switch (step) {
        case 0: // No changes here
            return (
              <Box>
                <Typography variant="h6" gutterBottom>Course Information</Typography>
                <TextField label="Course Title" fullWidth margin="normal" value={course.title} onChange={(e) => setCourse({...course, title: e.target.value})} />
                <TextField label="Course Description" fullWidth multiline rows={4} margin="normal" value={course.description} onChange={(e) => setCourse({...course, description: e.target.value})} />
              </Box>
            );
        case 1: // No changes here
            return (
              <Box>
                {modules.map((m, index) => (
                  <Card key={index} sx={{ mb: 2, p: 2 }}>
                     <Typography variant="h6">Module {index + 1}</Typography>
                     <TextField label="Module Title" fullWidth margin="normal" value={m.title} onChange={(e) => handleModuleChange(index, 'title', e.target.value)}/>
                     <TextField label="Module Content" fullWidth multiline rows={3} margin="normal" value={m.content} onChange={(e) => handleModuleChange(index, 'content', e.target.value)}/>
                     <TextField label="Video URL" fullWidth margin="normal" value={m.video_url} onChange={(e) => handleModuleChange(index, 'video_url', e.target.value)}/>
                  </Card>
                ))}
                <Button startIcon={<AddCircleIcon />} onClick={handleAddModule}>Add Another Module</Button>
              </Box>
            );
        case 2: // UPDATED: This step is completely new and dynamic
            return (
                <Box>
                    {modules.map((m, mIndex) => (
                        <Accordion key={mIndex} defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Activity for Module: {m.title || `Module ${mIndex + 1}`}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <ToggleButtonGroup color="primary" value={m.activity_type} exclusive onChange={(e, newType) => handleActivityTypeChange(mIndex, newType)} sx={{ mb: 2 }}>
                                    <ToggleButton value="exam">Qualifier Exam</ToggleButton>
                                    <ToggleButton value="flashcards">Flashcards</ToggleButton>
                                    <ToggleButton value="feynman">Feynman Practice</ToggleButton>
                                </ToggleButtonGroup>

                                {/* Conditional Rendering based on selected activity type */}
                                {m.activity_type === 'exam' && m.exam.questions.map((q, qIndex) => (
                                    <Paper key={qIndex} sx={{ p: 2, mb: 2 }}>
                                        <Typography variant="subtitle2">Question {qIndex + 1}</Typography>
                                        {/* BUG FIX: 'question' instead of 'questionText' */}
                                        <TextField fullWidth label="Question Text" margin="dense" value={q.question} onChange={(e) => handleExamQuestionChange(mIndex, qIndex, 'question', e.target.value)} />
                                        <TextField fullWidth label="Option A" margin="dense" value={q.option_a} onChange={(e) => handleExamQuestionChange(mIndex, qIndex, 'option_a', e.target.value)} />
                                        <TextField fullWidth label="Option B" margin="dense" value={q.option_b} onChange={(e) => handleExamQuestionChange(mIndex, qIndex, 'option_b', e.target.value)} />
                                        <TextField fullWidth label="Option C" margin="dense" value={q.option_c} onChange={(e) => handleExamQuestionChange(mIndex, qIndex, 'option_c', e.target.value)} />
                                        <TextField fullWidth label="Option D" margin="dense" value={q.option_d} onChange={(e) => handleExamQuestionChange(mIndex, qIndex, 'option_d', e.target.value)} />
                                        <RadioGroup row value={q.correct_option} onChange={(e) => handleExamQuestionChange(mIndex, qIndex, 'correct_option', e.target.value)}>
                                            <FormControlLabel value="A" control={<Radio />} label="Correct: A" />
                                            <FormControlLabel value="B" control={<Radio />} label="B" />
                                            <FormControlLabel value="C" control={<Radio />} label="C" />
                                            <FormControlLabel value="D" control={<Radio />} label="D" />
                                        </RadioGroup>
                                    </Paper>
                                ))}
                                {m.activity_type === 'exam' && <Button onClick={() => handleAddExamQuestion(mIndex)}>Add Question</Button>}

                                {m.activity_type === 'flashcards' && m.flashcards.map((card, cIndex) => (
                                    <Paper key={cIndex} sx={{ p: 2, mb: 2 }}>
                                        <Typography variant="subtitle2">Flashcard {cIndex + 1}</Typography>
                                        <TextField fullWidth label="Front Text (Term/Question)" margin="dense" value={card.front_text} onChange={e => handleFlashcardChange(mIndex, cIndex, 'front_text', e.target.value)} />
                                        <TextField fullWidth label="Back Text (Definition/Answer)" margin="dense" multiline rows={2} value={card.back_text} onChange={e => handleFlashcardChange(mIndex, cIndex, 'back_text', e.target.value)} />
                                    </Paper>
                                ))}
                                {m.activity_type === 'flashcards' && <Button onClick={() => handleAddFlashcard(mIndex)}>Add Flashcard</Button>}
                                
                                {m.activity_type === 'feynman' && (
                                     <Paper sx={{ p: 2, mb: 2 }}>
                                        <TextField fullWidth label="Concept to Explain" margin="dense" value={m.feynman.concept_to_explain} onChange={e => handleFeynmanChange(mIndex, 'concept_to_explain', e.target.value)} />
                                        <TextField fullWidth label="The Ideal Simple Explanation (for student comparison)" margin="dense" multiline rows={3} value={m.feynman.simple_explanation} onChange={e => handleFeynmanChange(mIndex, 'simple_explanation', e.target.value)} />
                                    </Paper>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                    {/* Final Exam is kept separate and is always an exam */}
                    <Accordion sx={{mt: 3}}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Final Course Exam</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {/* BUG FIX: 'question' instead of 'questionText' */}
                             {finalExam.questions.map((q, qIndex) => (
                                <Paper key={qIndex} sx={{ p: 2, mb: 2 }}>
                                    <Typography variant="subtitle2">Question {qIndex + 1}</Typography>
                                    <TextField fullWidth label="Question Text" margin="dense" value={q.question} onChange={(e) => handleExamQuestionChange('final', qIndex, 'question', e.target.value)} />
                                    {/* You would add the Option A, B, C, D fields here just like in the module exam */}
                                </Paper>
                            ))}
                            <Button onClick={() => handleAddExamQuestion('final')}>Add Question to Final Exam</Button>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            );
        default: return 'Unknown step';
    }
  };

  return (
    <Container component={Paper} sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Create a New Course</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>
      
      {getStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        {activeStep !== 0 && <Button onClick={handleBack} sx={{ mr: 1 }}>Back</Button>}
        
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" color="primary" onClick={handleSubmit}>Finish</Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>Next</Button>
        )}
      </Box>

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminCourseForm;