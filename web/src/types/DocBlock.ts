// ----------------------------------------------
// 📦 DocBlock: Core content block types
// ----------------------------------------------

export type BlockType =
  | 'heading'
  | 'subheading'
  | 'paragraph'
  | 'bulleted_list'
  | 'numbered_list'
  | 'image'
  | 'quote'
  | 'code';

export type TextFormatting = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type ImageAlignment = 'left' | 'center' | 'right';

export type CodeTheme = 'light' | 'dark' | string;

// Main DocBlock type definition
export interface DocBlock {
  id: string;
  type: BlockType;

  // Text content fields
  content?: string;
  level?: number;
  items?: string[];
  children?: DocBlock[];
  formatting?: TextFormatting;

  // Image-specific fields
  imageUrl?: string;
  altText?: string;
  width?: string;
  height?: string;
  alignment?: ImageAlignment;
  caption?: string;

  // Code-specific fields
  codeLanguage?: string;
  theme?: CodeTheme;
  showLineNumbers?: boolean;
  collapsible?: boolean;
  copyButton?: boolean;
}