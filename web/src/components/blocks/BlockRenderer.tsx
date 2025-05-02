'use client';

import React from 'react';
import { Block } from '@/supabase/types/supabase';
import { ImageBlock } from '@/supabase/types/blocks';
import BlockImage from './BlockImage';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface BlockRendererProps {
  block: Block;
}

interface CodeBlockMetadata {
  language?: string;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  const isImageBlock = (block: Block): block is ImageBlock => {
    return block.type === 'image' &&
           block.metadata !== null &&
           typeof block.metadata === 'object' &&
           !Array.isArray(block.metadata);
  };

  if (isImageBlock(block)) {
    return <BlockImage block={block} />;
  }

  if (!block.content) {
    return null;
  }

  // Handle different block types
  switch (block.type) {
    case 'heading':
      const level = block.level || 1;
      const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return <HeadingTag className="text-2xl font-bold mb-4">{block.content}</HeadingTag>;

    case 'paragraph':
      return <p className="mb-4">{block.content}</p>;

    case 'list':
      const items = block.content.split('\n').filter(item => item.trim());
      return (
        <ul className="list-disc list-inside mb-4">
          {items.map((item, index) => (
            <li key={index} className="mb-1">{item.replace(/^[•-]\s*/, '')}</li>
          ))}
        </ul>
      );

    case 'code':
      const codeMetadata = block.metadata as CodeBlockMetadata;
      const language = codeMetadata?.language || 'javascript';
      return (
        <div className="mb-4">
          <SyntaxHighlighter
            language={language}
            style={atomDark}
            className="rounded-lg"
          >
            {block.content}
          </SyntaxHighlighter>
        </div>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic mb-4">
          {block.content}
        </blockquote>
      );

    default:
      return <p className="mb-4">{block.content}</p>;
  }
};

export default BlockRenderer;