'use client';

import React, { useState } from 'react';
import { Project, Block } from '@/supabase/types';
import EditableBlockImage from './blocks/EditableBlockImage';

interface ProjectWithBlocks extends Project {
  blocks: Block[];
}

interface ProjectEditorProps {
  project: ProjectWithBlocks;
  onSave: (updatedProject: ProjectWithBlocks) => void;
  onCancel: () => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project,
  onSave,
  onCancel
}) => {
  // State for the editable content
  const [title, setTitle] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [blocks, setBlocks] = useState<Block[]>(project.blocks);

  const handleRemoveBlock = (blockId: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
  };

  const handleSave = () => {
    const updatedProject: ProjectWithBlocks = {
      ...project,
      name: title,
      description: description,
      blocks: blocks,
      updated_at: new Date().toISOString()
    };
    onSave(updatedProject);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="space-y-4">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold bg-transparent border-b border-gray-300
                   dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400
                   outline-none px-2 py-1 text-gray-900 dark:text-white"
          placeholder="Project Title"
        />

        {/* Description Input */}
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full text-gray-600 dark:text-gray-400 bg-transparent border-b
                   border-gray-300 dark:border-gray-700 focus:border-blue-500
                   dark:focus:border-blue-400 outline-none px-2 py-1"
          placeholder="Project Description"
        />

        {/* Content Editor */}
        <div className="mt-6">
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Formatting Guide:
            <ul className="list-disc list-inside">
              <li># Heading</li>
              <li>## Subheading</li>
              <li>• Bullet point</li>
              <li>1. Numbered list</li>
              <li>&gt; Quote</li>
              <li>```language Code block ```</li>
            </ul>
          </div>
          <div className="space-y-4">
            {blocks.map((block) => {
              if (block.type === 'image') {
                return (
                  <div key={block.id} className="mb-4">
                    <EditableBlockImage
                      block={block}
                      onRemove={() => handleRemoveBlock(block.id)}
                    />
                  </div>
                );
              }
              return (
                <div key={block.id} className="relative group">
                  <textarea
                    value={block.content || ''}
                    onChange={(e) => {
                      setBlocks(prevBlocks =>
                        prevBlocks.map(b =>
                          b.id === block.id
                            ? { ...b, content: e.target.value }
                            : b
                        )
                      );
                    }}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900
                             dark:text-gray-100 rounded-lg border border-gray-300
                             dark:border-gray-700 focus:border-blue-500
                             dark:focus:border-blue-400 outline-none resize-none
                             font-mono text-sm"
                    rows={3}
                  />
                  <button
                    onClick={() => handleRemoveBlock(block.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full
                             hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove block"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800
                     dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                     transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;