import React from 'react';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, LinearProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CourseSidebar = ({ modules, onSelectItem }) => {
  return (
    <Box sx={{ width: 320, borderRight: '1px solid #e0e0e0', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Course Outline</Typography>
      </Box>
      {modules.map((module, moduleIndex) => (
        <Box key={module.id} sx={{ mb: 2 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">{`Module ${moduleIndex + 1}: ${module.title}`}</Typography>
            <LinearProgress variant="determinate" value={module.progress} sx={{ mt: 1 }} />
          </Box>
          <List dense>
            {module.learning_items.map((item, itemIndex) => (
              <ListItemButton key={item.id} onClick={() => onSelectItem(item)}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {item.status === 'completed' ? <CheckCircleIcon color="success" fontSize="small" /> : <Typography sx={{ fontSize: '0.8rem' }}>{`${moduleIndex + 1}.${itemIndex + 1}`}</Typography>}
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
};

export default CourseSidebar;