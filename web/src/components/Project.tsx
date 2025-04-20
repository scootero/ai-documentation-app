'use client';

import React, { useState } from 'react';
import type { Project } from '@/types/Project';
import type { DocBlock } from '@/types/DocBlock';
import ProjectEditor from './ProjectEditor';
import BlockRenderer from './BlockRenderer';

interface ProjectProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
}

const Project: React.FC<ProjectProps> = ({ project, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updatedProject: Project) => {
    onUpdate(updatedProject);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <ProjectEditor
        project={project}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {project.name}
          </h2>
          {project.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {project.description}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md
                   hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
      </div>

      <div className="space-y-4">
        {project.blocks.map((block: DocBlock) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
};

export default Project;