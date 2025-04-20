'use client';

import TextInput from "../components/TextInput";
import ProjectCard from "../components/ProjectCard";
import { getAllSampleProjects } from "../data/sampleProjects";
import { useState } from "react";
import { Project } from "@/types/Project";
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>(getAllSampleProjects());

  const handleNewProject = (name: string, description: string) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          id: uuidv4(),
          type: 'heading',
          content: name,
          level: 1
        },
        {
          id: uuidv4(),
          type: 'paragraph',
          content: description
        }
      ]
    };

    setProjects([...projects, newProject]);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(project =>
      project.id === updatedProject.id ? updatedProject : project
    ));
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <main className="max-w-4xl mx-auto space-y-12">
        {/* App Title */}
        <h1 className="text-3xl font-bold text-white text-center">AI Documentation App</h1>

        {/* Input Section */}
        <section>
          <TextInput
            projects={projects}
            onUpdateProject={handleUpdateProject}
            onNewProject={handleNewProject}
            placeholder="Type or paste text here..."
          />
        </section>

        {/* Projects Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Your Projects</h2>
            <span className="text-gray-400">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdate={handleUpdateProject}
              />
            ))}
          </div>

          {/* Empty State */}
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
  );
}
