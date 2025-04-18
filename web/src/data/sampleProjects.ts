import { Project } from '../types/Project';
import { v4 as uuidv4 } from 'uuid';
import { IMAGES } from '../constants/images';

export const sampleProjects: Project[] = [
  {
    id: uuidv4(),
    name: "Modern React Development Guide",
    description: "A comprehensive guide to building applications with React and TypeScript",
    createdAt: "2024-03-15T08:00:00Z",
    updatedAt: "2024-03-15T10:30:00Z",
    blocks: [
      {
        id: uuidv4(),
        type: "heading",
        content: "Modern React Development Guide",
        level: 1
      },
      {
        id: uuidv4(),
        type: "paragraph",
        content: "This guide covers essential concepts and best practices for building modern React applications.",
        formatting: {
          bold: true
        }
      },
      {
        id: uuidv4(),
        type: "subheading",
        content: "Setting Up Your Development Environment",
        level: 2
      },
      {
        id: uuidv4(),
        type: "bulleted_list",
        items: [
          "Install Node.js and npm",
          "Set up VS Code with recommended extensions",
          "Configure ESLint and Prettier",
          "Install React Developer Tools"
        ]
      },
      {
        id: uuidv4(),
        type: "code",
        content: `// Create a new Next.js project with TypeScript
npx create-next-app@latest my-app --typescript
cd my-app

// Install additional dependencies
npm install @tailwindcss/forms @heroicons/react
npm install -D @types/node`,
        codeLanguage: "bash",
        showLineNumbers: true,
        theme: "dark",
        copyButton: true
      },
      {
        id: uuidv4(),
        type: "quote",
        content: "Always write code as if the person who will maintain it is a violent psychopath who knows where you live.",
        formatting: {
          italic: true
        }
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Retirement Planning 101",
    description: "Essential guide to planning for retirement and financial independence",
    createdAt: "2024-03-14T09:00:00Z",
    updatedAt: "2024-03-15T11:20:00Z",
    blocks: [
      {
        id: uuidv4(),
        type: "heading",
        content: "Your Path to Financial Independence",
        level: 1
      },
      {
        id: uuidv4(),
        type: "image",
        imageUrl: IMAGES.COMPOUND_INTEREST,
        altText: "Compound interest growth chart",
        width: "600px",
        height: "400px",
        alignment: "center",
        caption: "The Power of Compound Interest Over 30 Years"
      },
      {
        id: uuidv4(),
        type: "numbered_list",
        items: [
          "Start saving early - Time is your biggest advantage",
          "Maximize your 401(k) contributions",
          "Diversify your investment portfolio",
          "Consider Roth IRA options",
          "Plan for healthcare costs"
        ]
      },
      {
        id: uuidv4(),
        type: "paragraph",
        content: "The 4% Rule: In retirement planning, the 4% rule suggests that you can safely withdraw 4% of your savings each year while maintaining your portfolio's value over a 30-year retirement period.",
        formatting: {
          bold: true,
          underline: true
        }
      },
      {
        id: uuidv4(),
        type: "quote",
        content: "The best time to start saving was yesterday. The second best time is today.",
        formatting: {
          italic: true
        }
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Startup Founder's Playbook",
    description: "Complete guide to launching and growing a successful startup",
    createdAt: "2024-03-13T15:00:00Z",
    updatedAt: "2024-03-15T09:45:00Z",
    blocks: [
      {
        id: uuidv4(),
        type: "heading",
        content: "From Idea to Launch: The Startup Journey",
        level: 1
      },
      {
        id: uuidv4(),
        type: "paragraph",
        content: "Building a successful startup requires more than just a great idea. This guide will walk you through the essential steps and considerations.",
        formatting: {
          bold: true
        }
      },
      {
        id: uuidv4(),
        type: "subheading",
        content: "Phase 1: Validation",
        level: 2
      },
      {
        id: uuidv4(),
        type: "bulleted_list",
        items: [
          "Identify your target market",
          "Conduct customer interviews",
          "Build a minimum viable product (MVP)",
          "Test your assumptions"
        ]
      },
      {
        id: uuidv4(),
        type: "code",
        content: `// Sample financial projection spreadsheet formula
function calculateRunway(
  currentCash: number,
  monthlyBurnRate: number
): number {
  return currentCash / monthlyBurnRate;
}

// Example usage
const runway = calculateRunway(500000, 50000);
console.log(\`Months of runway: \${runway}\`);`,
        codeLanguage: "typescript",
        showLineNumbers: true,
        theme: "dark",
        copyButton: true,
        collapsible: true
      },
      {
        id: uuidv4(),
        type: "quote",
        content: "Make something people want. All the other advice is secondary.",
        formatting: {
          italic: true,
          bold: true
        }
      },
      {
        id: uuidv4(),
        type: "subheading",
        content: "Funding Sources",
        level: 2
      },
      {
        id: uuidv4(),
        type: "bulleted_list",
        items: [
          "Bootstrapping",
          "Friends and Family",
          "Angel Investors",
          "Venture Capital",
          "Crowdfunding"
        ]
      }
    ]
  }
];

// Helper function to get a sample project by ID
export const getSampleProject = (id: string): Project | undefined => {
  return sampleProjects.find(project => project.id === id);
};

// Helper function to get all sample projects
export const getAllSampleProjects = (): Project[] => {
  return sampleProjects;
};