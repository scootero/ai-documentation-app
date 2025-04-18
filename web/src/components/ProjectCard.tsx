'use client';

import React from 'react';
import { Project } from '@/types/Project';
import BlockRenderer from './blocks/BlockRenderer';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onEdit?: () => void;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  className = ''
}) => {
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
              Last updated {formatDistanceToNow(new Date(project.updatedAt))} ago
            </p>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
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
          <span>Created {formatDistanceToNow(new Date(project.createdAt))} ago</span>
          <span>{project.blocks.length} blocks</span>
        </div>
      </footer>
    </article>
  );
};

export default ProjectCard;