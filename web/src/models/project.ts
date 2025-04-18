
// ----------------------------------------------
// 📦 DocBlock: Represents a single piece of content in a project
// ----------------------------------------------

export type DocBlock = {
  id: string; // Unique identifier for this block (can be generated with uuid)

  // 🔤 Type of content this block represents
  type:
    | 'heading'
    | 'subheading'
    | 'paragraph'
    | 'bulleted_list'
    | 'numbered_list'
    | 'image'
    | 'quote'
    | 'code';

  // ----------------------
  // ✏️ General Text Fields
  // ----------------------
  content?: string; // Used for headings, paragraphs, quotes, code
  level?: number;   // Used for headings/subheadings (1 = H1, 2 = H2, etc.)
  items?: string[]; // List items (for bullet or numbered lists)
  children?: DocBlock[]; // Optional nested sub-blocks

  // Optional text formatting (used for paragraphs, quotes, etc.)
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };

  // ----------------------
  // 🖼️ Image Block Fields
  // ----------------------
  imageUrl?: string;
  altText?: string;
  width?: string;      // e.g. "300px" or "50%"
  height?: string;     // e.g. "200px" or "auto"
  alignment?: 'left' | 'center' | 'right';
  caption?: string;

  // ----------------------
  // 💻 Code Block Fields
  // ----------------------
  codeLanguage?: string;       // e.g. "javascript", "python"
  theme?: 'light' | 'dark' | string; // Optional visual theme
  showLineNumbers?: boolean;
  collapsible?: boolean;
  copyButton?: boolean;
};

// ----------------------------------------------
// 📁 Project: A container of blocks with metadata
// ----------------------------------------------

export type Project = {
  id: string;         // Unique ID for this project
  name: string;       // Human-readable name
  description?: string; // Short explanation of what this project is about
  createdAt: string;  // ISO string timestamp
  updatedAt: string;  // ISO string timestamp
  blocks: DocBlock[]; // Ordered list of content blocks
};


/* export type DocBlock = {
  id: string;
  type: 'heading' | 'subheading' | 'paragraph' | 'bulleted_list' | 'numbered_list' | 'image' | 'quote' | 'code';
  content?: string;
  level?: number;
  items?: string[];
  children?: DocBlock[];
  formatting?: { bold?: boolean; italic?: boolean; underline?: boolean };
  imageUrl?: string;
  altText?: string;
  width?: string;
  height?: string;
  alignment?: 'left' | 'center' | 'right';
  caption?: string;
  codeLanguage?: string;
  theme?: string;
  showLineNumbers?: boolean;
  collapsible?: boolean;
  copyButton?: boolean;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  blocks: DocBlock[];
};

*/