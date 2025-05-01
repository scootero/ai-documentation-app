'use client';

import React, { useState } from 'react';

interface NewProjectDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, description: string) => Promise<void>;
}

const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await onSubmit(name.trim(), description.trim());
            setName('');
            setDescription('');
            onClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create project');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Create New Project
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="project-name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Project Name
                            </label>
                            <input
                                type="text"
                                id="project-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300
                                         dark:border-gray-600 rounded-md text-gray-900 dark:text-white
                                         focus:outline-none focus:ring-2 focus:ring-blue-500
                                         dark:focus:ring-blue-400"
                                placeholder="Enter project name"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="project-description"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Description (optional)
                            </label>
                            <textarea
                                id="project-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300
                                         dark:border-gray-600 rounded-md text-gray-900 dark:text-white
                                         focus:outline-none focus:ring-2 focus:ring-blue-500
                                         dark:focus:ring-blue-400 resize-none h-24"
                                placeholder="Enter project description"
                            />
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm">
                                {error}
                            </div>
                        )}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900
                                         dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                                    isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {isLoading ? 'Creating...' : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewProjectDialog;