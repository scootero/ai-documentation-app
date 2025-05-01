'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { selectProject, modifyBlocks, simplifyProjects } from '@/services/chatgptService';
import { addBlocksToProject } from '@/services/projectService';
import { uploadImage } from '@/services/imageService';
import { Project, Block } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import NewProjectDialog from './NewProjectDialog';
import Toast from './Toast';

type ProjectWithBlocks = Project & {
    blocks: Block[];
};

interface TextInputProps {
    projects: ProjectWithBlocks[];
    onUpdateProject: (project: ProjectWithBlocks) => void;
    onNewProject: (name: string, description: string) => void;
    placeholder?: string;
}

interface PastedImage {
    id: string;
    file: File;
    previewUrl: string;
}

const TextInput: React.FC<TextInputProps> = ({
    projects,
    onUpdateProject,
    onNewProject,
    placeholder = "Type or paste text here..."
}) => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pastedImages, setPastedImages] = useState<PastedImage[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { user } = useAuth();

    const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'));
        if (imageItems.length === 0) return;

        e.preventDefault();

        const newImages: PastedImage[] = [];
        for (const item of imageItems) {
            const file = item.getAsFile();
            if (!file) continue;

            try {
                // Validate file size (e.g., max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`Image ${file.name} is too large. Maximum size is 5MB.`);
                }

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    throw new Error(`File ${file.name} is not a valid image.`);
                }

                const id = uuidv4();
                const previewUrl = URL.createObjectURL(file);
                newImages.push({ id, file, previewUrl });
            } catch (error) {
                console.error('Error processing pasted image:', error);
                setError(error instanceof Error ? error.message : 'Error processing image');
            }
        }

        if (newImages.length > 0) {
            setPastedImages(prev => [...prev, ...newImages]);

            // Add image references to the text
            const imageRefs = newImages.map(img => `[image#${img.id}]`).join('\n');
            const newText = text + (text ? '\n' : '') + imageRefs;
            setText(newText);
        }
    }, [text]);

    const removePastedImage = useCallback((id: string) => {
        setPastedImages(prev => {
            const image = prev.find(img => img.id === id);
            if (image) {
                URL.revokeObjectURL(image.previewUrl);
            }
            return prev.filter(img => img.id !== id);
        });

        // Remove image reference from text
        setText(prev => prev.replace(new RegExp(`\\[image#${id}\\]\\n?`, 'g'), ''));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!text.trim() && pastedImages.length === 0) || !user) return;

        setIsLoading(true);
        setError(null);
        try {
            // First, select the project for this input
            const simplifiedProjects = simplifyProjects(projects);
            const { projectId } = await selectProject(simplifiedProjects, text);

            const selectedProject = projects.find(p => p.id === projectId);
            if (!selectedProject) {
                throw new Error('Selected project not found');
            }

            // Upload pasted images first
            const uploadedImages = await Promise.all(
                pastedImages.map(async (pastedImage) => {
                    try {
                        const image = await uploadImage(pastedImage.file, projectId);
                        return {
                            id: pastedImage.id,
                            url: image.url,
                            description: `Image: ${pastedImage.file.name} (${(pastedImage.file.size / 1024).toFixed(1)}KB)`
                        };
                    } catch (error) {
                        console.error('Error uploading image:', error);
                        throw new Error(`Failed to upload image ${pastedImage.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                })
            );

            // Get blocks for the input
            const { blocks } = await modifyBlocks(selectedProject, text);

            // Add the blocks to the project
            const newBlocks = await addBlocksToProject(projectId, blocks.map(block => {
                const metadata = typeof block.metadata === 'object' && block.metadata !== null
                    ? { ...block.metadata }
                    : {};

                // If this is an image block, find the corresponding uploaded image
                if (block.type === 'image') {
                    const imageRef = block.content?.match(/\[image#(.*?)\]/)?.[1];
                    if (imageRef) {
                        const uploadedImage = uploadedImages.find(img => img.id === imageRef);
                        if (uploadedImage) {
                            (metadata as Record<string, unknown>).imageUrl = uploadedImage.url;
                        } else {
                            console.warn(`No uploaded image found for reference ${imageRef}`);
                        }
                    }
                }

                return {
                    project_id: projectId,
                    type: block.type,
                    content: block.content || null,
                    metadata,
                    position: block.position || null,
                    level: block.type === 'heading' ? block.level || null : null,
                    created_at: new Date().toISOString()
                };
            }));

            // Update the project with new blocks
            const updatedProject: ProjectWithBlocks = {
                id: selectedProject.id,
                user_id: selectedProject.user_id,
                name: selectedProject.name,
                description: selectedProject.description,
                created_at: selectedProject.created_at,
                updated_at: new Date().toISOString(),
                blocks: selectedProject.blocks.concat(newBlocks)
            };

            onUpdateProject(updatedProject);
            setText('');
            setPastedImages([]);
            setToast({ message: 'Content added successfully!', type: 'success' });
        } catch (error) {
            console.error('Error processing input:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while processing your input');
            setToast({ message: 'Failed to process input', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewProject = async (name: string, description: string) => {
        try {
            await onNewProject(name, description);
            setToast({ message: 'New project created successfully!', type: 'success' });
        } catch (error) {
            console.error('Error creating project:', error);
            setToast({ message: 'Failed to create project', type: 'error' });
            throw error;
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !user) return;

        setIsLoading(true);
        setError(null);
        try {
            // Validate files
            for (const file of Array.from(files)) {
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`Image ${file.name} is too large. Maximum size is 5MB.`);
                }
                if (!file.type.startsWith('image/')) {
                    throw new Error(`File ${file.name} is not a valid image.`);
                }
            }

            // First, select the project for these images
            const simplifiedProjects = simplifyProjects(projects);
            const { projectId } = await selectProject(simplifiedProjects, `Uploading ${files.length} image(s)`);

            const selectedProject = projects.find(p => p.id === projectId);
            if (!selectedProject) {
                throw new Error('Selected project not found');
            }

            // Upload each image and get their URLs
            const imageUploadPromises = Array.from(files).map(async (file) => {
                try {
                    const image = await uploadImage(file, projectId);
                    return {
                        url: image.url,
                        description: `Image: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`
                    };
                } catch (error) {
                    console.error('Error uploading image:', error);
                    throw new Error(`Failed to upload image ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            });

            const uploadedImages = await Promise.all(imageUploadPromises);
            const imageDescriptions = uploadedImages.map(img => img.description).join('\n');

            // Get blocks for the images
            const { blocks } = await modifyBlocks(selectedProject, imageDescriptions);

            // Add the blocks to the project
            const newBlocks = await addBlocksToProject(projectId, blocks.map(block => {
                const metadata = typeof block.metadata === 'object' && block.metadata !== null
                    ? { ...block.metadata }
                    : {};
                if (block.type === 'image') {
                    (metadata as Record<string, unknown>).imageUrl = uploadedImages[0].url;
                }
                return {
                    project_id: projectId,
                    type: block.type,
                    content: block.content || null,
                    metadata,
                    position: block.position || null,
                    level: block.type === 'heading' ? block.level || null : null,
                    created_at: new Date().toISOString()
                };
            }));

            // Update the project with new blocks
            const updatedProject: ProjectWithBlocks = {
                id: selectedProject.id,
                user_id: selectedProject.user_id,
                name: selectedProject.name,
                description: selectedProject.description,
                created_at: selectedProject.created_at,
                updated_at: new Date().toISOString(),
                blocks: selectedProject.blocks.concat(newBlocks)
            };

            onUpdateProject(updatedProject);
            setText('');
        } catch (error) {
            console.error('Error processing images:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while processing your images');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                    <button
                        type="button"
                        onClick={() => setIsDialogOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                                 transition-colors text-sm font-medium"
                    >
                        New Project
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300
                                 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600
                                 transition-colors text-sm font-medium"
                    >
                        Upload Images
                    </button>
                </div>
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onPaste={handlePaste}
                        placeholder={placeholder}
                        className="w-full h-48 p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 rounded-lg border border-gray-300 dark:border-gray-700
                                 focus:border-blue-500 dark:focus:border-blue-400
                                 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400
                                 outline-none resize-none"
                    />
                </div>
                {pastedImages.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-4">
                        {pastedImages.map((image) => (
                            <div key={image.id} className="relative">
                                <Image
                                    src={image.previewUrl}
                                    alt="Pasted preview"
                                    width={100}
                                    height={100}
                                    className="rounded-lg object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePastedImage(image.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full
                                             w-6 h-6 flex items-center justify-center hover:bg-red-600
                                             transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading || (!text.trim() && pastedImages.length === 0)}
                        className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
                            isLoading || (!text.trim() && pastedImages.length === 0)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isLoading ? 'Processing...' : 'Submit to AI'}
                    </button>
                </div>
            </form>

            <NewProjectDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleNewProject}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default TextInput;