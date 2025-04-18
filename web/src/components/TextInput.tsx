'use client';

import React from 'react';

interface TextInputProps {
    onSubmit: (text: string) => void;
    onNewProject?: () => void;
    placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({
    onSubmit,
    onNewProject,
    placeholder = "Type or paste text here..."
}) => {
    const [inputText, setInputText] = React.useState('');

    const handleSubmit = () => {
        if (inputText.trim()) {
            onSubmit(inputText);
            setInputText('');
        }
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-white text-xl mb-3">New Input</h2>
            <div className="space-y-4">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-32 p-3 bg-gray-800 text-white rounded-lg
                             placeholder-gray-400 focus:outline-none focus:ring-2
                             focus:ring-blue-500 resize-none"
                />
                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md
                                 hover:bg-blue-700 transition-colors"
                    >
                        Submit to AI
                    </button>
                    {onNewProject && (
                        <button
                            onClick={onNewProject}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md
                                     hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <span className="mr-1">+</span> New Project
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TextInput;