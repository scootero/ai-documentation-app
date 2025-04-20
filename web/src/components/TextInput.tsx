'use client';

import React, { useState, useRef } from 'react';
import { selectProject, modifyBlocks, simplifyProjects } from '@/services/chatgptService';
import { Project } from '@/types/Project';
import { v4 as uuidv4 } from 'uuid';

interface TextInputProps {
    projects: Project[];
    onUpdateProject: (project: Project) => void;
    onNewProject?: (name: string, description: string) => void;
    placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({
    projects,
    onUpdateProject,
    onNewProject,
    placeholder = "Type or paste text here..."
}) => {
    const [text, setText] = useState('');
    const [isNewProjectMode, setIsNewProjectMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNewProjectMode) {
            // Handle new project creation
            const lines = text.split('\n');
            const nameLine = lines.find(line => line.startsWith('Project Name:'));
            const descriptionLine = lines.find(line => line.startsWith('Description:'));

            if (nameLine && descriptionLine) {
                const name = nameLine.replace('Project Name:', '').trim();
                const description = descriptionLine.replace('Description:', '').trim();

                if (name && onNewProject) {
                    onNewProject(name, description);
                    setText('');
                    setIsNewProjectMode(false);
                }
            }
        } else {
            // Handle AI submission
            setIsLoading(true);
            try {
                // First API call: Select project
                const simplifiedProjects = simplifyProjects(projects);
                const { projectId } = await selectProject(simplifiedProjects, text);

                // Find the selected project
                const selectedProject = projects.find(p => p.id === projectId);
                if (!selectedProject) {
                    throw new Error('Selected project not found');
                }

                // Second API call: Modify blocks
                const { blocks } = await modifyBlocks(selectedProject, text);

                // Update the project with new blocks
                const updatedProject: Project = {
                    ...selectedProject,
                    blocks: [...selectedProject.blocks, ...blocks],
                    updatedAt: new Date().toISOString()
                };

                onUpdateProject(updatedProject);
                setText('');
            } catch (error) {
                console.error('Error processing input:', error);
                // TODO: Show error message to user
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleNewProject = () => {
        setIsNewProjectMode(true);
        setText('Project Name:\nDescription:');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsLoading(true);
        try {
            // Convert images to base64
            const imagePromises = Array.from(files).map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsDataURL(file);
                });
            });

            const base64Images = await Promise.all(imagePromises);
            const imageDescriptions = base64Images.map(img => `[Image: ${img}]`).join('\n');

            // Use the same flow as text input but with image descriptions
            const simplifiedProjects = simplifyProjects(projects);
            const { projectId } = await selectProject(simplifiedProjects, imageDescriptions);

            const selectedProject = projects.find(p => p.id === projectId);
            if (!selectedProject) {
                throw new Error('Selected project not found');
            }

            const { blocks } = await modifyBlocks(selectedProject, imageDescriptions);

            const updatedProject: Project = {
                ...selectedProject,
                blocks: [...selectedProject.blocks, ...blocks],
                updatedAt: new Date().toISOString()
            };

            onUpdateProject(updatedProject);
        } catch (error) {
            console.error('Error processing images:', error);
            // TODO: Show error message to user
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-32 p-4 bg-gray-900 text-gray-100 rounded-lg border border-gray-700
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none
                             font-mono text-sm"
                    disabled={isLoading}
                />
                <div className="flex justify-end space-x-4">
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
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                        disabled={isLoading}
                    >
                        Upload Images
                    </button>
                    <button
                        type="button"
                        onClick={handleNewProject}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                        disabled={isLoading}
                    >
                        New Project
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : (isNewProjectMode ? 'Create Project' : 'Submit to AI')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TextInput;