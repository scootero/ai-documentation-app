-- Drop existing table and related objects if they exist
DROP TRIGGER IF EXISTS on_image_deleted ON public.images;
DROP FUNCTION IF EXISTS public.handle_image_deletion();
DROP TABLE IF EXISTS public.images;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create the images table
CREATE TABLE public.images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own project images"
    ON public.images
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM public.projects
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own project images"
    ON public.images
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own project images"
    ON public.images
    FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM public.projects
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own project images"
    ON public.images
    FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM public.projects
            WHERE user_id = auth.uid()
        )
    );

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Set up storage policies
CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'images'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'images'
        AND auth.uid() = owner
    );

CREATE POLICY "Users can delete their own images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'images'
        AND auth.uid() = owner
    );

-- Create function to handle image deletion
CREATE OR REPLACE FUNCTION public.handle_image_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete the file from storage
    DELETE FROM storage.objects
    WHERE bucket_id = 'images'
    AND name = OLD.filename;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for image deletion
CREATE TRIGGER on_image_deleted
    AFTER DELETE ON public.images
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_image_deletion();