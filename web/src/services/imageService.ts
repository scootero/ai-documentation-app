// File: web/src/services/imageService.ts
import { supabase } from '@/lib/supabase';

export async function uploadImage(file: File, projectId: string) {
  const filename = `${Date.now()}-${file.name}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('images')
    .upload(`public/${filename}`, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(`public/${filename}`);

  // Save to database
  const { data: image, error: dbError } = await supabase
    .from('images')
    .insert([{
      url: publicUrl,
      filename,
      mime_type: file.type,
      size: file.size,
      project_id: projectId
    }])
    .select()
    .single();

  if (dbError) throw dbError;
  return image;
}

export async function getProjectImages(projectId: string) {
  const { data: images, error } = await supabase
    .from('images')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return images;
}