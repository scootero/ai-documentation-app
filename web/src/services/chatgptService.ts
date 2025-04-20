import { Project } from '@/types/Project';

interface ProjectSelectionResponse {
  projectId: string;
  projectName: string;
}

interface BlockModificationResponse {
  blocks: any[]; // Using any[] temporarily since DocBlock is not exported
}

// Simplified project type for the first API call
interface SimplifiedProject {
  id: string;
  name: string;
  description?: string;
}

// Get API key from environment variable
const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
if (!API_KEY) {
  console.error('OpenAI API key is not set. Please set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.');
}

const API_URL = 'https://api.openai.com/v1/chat/completions';

const projectSelectionPrompt = `You are an intelligent documentation assistant. You will receive:
1. A list of documentation projects, each containing an id, name, and description
2. A new user input (either text or an image description)

Your task:
- Analyze the input and decide which project it fits best.
- Choose the most relevant project based on its name and description.
- Do NOT try to write or modify content — just identify the appropriate project.

Respond with a JSON object in this exact format:
{
  "projectId": "the ID of the selected project",
  "projectName": "the name of the selected project"
}`;

const blockModificationPrompt = `You are an expert document assistant that works with structured documentation projects. Each project consists of an ordered list of "blocks" of content, each with a type such as: 'paragraph', 'heading', 'image', or 'quote'.

Each block may have optional formatting or extra data depending on the type:
- 'heading' blocks use level for depth (1 = H1, 2 = H2, etc.)
- 'image' blocks may include: imageUrl, altText, width, height, alignment (left, center, right), and caption
- 'paragraph' and 'quote' blocks may use simple formatting: bold, italic, underline

You will be given:
1. A list of existing blocks from a project
2. A new user input (text and/or image)

Your task:
- Analyze the new input and determine how it should be added to the project
- Create ONLY NEW blocks for the new content
- Do NOT include or modify any existing blocks
- Each new block should have a unique ID (use a UUID format)
- Return ONLY a JSON object with a "blocks" array containing the new blocks
- The response should be a valid JSON object that starts with { and ends with }
- Do NOT include any additional text or markdown formatting

Example response format:
{
  "blocks": [
    {
      "id": "new-uuid-here",
      "type": "paragraph",
      "content": "New content here"
    }
  ]
}`;

export const selectProject = async (
  projects: SimplifiedProject[],
  userInput: string
): Promise<ProjectSelectionResponse> => {
  if (!API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: projectSelectionPrompt
          },
          {
            role: 'user',
            content: JSON.stringify({
              projects,
              userInput
            })
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`Failed to select project: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    console.error('Error in selectProject:', error);
    throw error;
  }
};

export const modifyBlocks = async (
  project: Project,
  userInput: string
): Promise<BlockModificationResponse> => {
  if (!API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: blockModificationPrompt
          },
          {
            role: 'user',
            content: JSON.stringify({
              project,
              userInput
            })
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`Failed to modify blocks: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      const result = JSON.parse(jsonMatch[0]);

      // Validate that we only have new blocks
      if (!result.blocks || !Array.isArray(result.blocks)) {
        throw new Error('Invalid blocks format in response');
      }

      // Ensure each block has a unique ID
      const existingIds = new Set(project.blocks.map(block => block.id));
      result.blocks.forEach((block: any) => {
        if (existingIds.has(block.id)) {
          throw new Error('Duplicate block ID found in response');
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    console.error('Error in modifyBlocks:', error);
    throw error;
  }
};

// Helper function to convert full projects to simplified format
export const simplifyProjects = (projects: Project[]): SimplifiedProject[] => {
  return projects.map(project => ({
    id: project.id,
    name: project.name,
    description: project.description
  }));
};