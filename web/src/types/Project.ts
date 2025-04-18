import { DocBlock } from './DocBlock';

// ----------------------------------------------
// 📁 Project: Container for documentation blocks
// ----------------------------------------------

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;  // ISO string timestamp
  updatedAt: string;  // ISO string timestamp
  blocks: DocBlock[];
}

// Helper type for creating a new project
export type NewProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

// Project with computed metadata
export interface ProjectWithMetadata extends Project {
  blockCount: number;
  lastModifiedBy?: string;
  status?: 'draft' | 'published';
}