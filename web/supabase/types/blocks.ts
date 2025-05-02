import { Block } from './supabase';

export interface ImageBlockMetadata {
  imageUrl: string;
  altText?: string;
  caption?: string;
  alignment?: 'left' | 'center' | 'right';
  width?: string;
  height?: string;
}

export type ImageBlock = Block & {
  type: 'image';
  metadata: ImageBlockMetadata;
};