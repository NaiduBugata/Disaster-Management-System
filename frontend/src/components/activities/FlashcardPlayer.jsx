import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// === THIS IS THE FIX ===
// This path tells the component to look for the CSS file
// in the exact same folder it is in.
import './Flashcard.css'; 
// =======================

const FlashcardPlayer = ({ cards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!cards || cards.length === 0) {
        return <Typography>No flashcards available for this module.</Typography>;
    }

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    const card = cards[currentIndex];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
                <Card className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
                    <CardContent className="flashcard-face flashcard-front">
                        <Typography variant="h5">{card.front_text}</Typography>
                    </CardContent>
                    <CardContent className="flashcard-face flashcard-back">
                        <Typography>{card.back_text}</Typography>
                    </CardContent>
                </Card>
            </Box>
            <Typography>{`Card ${currentIndex + 1} of ${cards.length}`}</Typography>
            <Box>
                <IconButton onClick={handlePrev}><ArrowBackIosNewIcon /></IconButton>
                <Button variant="outlined" onClick={() => setIsFlipped(!isFlipped)}>Flip Card</Button>
                <IconButton onClick={handleNext}><ArrowForwardIosIcon /></IconButton>
            </Box>
        </Box>
    );
};

export default FlashcardPlayer;