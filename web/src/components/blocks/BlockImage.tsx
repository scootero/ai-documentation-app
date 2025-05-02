'use client';

import React from 'react';
import Image from 'next/image';
import { ImageBlock } from '@/supabase/types/blocks';

interface BlockImageProps {
  block: ImageBlock;
}

const BlockImage: React.FC<BlockImageProps> = ({ block }) => {
  const [imageError, setImageError] = React.useState(false);
  const { imageUrl, altText, caption, alignment, width, height } = block.metadata;

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
        alignment === 'center' ? 'mx-auto' :
        alignment === 'right' ? 'ml-auto' : ''
      }`}
      style={{
        width: width || '100%',
        height: height || '200px',
        maxWidth: '100%'
      }}
    >
      <Image
        src={imageUrl}
        alt={altText || ''}
        fill
        className="object-contain rounded-lg"
        onError={() => setImageError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {caption && (
        <figcaption className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          {caption}
        </figcaption>
      )}
    </div>
  );
};

export default BlockImage;