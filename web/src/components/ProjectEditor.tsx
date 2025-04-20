'use client';

import React, { useState } from 'react';
import { Project } from '@/types/Project';
import { DocBlock } from '@/types/DocBlock';
import { v4 as uuidv4 } from 'uuid';

interface ProjectEditorProps {
  project: Project;
  onSave: (updatedProject: Project) => void;
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
  const [content, setContent] = useState(
    project.blocks
      .map(block => {
        switch (block.type) {
          case 'heading':
          case 'subheading':
            return `# ${block.content}\n`;
          case 'paragraph':
            return `${block.content}\n\n`;
          case 'bulleted_list':
            return block.items?.map(item => `• ${item}`).join('\n') + '\n\n';
          case 'numbered_list':
            return block.items?.map((item, i) => `${i + 1}. ${item}`).join('\n') + '\n\n';
          case 'quote':
            return `> ${block.content}\n\n`;
          case 'code':
            return `\`\`\`${block.codeLanguage || ''}\n${block.content}\n\`\`\`\n\n`;
          default:
            return '';
        }
      })
      .join('')
  );

  // Parse content into blocks
  const parseContent = (text: string): DocBlock[] => {
    const blocks: DocBlock[] = [];
    const lines = text.split('\n');
    let currentBlock: Partial<DocBlock> | null = null;
    let codeBlockLanguage = '';
    let isInCodeBlock = false;

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Skip empty lines unless in code block
      if (!trimmedLine && !isInCodeBlock) {
        if (currentBlock) {
          blocks.push(currentBlock as DocBlock);
          currentBlock = null;
        }
        return;
      }

      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        if (!isInCodeBlock) {
          isInCodeBlock = true;
          codeBlockLanguage = trimmedLine.slice(3);
          currentBlock = {
            id: uuidv4(),
            type: 'code',
            content: '',
            codeLanguage: codeBlockLanguage,
            showLineNumbers: true,
            copyButton: true
          };
        } else {
          isInCodeBlock = false;
          if (currentBlock) {
            blocks.push(currentBlock as DocBlock);
            currentBlock = null;
          }
        }
        return;
      }

      if (isInCodeBlock) {
        if (currentBlock) {
          currentBlock.content = (currentBlock.content || '') + line + '\n';
        }
        return;
      }

      // Handle other block types
      if (trimmedLine.startsWith('# ')) {
        if (currentBlock) blocks.push(currentBlock as DocBlock);
        currentBlock = {
          id: uuidv4(),
          type: 'heading',
          content: trimmedLine.slice(2),
          level: 1
        };
      } else if (trimmedLine.startsWith('## ')) {
        if (currentBlock) blocks.push(currentBlock as DocBlock);
        currentBlock = {
          id: uuidv4(),
          type: 'subheading',
          content: trimmedLine.slice(3),
          level: 2
        };
      } else if (trimmedLine.startsWith('> ')) {
        if (currentBlock) blocks.push(currentBlock as DocBlock);
        currentBlock = {
          id: uuidv4(),
          type: 'quote',
          content: trimmedLine.slice(2),
          formatting: { italic: true }
        };
      } else if (trimmedLine.startsWith('• ')) {
        if (!currentBlock || currentBlock.type !== 'bulleted_list') {
          if (currentBlock) blocks.push(currentBlock as DocBlock);
          currentBlock = {
            id: uuidv4(),
            type: 'bulleted_list',
            items: []
          };
        }
        currentBlock.items = [...(currentBlock.items || []), trimmedLine.slice(2)];
      } else if (/^\d+\.\s/.test(trimmedLine)) {
        if (!currentBlock || currentBlock.type !== 'numbered_list') {
          if (currentBlock) blocks.push(currentBlock as DocBlock);
          currentBlock = {
            id: uuidv4(),
            type: 'numbered_list',
            items: []
          };
        }
        currentBlock.items = [...(currentBlock.items || []), trimmedLine.replace(/^\d+\.\s/, '')];
      } else {
        if (!currentBlock || currentBlock.type !== 'paragraph') {
          if (currentBlock) blocks.push(currentBlock as DocBlock);
          currentBlock = {
            id: uuidv4(),
            type: 'paragraph',
            content: trimmedLine
          };
        } else {
          currentBlock.content += ' ' + trimmedLine;
        }
      }
    });

    // Add the last block if exists
    if (currentBlock) {
      blocks.push(currentBlock as DocBlock);
    }

    return blocks;
  };

  const handleSave = () => {
    const updatedProject: Project = {
      ...project,
      name: title,
      description: description,
      blocks: parseContent(content),
      updatedAt: new Date().toISOString()
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
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 bg-gray-50 dark:bg-gray-900 text-gray-900
                     dark:text-gray-100 rounded-lg border border-gray-300
                     dark:border-gray-700 focus:border-blue-500
                     dark:focus:border-blue-400 outline-none resize-none
                     font-mono text-sm"
            placeholder="Start typing your content here..."
          />
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