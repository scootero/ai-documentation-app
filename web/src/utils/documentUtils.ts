import { v4 as uuidv4 } from 'uuid';
import { DocBlock, BlockType } from '../types/DocBlock';
import { Project, NewProject } from '../types/Project';

/**
 * Creates a new empty block with the specified type
 */
export const createEmptyBlock = (type: BlockType): DocBlock => {
  return {
    id: uuidv4(),
    type,
    ...(type === 'heading' && { level: 1 }),
    ...(type === 'bulleted_list' && { items: [] }),
    ...(type === 'numbered_list' && { items: [] }),
    ...(type === 'code' && {
      showLineNumbers: true,
      copyButton: true,
      theme: 'dark'
    })
  };
};

/**
 * Creates a new project with basic metadata
 */
export const createNewProject = (projectData: NewProject): Project => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    ...projectData,
    createdAt: now,
    updatedAt: now
  };
};

/**
 * Updates a block within a project
 */
export const updateBlock = (
  project: Project,
  blockId: string,
  updates: Partial<DocBlock>
): Project => {
  const updatedBlocks = project.blocks.map(block =>
    block.id === blockId ? { ...block, ...updates } : block
  );

  return {
    ...project,
    blocks: updatedBlocks,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Adds a new block to a project at a specific index
 */
export const addBlockToProject = (
  project: Project,
  block: DocBlock,
  index?: number
): Project => {
  const newBlocks = [...project.blocks];
  if (typeof index === 'number') {
    newBlocks.splice(index, 0, block);
  } else {
    newBlocks.push(block);
  }

  return {
    ...project,
    blocks: newBlocks,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Removes a block from a project
 */
export const removeBlock = (
  project: Project,
  blockId: string
): Project => {
  return {
    ...project,
    blocks: project.blocks.filter(block => block.id !== blockId),
    updatedAt: new Date().toISOString()
  };
};