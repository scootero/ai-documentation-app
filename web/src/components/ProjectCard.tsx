'use client';

import React, { useState } from 'react';
import { Project, Block } from '@/supabase/types/supabase';
import BlockRenderer from './blocks/BlockRenderer';
import { formatDistanceToNow } from 'date-fns';
import ProjectEditor from './ProjectEditor';
import { updateProject } from '@/services/projectService';

interface ProjectWithBlocks extends Project {
  blocks: Block[];
}

interface ProjectCardProps {
  project: ProjectWithBlocks;
  onUpdate: (project: ProjectWithBlocks) => void;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onUpdate,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (updatedProject: ProjectWithBlocks) => {
    try {
      const result = await updateProject(project.id, updatedProject);
      onUpdate({ ...result, blocks: project.blocks });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating project:', error);
      // TODO: Show error message to user
    }
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
    <article className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Project Header */}
      <header className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last updated {formatDistanceToNow(new Date(project.updated_at))} ago
            </p>
          </div>
          {onUpdate && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400
                       dark:hover:text-blue-300 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
        {project.description && (
          <p className="text-gray-700 dark:text-gray-300">
            {project.description}
          </p>
        )}
      </header>

      {/* Project Content */}
      <div className="p-6">
        <div className="space-y-6">
          {project.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      </div>

      {/* Project Footer */}
      <footer className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t
                       border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>Created {formatDistanceToNow(new Date(project.created_at))} ago</span>
          <span>{project.blocks.length} blocks</span>
        </div>
      </footer>
    </article>
  );
};

export default ProjectCard;