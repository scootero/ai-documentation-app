'use client';

import React from 'react';
import Image from 'next/image';
import { ImageBlock } from '@/supabase/types/blocks';

interface EditableBlockImageProps {
  block: ImageBlock;
  onRemove: () => void;
}

const EditableBlockImage: React.FC<EditableBlockImageProps> = ({ block, onRemove }) => {
  const [imageError, setImageError] = React.useState(false);
  const { imageUrl, altText, caption, alignment, width, height } = block.metadata;

  if (!imageUrl || imageError) {
    return (
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center relative">
        <p className="text-gray-500 dark:text-gray-400">No image available</p>
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          title="Remove image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
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
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
        title="Remove image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
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

export default EditableBlockImage;