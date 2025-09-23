import React, { useState } from 'react';
import { Box, Typography, Button, FormControl, FormControlLabel, RadioGroup, Radio, CircularProgress, Alert } from '@mui/material';
import { submitExam } from '../../api/api';

const ExamPlayer = ({ exam, onComplete }) => {
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const submissionData = {
            student_id: 1, // Hardcoded for now, will come from auth context later
            answers: answers,
        };
        try {
            const res = await submitExam(exam.id, submissionData);
            setResult(res.data);
            if (onComplete) onComplete(res.data.passed);
        } catch (error) {
            console.error("Failed to submit exam:", error);
            setResult({ error: "Could not submit your answers. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (result) {
        return (
            <Alert severity={result.passed ? 'success' : 'error'}>
                <Typography fontWeight="bold">Exam Complete!</Typography>
                <Typography>Your Score: {result.score}%</Typography>
                <Typography>{result.passed ? "Congratulations, you passed!" : "You did not pass. Please review the material."}</Typography>
            </Alert>
        );
    }
    
    return (
        <Box>
            {exam.questions.map((q) => (
                <FormControl key={q.id} component="fieldset" sx={{ mb: 3, width: '100%' }}>
                    <Typography variant="h6">{q.question}</Typography>
                    <RadioGroup value={answers[q.id] || ''} onChange={(e) => handleAnswerChange(q.id, e.target.value)}>
                        <FormControlLabel value="A" control={<Radio />} label={q.option_a} />
                        <FormControlLabel value="B" control={<Radio />} label={q.option_b} />
                        {q.option_c && <FormControlLabel value="C" control={<Radio />} label={q.option_c} />}
                        {q.option_d && <FormControlLabel value="D" control={<Radio />} label={q.option_d} />}
                    </RadioGroup>
                </FormControl>
            ))}
            <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(answers).length !== exam.questions.length}
            >
                {isSubmitting ? <CircularProgress size={24} /> : 'Submit Final Answers'}
            </Button>
        </Box>
    );
};

export default ExamPlayer;