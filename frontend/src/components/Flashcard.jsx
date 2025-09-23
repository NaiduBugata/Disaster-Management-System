import React, { useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import './Flashcard.css'; // We'll create this CSS file for the flip animation

const Flashcard = ({ front, back }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <Box className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
            <Card className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
                <CardContent className="flashcard-face flashcard-front">
                    <Typography variant="h5">{front}</Typography>
                </CardContent>
                <CardContent className="flashcard-face flashcard-back">
                    <Typography>{back}</Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Flashcard;