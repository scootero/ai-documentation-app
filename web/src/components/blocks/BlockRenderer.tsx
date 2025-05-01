'use client';

import React from 'react';
import { Block } from '@/types/supabase';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import BlockImage from './BlockImage';

interface BlockRendererProps {
  block: Block;
}

interface BlockMetadata {
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
  items?: string[];
  codeLanguage?: string;
  showLineNumbers?: boolean;
  alignment?: 'left' | 'center' | 'right';
  width?: string;
  height?: string;
  altText?: string;
  caption?: string;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  const metadata = block.metadata as BlockMetadata;

  const renderHeading = (content: string | null, level: number | null) => {
    const Tag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
    return (
      <Tag className={`font-bold text-gray-900 dark:text-white mb-4 ${
        level === 1 ? 'text-3xl' :
        level === 2 ? 'text-2xl' :
        'text-xl'
      }`}>
        {content}
      </Tag>
    );
  };

  const getFormattedText = (text: string, formatting?: BlockMetadata['formatting']) => {
    if (!formatting) return text;
    let formattedText = text;
    if (formatting.bold) formattedText = `<strong>${formattedText}</strong>`;
    if (formatting.italic) formattedText = `<em>${formattedText}</em>`;
    if (formatting.underline) formattedText = `<u>${formattedText}</u>`;
    return formattedText;
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
          {block.content && getFormattedText(block.content, metadata.formatting)}
        </p>
      );

    case 'bulleted_list':
      return (
        <ul className="list-disc list-inside mb-4 space-y-2">
          {metadata.items?.map((item, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">
              {item}
            </li>
          ))}
        </ul>
      );

    case 'numbered_list':
      return (
        <ol className="list-decimal list-inside mb-4 space-y-2">
          {metadata.items?.map((item, index) => (
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
        </figure>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-4 italic">
          {block.content && getFormattedText(block.content, metadata.formatting)}
        </blockquote>
      );

    case 'code':
      return (
        <div className="mb-4">
          <SyntaxHighlighter
            language={metadata.codeLanguage || 'text'}
            style={atomDark}
            showLineNumbers={metadata.showLineNumbers}
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            {block.content || ''}
          </SyntaxHighlighter>
        </div>
      );

    default:
      return null;
  }
};

export default BlockRenderer;