import { supabase } from '@/lib/supabase';
import { getAllSampleProjects } from '@/data/sampleProjects';

export async function migrateProjects(userId: string) {
  const sampleProjects = getAllSampleProjects();

  for (const project of sampleProjects) {
    // Create project
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert([{
        user_id: userId,
        name: project.name,
        description: project.description,
        created_at: project.createdAt,
        updated_at: project.updatedAt
      }])
      .select()
      .single();

    if (projectError) throw projectError;

    // Create blocks
    const { error: blocksError } = await supabase
      .from('blocks')
      .insert(
        project.blocks.map((block, index) => ({
          project_id: newProject.id,
          type: block.type,
          content: block.content,
          metadata: block.metadata || {},
          position: index
        }))
      );

    if (blocksError) throw blocksError;
  }
}
