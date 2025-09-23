import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Collapse, Alert } from '@mui/material';

const FeynmanPractice = ({ activity }) => {
    const [explanation, setExplanation] = useState('');
    const [isRevealed, setIsRevealed] = useState(false);

    if (!activity) return <Typography>No activity available.</Typography>;

    return (
        <Box>
            <Typography variant="h6">Concept:</Typography>
            <Typography sx={{ mb: 2, fontStyle: 'italic' }}>"{activity.concept_to_explain}"</Typography>
            <TextField
                label="Explain this concept in the simplest terms you can..."
                multiline
                rows={6}
                fullWidth
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
            />
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => setIsRevealed(true)}>
                Compare with Ideal Explanation
            </Button>
            <Collapse in={isRevealed}>
                <Alert severity="info" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                    <Typography fontWeight="bold">A Simple Way to Explain It:</Typography>
                    {activity.simple_explanation}
                </Alert>
            </Collapse>
        </Box>
    );
};

export default FeynmanPractice;