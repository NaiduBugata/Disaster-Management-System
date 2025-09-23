// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { getCourseModules } from '../../api/api';
// import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, LinearProgress, Paper, CircularProgress, Alert, Divider } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import FlashcardPlayer from '../../components/activities/FlashcardPlayer';
// import FeynmanPractice from '../../components/activities/FeynmanPractice';
// import ExamPlayer from '../../components/activities/ExamPlayer';

// // -------------------------- Sidebar Component --------------------------
// const CourseSidebar = ({ modules, onSelectItem, selectedItemId }) => {
//   return (
//     <Paper elevation={2} sx={{ width: 300, height: 'calc(100vh - 64px)', overflowY: 'auto', flexShrink: 0 }}>
//       <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
//         <Typography variant="h6">Course Outline</Typography>
//       </Box>
//       {modules.map((module, mIndex) => (
//         <Box key={module.id} sx={{ mb: 1 }}>
//           <Box sx={{ p: 2 }}>
//             <Typography variant="subtitle1" fontWeight="bold">{`Module ${mIndex + 1}: ${module.title}`}</Typography>
//             <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
//               <LinearProgress variant="determinate" value={module.progress ?? 0} sx={{ width: '100%', mr: 1 }} />
//               <Typography variant="caption" color="text.secondary">{`${Math.round(module.progress ?? 0)}%`}</Typography>
//             </Box>
//           </Box>
//           <List dense disablePadding>
//             {(module.learning_items || []).map((item, iIndex) => (
//               <ListItemButton
//                 key={item.id}
//                 onClick={() => onSelectItem({ ...item, moduleId: module.id })}
//                 selected={selectedItemId === item.id}
//                 sx={{ pl: 4 }}
//               >
//                 <ListItemIcon sx={{ minWidth: 32 }}>
//                   {item.status === 'completed' ? (
//                     <CheckCircleIcon color="success" fontSize="small" />
//                   ) : (
//                     <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{`${mIndex + 1}.${iIndex + 1}`}</Typography>
//                   )}
//                 </ListItemIcon>
//                 <ListItemText primary={item.title} />
//               </ListItemButton>
//             ))}
//           </List>
//         </Box>
//       ))}
//     </Paper>
//   );
// };

// // -------------------------- Activity Renderer --------------------------
// const ActivityRenderer = ({ item }) => {
//   if (!item || !item.item_type) {
//     return <Alert severity="info">Please select a learning activity from the sidebar.</Alert>;
//   }

//   const getYouTubeEmbedUrl = (url) => {
//     if (!url) return null;
//     try {
//       let videoId = '';
//       if (url.includes('youtube.com/watch?v=')) videoId = new URL(url).searchParams.get('v');
//       else if (url.includes('youtu.be/')) videoId = new URL(url).pathname.substring(1);
//       return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
//     } catch { return null; }
//   };

//   switch (item.item_type) {
//     case 'content':
//       return <Typography sx={{ whiteSpace: 'pre-wrap' }}>{item.text_content}</Typography>;
//     case 'video':
//       const embedUrl = getYouTubeEmbedUrl(item.video_url);
//       return embedUrl ? (
//         <Box sx={{ position: 'relative', paddingTop: '56.25%', height: 0 }}>
//           <iframe
//             src={embedUrl}
//             title="YouTube video player"
//             frameBorder="0"
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//             allowFullScreen
//             style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
//           />
//         </Box>
//       ) : <Alert severity="warning">Invalid video URL provided.</Alert>;
//     case 'exam':
//       return item.data ? <ExamPlayer exam={item.data} /> : <Alert severity="info">No exam questions added yet.</Alert>;
//     case 'flashcards':
//       return item.data?.cards ? <FlashcardPlayer cards={item.data.cards} /> : <Alert severity="info">No flashcards available.</Alert>;
//     case 'feynman':
//       return item.data?.activity ? <FeynmanPractice activity={item.data.activity} /> : <Alert severity="info">No Feynman practice added.</Alert>;
//     default:
//       return <Alert severity="error">Unknown learning activity type: {item.item_type}</Alert>;
//   }
// };

