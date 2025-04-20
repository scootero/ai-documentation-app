import React from 'react';
import { DocBlock } from '@/types/DocBlock';

interface BlockRendererProps {
  block: DocBlock;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  switch (block.type) {
    case 'heading':
    case 'subheading':
      const level = block.level || 1;
      const headingClasses = {
        1: 'text-3xl font-bold mb-4',
        2: 'text-2xl font-bold mb-3',
        3: 'text-xl font-bold mb-2',
        4: 'text-lg font-bold mb-2',
        5: 'text-base font-bold mb-2',
        6: 'text-sm font-bold mb-2',
      }[level];

      switch (level) {
        case 1:
          return <h1 className={`${headingClasses} text-gray-900 dark:text-white`}>{block.content}</h1>;
        case 2:
          return <h2 className={`${headingClasses} text-gray-900 dark:text-white`}>{block.content}</h2>;
        case 3:
          return <h3 className={`${headingClasses} text-gray-900 dark:text-white`}>{block.content}</h3>;
        case 4:
          return <h4 className={`${headingClasses} text-gray-900 dark:text-white`}>{block.content}</h4>;
        case 5:
          return <h5 className={`${headingClasses} text-gray-900 dark:text-white`}>{block.content}</h5>;
        case 6:
          return <h6 className={`${headingClasses} text-gray-900 dark:text-white`}>{block.content}</h6>;
        default:
          return <h1 className={`${headingClasses} text-gray-900 dark:text-white`}>{block.content}</h1>;
      }

    case 'paragraph':
      return (
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {block.content}
        </p>
      );

    case 'bulleted_list':
    case 'numbered_list':
      const ListTag = block.type === 'numbered_list' ? 'ol' : 'ul';
      return (
        <ListTag className="list-inside mb-4 space-y-1">
          {block.items?.map((item, index) => (
            <li
              key={index}
              className={`text-gray-700 dark:text-gray-300 ${
                block.type === 'numbered_list' ? 'list-decimal' : 'list-disc'
              } ml-4`}
            >
              {item}
            </li>
          ))}
        </ListTag>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 mb-4 italic text-gray-600 dark:text-gray-400">
          {block.content}
        </blockquote>
      );

    case 'code':
      return (
        <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
          <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
            {block.content}
          </code>
        </pre>
      );

    case 'image':
      return (
        <div className={`mb-4 ${block.alignment === 'center' ? 'text-center' : ''}`}>
          <img
            src={block.imageUrl}
            alt={block.altText || ''}
            className={`max-w-full h-auto ${block.alignment === 'right' ? 'ml-auto' : ''}`}
            style={{
              width: block.width,
              height: block.height,
            }}
          />
          {block.caption && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {block.caption}
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
};

export default BlockRenderer;