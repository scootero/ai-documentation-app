'use client';

import React from 'react';
import Image from 'next/image';
import { DocBlock } from '@/types/DocBlock';
import { IMAGES } from '@/constants/images';

interface BlockImageProps {
  block: DocBlock;
}

const BlockImage: React.FC<BlockImageProps> = ({ block }) => {
  const [imageError, setImageError] = React.useState(false);
  const imageUrl = imageError || !block.imageUrl ? IMAGES.PLACEHOLDER : block.imageUrl;

  return (
    <div
      className={`relative ${
        block.alignment === 'center' ? 'mx-auto' :
        block.alignment === 'right' ? 'ml-auto' : ''
      }`}
      style={{
        width: block.width || '100%',
        height: block.height || '200px',
        maxWidth: '100%'
      }}
    >
      <Image
        src={imageUrl}
        alt={block.altText || ''}
        fill
        className="object-contain rounded-lg"
        onError={() => setImageError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

export default BlockImage;