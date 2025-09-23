import React from 'react';
import { Link } from 'react-router-dom';

const ModuleListItem = ({ module, courseId, isUnlocked, isCompleted }) => (
  <div style={{ padding: '10px', borderBottom: '1px solid #eee', opacity: isUnlocked ? 1 : 0.5 }}>
    <h4>{module.title}</h4>
    {isUnlocked ? (
      <Link to={`/courses/${courseId}/modules/${module.id}`}>
        {isCompleted ? 'Review' : 'Start Module'}
      </Link>
    ) : (
      <span>Locked</span>
    )}
  </div>
);

export default ModuleListItem;