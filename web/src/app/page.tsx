'use client';

import TextInput from "../components/TextInput";
import ProjectCard from "../components/ProjectCard";
import { getAllSampleProjects } from "../data/sampleProjects";

export default function Home() {
  const handleSubmit = (text: string) => {
    console.log("Submitted text:", text);
    // Handle the text submission here
  };

  const handleNewProject = () => {
    console.log("Creating new project");
    // Handle new project creation here
  };

  const handleEditProject = (projectId: string) => {
    console.log("Editing project:", projectId);
    // Handle project editing here
  };

  const projects = getAllSampleProjects();

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <main className="max-w-4xl mx-auto space-y-12">
        {/* App Title */}
        <h1 className="text-3xl font-bold text-white text-center">AI Documentation App</h1>

        {/* Input Section */}
        <section>
          <TextInput
            onSubmit={handleSubmit}
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
                onEdit={() => handleEditProject(project.id)}
              />
            ))}
          </div>

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-12 bg-gray-900 rounded-lg">
              <p className="text-gray-400">
                No projects yet. Create one by clicking the "New Project" button above.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
