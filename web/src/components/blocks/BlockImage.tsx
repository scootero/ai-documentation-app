'use client';

import React from 'react';
import Image from 'next/image';
import { Block } from '@/types/supabase';

interface BlockImageProps {
  block: Block;
}

const BlockImage: React.FC<BlockImageProps> = ({ block }) => {
  const [imageError, setImageError] = React.useState(false);
  const imageUrl = block.metadata?.imageUrl as string;

  if (!imageUrl || imageError) {
    return (
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No image available</p>
      </div>
    );
  }

  return (
    <div
      className={`relative ${
        block.metadata?.alignment === 'center' ? 'mx-auto' :
        block.metadata?.alignment === 'right' ? 'ml-auto' : ''
      }`}
      style={{
        width: block.metadata?.width || '100%',
        height: block.metadata?.height || '200px',
        maxWidth: '100%'
      }}
    >
      <Image
        src={imageUrl}
        alt={block.metadata?.altText as string || ''}
        fill
        className="object-contain rounded-lg"
        onError={() => setImageError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {block.metadata?.caption && (
        <figcaption className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          {block.metadata.caption as string}
        </figcaption>
      )}
    </div>
  );
};

export default BlockImage;