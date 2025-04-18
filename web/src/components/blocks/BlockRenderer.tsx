'use client';

import React from 'react';
import { DocBlock } from '@/types/DocBlock';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import BlockImage from './BlockImage';

interface BlockRendererProps {
  block: DocBlock;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  // Helper function to apply text formatting
  const getFormattedText = (text: string, formatting?: DocBlock['formatting']) => {
    if (!formatting) return text;

    return (
      <span
        className={`
          ${formatting.bold ? 'font-bold' : ''}
          ${formatting.italic ? 'italic' : ''}
          ${formatting.underline ? 'underline' : ''}
        `.trim()}
      >
        {text}
      </span>
    );
  };

  // Helper function to render heading
  const renderHeading = (content: string | undefined, level: number = 1) => {
    switch (level) {
      case 1:
        return <h1 className="text-2xl font-bold mb-4">{content}</h1>;
      case 2:
        return <h2 className="text-xl font-bold mb-4">{content}</h2>;
      case 3:
        return <h3 className="text-lg font-bold mb-3">{content}</h3>;
      case 4:
        return <h4 className="text-base font-bold mb-3">{content}</h4>;
      case 5:
        return <h5 className="text-sm font-bold mb-2">{content}</h5>;
      case 6:
        return <h6 className="text-xs font-bold mb-2">{content}</h6>;
      default:
        return <h1 className="text-2xl font-bold mb-4">{content}</h1>;
    }
  };

  // Render different block types
  switch (block.type) {
    case 'heading':
      return renderHeading(block.content, block.level);

    case 'subheading':
      return renderHeading(block.content, (block.level || 0) + 1);

    case 'paragraph':
      return (
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          {block.content && getFormattedText(block.content, block.formatting)}
        </p>
      );

    case 'bulleted_list':
      return (
        <ul className="list-disc list-inside mb-4 space-y-2">
          {block.items?.map((item, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">
              {item}
            </li>
          ))}
        </ul>
      );

    case 'numbered_list':
      return (
        <ol className="list-decimal list-inside mb-4 space-y-2">
          {block.items?.map((item, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">
              {item}
            </li>
          ))}
        </ol>
      );

    case 'image':
      return (
        <figure className="mb-4">
          <BlockImage block={block} />
          {block.caption && (
            <figcaption className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-4 italic">
          {block.content && getFormattedText(block.content, block.formatting)}
        </blockquote>
      );

    case 'code':
      return (
        <div className="mb-4">
          <SyntaxHighlighter
            language={block.codeLanguage || 'text'}
            style={atomDark}
            showLineNumbers={block.showLineNumbers}
            className="rounded-lg"
          >
            {block.content || ''}
          </SyntaxHighlighter>
          {block.copyButton && (
            <button
              onClick={() => navigator.clipboard.writeText(block.content || '')}
              className="mt-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400
                       dark:hover:text-gray-200 transition-colors"
            >
              Copy code
            </button>
          )}
        </div>
      );

    default:
      return null;
  }
};

export default BlockRenderer;