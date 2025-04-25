'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import TextInput from '@/components/TextInput';
import ProjectCard from '@/components/ProjectCard';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects, createProject } from '@/services/projectService';
import { Project, Block } from '@/types/supabase';

interface ProjectWithBlocks extends Project {
  blocks: Block[];
}

export default function Home() {
  const [projects, setProjects] = useState<ProjectWithBlocks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewProject = async (name: string, description: string) => {
    try {
      setError(null);
      const newProject = await createProject(name, description);
      setProjects([{ ...newProject, blocks: [] }, ...projects]);
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project. Please try again.');
    }
  };

  const handleUpdateProject = (updatedProject: ProjectWithBlocks) => {
    setProjects(projects.map(project =>
      project.id === updatedProject.id ? updatedProject : project
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-8 flex items-center justify-center">
        <div className="text-white text-lg">Loading your projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
            {error}
            <button
              onClick={loadProjects}
              className="ml-4 text-sm underline hover:text-red-400"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 p-8">
        <main className="max-w-4xl mx-auto space-y-12">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">AI Documentation App</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Welcome, {user?.email}</span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          <section>
            <TextInput
              projects={projects}
              onUpdateProject={handleUpdateProject}
              onNewProject={handleNewProject}
              placeholder="Type or paste text here..."
            />
          </section>

          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Your Projects</h2>
              <span className="text-gray-400">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdate={handleUpdateProject}
                />
              ))}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-12 bg-gray-900 rounded-lg">
                <p className="text-gray-400">
                  No projects yet. Create one by clicking the &quot;New Project&quot; button above.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
