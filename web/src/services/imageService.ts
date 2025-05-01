// File: web/src/services/imageService.ts
import { supabase } from '@/lib/supabase';

export async function uploadImage(file: File, projectId: string) {
  try {
    const filename = `${Date.now()}-${file.name}`;
    const filePath = `${projectId}/${filename}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    // Save to database
    const { data: image, error: dbError } = await supabase
      .from('images')
      .insert([{
        url: publicUrl,
        filename: filePath,
        mime_type: file.type,
        size: file.size,
        project_id: projectId
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw new Error(`Failed to save image metadata: ${dbError.message}`);
    }

    return image;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

export async function getProjectImages(projectId: string) {
  try {
    const { data: images, error } = await supabase
      .from('images')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project images:', error);
      throw new Error(`Failed to fetch project images: ${error.message}`);
    }

    return images;
  } catch (error) {
    console.error('Get project images error:', error);
    throw error;
  }
}

export async function deleteImage(imageId: string) {
  try {
    // First get the image to get its filename
    const { data: image, error: fetchError } = await supabase
      .from('images')
      .select('filename')
      .eq('id', imageId)
      .single();

    if (fetchError) {
      console.error('Error fetching image for deletion:', fetchError);
      throw new Error(`Failed to fetch image for deletion: ${fetchError.message}`);
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('images')
      .remove([image.filename]);

    if (storageError) {
      console.error('Error deleting image from storage:', storageError);
      throw new Error(`Failed to delete image from storage: ${storageError.message}`);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error('Error deleting image from database:', dbError);
      throw new Error(`Failed to delete image from database: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Delete image error:', error);
    throw error;
  }
}