// // -------------------------- Main CoursePlayer --------------------------
// const CoursePlayer = () => {
//   const { courseId } = useParams();
//   const [modules, setModules] = useState([]);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchModules = () => {
//     setLoading(true);
//     getCourseModules(courseId)
//       .then(res => {
//         // Map learning items array for each module if missing
//         const mod = res.data.map(module => ({
//           ...module,
//           learning_items: module.learning_items || [],
//           progress: module.progress ?? 0,
//         }));
//         setModules(mod);
//         if (!selectedItem && mod.length > 0 && mod[0].learning_items.length > 0) {
//           setSelectedItem(mod[0].learning_items[0]);
//         }
//       })
//       .catch(err => {
//         console.error("Failed to load course modules:", err);
//         setError("Could not load course content. Please try again later.");
//       })
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     if (!courseId) {
//       setError("Invalid course ID.");
//       setLoading(false);
//       return;
//     }
//     fetchModules();
//   }, [courseId]);

//   if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress size={60} /></Box>;
//   if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;
//   if (!modules.length) return <Box sx={{ p: 3 }}><Alert severity="info">No course content available yet.</Alert></Box>;

//   return (
//     <Box sx={{ display: 'flex' }}>
//       <CourseSidebar modules={modules} onSelectItem={setSelectedItem} selectedItemId={selectedItem?.id} />
//       <Box component="main" sx={{ flexGrow: 1, p: 3, height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
//         <Paper sx={{ p: 3 }}>
//           {selectedItem ? (
//             <>
//               <Typography variant="h4" gutterBottom>{selectedItem.title}</Typography>
//               <Divider sx={{ mb: 3 }} />
//               <ActivityRenderer item={selectedItem} />
//             </>
//           ) : (
//             <>
//               <Typography variant="h5">Welcome!</Typography>
//               <Typography>Select an item from the course outline to begin.</Typography>
//             </>
//           )}
//         </Paper>
//       </Box>
//     </Box>
//   );
// };

// export default CoursePlayer;
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseModules } from '../../api/api';
import {
  Box, Typography, List, ListItemButton, ListItemIcon, ListItemText,
  LinearProgress, Paper, CircularProgress, Alert, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlashcardPlayer from '../../components/activities/FlashcardPlayer';
import FeynmanPractice from '../../components/activities/FeynmanPractice';
import ExamPlayer from '../../components/activities/ExamPlayer';

// -------------------------- Sidebar Component --------------------------
const CourseSidebar = ({ modules, onSelectItem, selectedItemId }) => (
  <Paper elevation={2} sx={{ width: 300, height: 'calc(100vh - 64px)', overflowY: 'auto', flexShrink: 0 }}>
    <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
      <Typography variant="h6">Course Outline</Typography>
    </Box>
    {modules.map((module, mIndex) => (
      <Box key={module.id} sx={{ mb: 1 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">{`Module ${mIndex + 1}: ${module.title}`}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <LinearProgress variant="determinate" value={module.progress ?? 0} sx={{ width: '100%', mr: 1 }} />
            <Typography variant="caption" color="text.secondary">{`${Math.round(module.progress ?? 0)}%`}</Typography>
          </Box>
        </Box>
        <List dense disablePadding>
          {(module.learning_items || []).map((item, iIndex) => (
            <ListItemButton
              key={item.id}
              onClick={() => onSelectItem({ ...item, moduleId: module.id })}
              selected={selectedItemId === item.id}
              sx={{ pl: 4 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {item.status === 'completed'
                  ? <CheckCircleIcon color="success" fontSize="small" />
                  : <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{`${mIndex + 1}.${iIndex + 1}`}</Typography>
                }
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    ))}
  </Paper>
);

// -------------------------- Activity Renderer --------------------------
const ActivityRenderer = ({ item }) => {
  if (!item || !item.item_type) return <Alert severity="info">Please select a learning activity from the sidebar.</Alert>;

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    try {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) videoId = new URL(url).searchParams.get('v');
      else if (url.includes('youtu.be/')) videoId = new URL(url).pathname.substring(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch { return null; }
  };

  switch (item.item_type) {
    case 'content':
      return <Typography sx={{ whiteSpace: 'pre-wrap' }}>{item.text_content}</Typography>;
    case 'video':
      const embedUrl = getYouTubeEmbedUrl(item.video_url);
      return embedUrl ? (
        <Box sx={{ position: 'relative', paddingTop: '56.25%', height: 0 }}>
          <iframe
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        </Box>
      ) : <Alert severity="warning">Invalid video URL provided.</Alert>;
    case 'exam':
      return item.data ? <ExamPlayer exam={item.data} /> : <Alert severity="info">No exam questions added yet.</Alert>;
    case 'flashcards':
      return item.data?.cards ? <FlashcardPlayer cards={item.data.cards} /> : <Alert severity="info">No flashcards available.</Alert>;
    case 'feynman':
      return item.data?.activity ? <FeynmanPractice activity={item.data.activity} /> : <Alert severity="info">No Feynman practice added.</Alert>;
    default:
      return <Alert severity="error">Unknown learning activity type: {item.item_type}</Alert>;
  }
};

// -------------------------- Main CoursePlayer --------------------------
const CoursePlayer = () => {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ useCallback to avoid ESLint warning
  const fetchModules = useCallback(() => {
    setLoading(true);
    getCourseModules(courseId)
      .then(res => {
        const mod = res.data.map(module => ({
          ...module,
          learning_items: module.learning_items || [],
          progress: module.progress ?? 0,
        }));
        setModules(mod);
        if (!selectedItem && mod.length > 0 && mod[0].learning_items.length > 0) {
          setSelectedItem(mod[0].learning_items[0]);
        }
      })
      .catch(err => {
        console.error("Failed to load course modules:", err);
        setError("Could not load course content. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [courseId, selectedItem]);

  useEffect(() => {
    if (!courseId) {
      setError("Invalid course ID.");
      setLoading(false);
      return;
    }
    fetchModules();
  }, [fetchModules]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress size={60} /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;
  if (!modules.length) return <Box sx={{ p: 3 }}><Alert severity="info">No course content available yet.</Alert></Box>;

  return (
    <Box sx={{ display: 'flex' }}>
      <CourseSidebar modules={modules} onSelectItem={setSelectedItem} selectedItemId={selectedItem?.id} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        <Paper sx={{ p: 3 }}>
          {selectedItem ? (
            <>
              <Typography variant="h4" gutterBottom>{selectedItem.title}</Typography>
              <Divider sx={{ mb: 3 }} />
              <ActivityRenderer item={selectedItem} />
            </>
          ) : (
            <>
              <Typography variant="h5">Welcome!</Typography>
              <Typography>Select an item from the course outline to begin.</Typography>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default CoursePlayer;
