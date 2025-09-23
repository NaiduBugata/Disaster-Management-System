import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getModuleDetails } from '../../api/api';
import { Container, Typography, Paper, Box, CircularProgress, Alert, Divider } from '@mui/material';

// --- Helper function to create a valid YouTube embed URL ---
const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = '';
    try {
        if (url.includes('youtube.com/watch?v=')) {
            videoId = new URL(url).searchParams.get('v');
        } else if (url.includes('youtu.be/')) {
            videoId = new URL(url).pathname.substring(1);
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (error) {
        console.error("Invalid URL for YouTube embed", error);
        return null;
    }
};


const ModuleView = () => {
    const { moduleId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getModuleDetails(moduleId)
            .then(response => setData(response.data))
            .catch(err => {
                console.error("Failed to fetch module details:", err);
                setError("Could not load module content.");
            })
            .finally(() => setLoading(false));
    }, [moduleId]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!data) return <Alert severity="info">No content found for this module.</Alert>;

    const { module, activity } = data;
    const embedUrl = getYouTubeEmbedUrl(module.video_url);

    return (
        <Container component={Paper} sx={{ p: { xs: 2, md: 4 }, mt: 2 }}>
            {/* --- Module Title --- */}
            <Typography variant="h4" component="h1" gutterBottom>
                {module.title}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* --- Module Theory/Content --- */}
            <Typography variant="h6" gutterBottom>Learning Material</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 4 }}>
                {module.content}
            </Typography>

            {/* --- Embedded YouTube Video --- */}
            {embedUrl && (
                <Box sx={{ my: 4 }}>
                    <Typography variant="h6" gutterBottom>Instructional Video</Typography>
                    <Box sx={{ position: 'relative', paddingTop: '56.25%', height: 0, overflow: 'hidden' }}>
                        <iframe
                            src={embedUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        />
                    </Box>
                </Box>
            )}

            {/* --- Learning Activity Section --- */}
            {activity && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Learning Activity
                    </Typography>
                    {/* Here we will render the specific activity component */}
                    {activity.type === 'exam' && <Typography>Exam Component will go here.</Typography>}
                    {activity.type === 'flashcards' && <Typography>Flashcard Component will go here.</Typography>}
                    {activity.type === 'feynman' && <Typography>Feynman Component will go here.</Typography>}
                </Box>
            )}
        </Container>
    );
};

export default ModuleView;