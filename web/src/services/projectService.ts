// File: web/src/services/projectService.ts
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Project = Database['public']['Tables']['projects']['Row'];
type Block = Database['public']['Tables']['blocks']['Row'];
type Image = Database['public']['Tables']['images']['Row'];

export async function getProjects() {
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (projectsError) throw projectsError;

  // Get blocks for each project
  const projectsWithBlocks = await Promise.all(
    projects.map(async (project) => {
      const { data: blocks, error: blocksError } = await supabase
        .from('blocks')
        .select('*')
        .eq('project_id', project.id)
        .order('position', { ascending: true });

      if (blocksError) throw blocksError;

      // Get images for blocks that reference them
      const blocksWithImages = await Promise.all(
        blocks.map(async (block) => {
          if (block.type === 'image' && block.metadata?.imageId) {
            const { data: image, error: imageError } = await supabase
              .from('images')
              .select('*')
              .eq('id', block.metadata.imageId)
              .single();

            if (imageError) throw imageError;
            return { ...block, image };
          }
          return block;
        })
      );

      return { ...project, blocks: blocksWithImages };
    })
  );

  return projectsWithBlocks;
}

export async function getProject(id: string) {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (projectError) throw projectError;

  const { data: blocks, error: blocksError } = await supabase
    .from('blocks')
    .select('*')
    .eq('project_id', id)
    .order('position', { ascending: true });

  if (blocksError) throw blocksError;

  return { ...project, blocks };
}

export async function createProject(name: string, description?: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to create a project');
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert([{
      name,
      description,
      user_id: user.id
    }])
    .select()
    .single();

  if (error) throw error;
  return project;
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data: project, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return project;
}

export async function addBlocksToProject(projectId: string, blocks: Omit<Block, 'id' | 'created_at'>[]) {
  try {
    // First verify the project belongs to the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated');

    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (!project || project.user_id !== user.id) {
      throw new Error('Project not found or access denied');
    }

    // Insert the blocks
    const { data, error } = await supabase
      .from('blocks')
      .insert(
        blocks.map(block => ({
          project_id: projectId,
          type: block.type,
          content: block.content,
          metadata: block.metadata || {},
          position: block.position,
          level: block.level
        }))
      )
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding blocks:', error);
    throw error;
  }
}