import { Project, Block } from '@/types/supabase';

interface ProjectSelectionResponse {
  projectId: string;
  projectName: string;
  processedInput: string;
}

interface BlockModificationResponse {
  blocks: Block[];
}

// Simplified project type for the first API call
interface SimplifiedProject {
  id: string;
  name: string;
  description?: string | null;
}

type ProjectWithBlocks = Project & {
  blocks: Block[];
};

// Get API key from environment variable
const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
if (!API_KEY) {
  console.error('OpenAI API key is not set. Please set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.');
}

const API_URL = 'https://api.openai.com/v1/chat/completions';

const projectSelectionPrompt = `You are an intelligent documentation assistant. You will receive:
1. A list of documentation projects, each containing an id, name, and description
2. A new user input (text, webpage content, or image description)

Your task:
- For text/webpage content: First summarize and condense the content into a concise format
- For images: Extract key visual elements and context
- Analyze the processed input and decide which project it fits best
- Choose the most relevant project based on its name and description
- Do NOT try to write or modify content — just identify the appropriate project
- If the input contains [image#id] tags, these represent images that will be added to the project

Respond with a JSON object in this exact format:
{
  "projectId": "the ID of the selected project",
  "projectName": "the name of the selected project",
  "processedInput": "condensed/summarized version of the input"
}`;

const blockModificationPrompt = `You are an expert document assistant that works with structured documentation projects. Each project consists of an ordered list of "blocks" of content, each with a type such as: 'paragraph', 'heading', 'image', or 'quote'.

Each block may have optional formatting or extra data depending on the type:
- 'heading' blocks use level for depth (1 = H1, 2 = H2, etc.)
- 'image' blocks may include: imageUrl, altText, width, height, alignment (left, center, right), and caption
- 'paragraph' and 'quote' blocks may use simple formatting: bold, italic, underline

You will be given:
1. A list of existing blocks from a project
2. A new user input (text, webpage content, or image)

Your task:
- For text/webpage content:
  * Summarize and condense the content
  * Format it into appropriate blocks
  * Use headings to organize sections
  * Convert lists into proper bulleted or numbered lists
  * Extract and format any code snippets
  * Preserve important quotes
- For images:
  * If the input contains [image#id] tags, these represent images that will be added to the project
  * Create an image block for each [image#id] tag
  * Add a descriptive caption based on the context
  * Include relevant context in surrounding blocks
  * Keep the [image#id] tag in the content field to link the block to the actual image
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
      "type": "heading",
      "content": "Main Topic",
      "level": 1
    },
    {
      "id": "new-uuid-here-2",
      "type": "paragraph",
      "content": "Summarized content here"
    },
    {
      "id": "new-uuid-here-3",
      "type": "image",
      "content": "[image#abc123]",
      "metadata": {
        "caption": "A beautiful landscape photo",
        "alignment": "center"
      }
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
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content, parseError);
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    console.error('Error in selectProject:', error);
    throw error;
  }
};

export const modifyBlocks = async (
  project: ProjectWithBlocks,
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
      result.blocks.forEach((block: Block) => {
        if (existingIds.has(block.id)) {
          throw new Error('Duplicate block ID found in response');
        }
      });

      return result;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content, parseError);
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    console.error('Error in modifyBlocks:', error);
    throw error;
  }
};

// Helper function to convert full projects to simplified format
export const simplifyProjects = (projects: ProjectWithBlocks[]): SimplifiedProject[] => {
  return projects.map(project => ({
    id: project.id,
    name: project.name,
    description: project.description
  }));
};