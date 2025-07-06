import { Task, ComplexityAnalysis, Subtask } from '../types/task';

interface AppState {
  currentTag: string;
}

// MCP API base URL (assume local MCP server for now)
const MCP_API_BASE_URL = 'http://localhost:8080/api';

// Helper to call MCP tools
async function callMcpTool(tool, params) {
  const response = await fetch(`${MCP_API_BASE_URL}/tools/${tool}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error(`MCP tool ${tool} failed: ${response.status}`);
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(`MCP tool ${tool} error: ${data.error || JSON.stringify(data)}`);
  }
  return data.data;
}

// Get all tasks (optionally by status/tag)
export async function getTasks({ status, withSubtasks, tag, projectRoot }) {
  return callMcpTool('get_tasks', {
    status,
    withSubtasks,
    tag,
    projectRoot: projectRoot || '/c:/Users/Chris/Herd/task-master',
  });
}

// Get a single task by ID
export async function getTask({ id, status, tag, projectRoot }) {
  return callMcpTool('get_task', {
    id: String(id),
    status,
    tag,
    projectRoot: projectRoot || '/c:/Users/Chris/Herd/task-master',
  });
}

// Get all tags
export async function getTags({ showMetadata, projectRoot }) {
  return callMcpTool('list_tags', {
    showMetadata,
    projectRoot: projectRoot || '/c:/Users/Chris/Herd/task-master',
  });
}

// Get complexity report
export async function getComplexityReport({ file, projectRoot }) {
  return callMcpTool('complexity_report', {
    file,
    projectRoot: projectRoot || '/c:/Users/Chris/Herd/task-master',
  });
}

// Get state (current tag, etc.)
export async function getState() {
  // Use MCP tool only
  return callMcpTool('get_state', {});
}

// Get markdown file (tasks, prd, ideas)
export async function getMarkdownFile({ type, filename }) {
  // Use MCP tool only
  return callMcpTool('get_markdown_file', { type, filename });
}

/**
 * Parses the 'details' string to extract numbered subtasks.
 * @param details The details string from a task.
 * @returns An array of Subtask objects.
 */
function parseSubtasksFromDetails(details: string): Subtask[] {
  const subtaskRegex = /-\s*\[\s*\]\s*([^\n]+)/g;
  let match;
  const subtasks: Subtask[] = [];
  let idCounter = 1;

  while ((match = subtaskRegex.exec(details)) !== null) {
    subtasks.push({
      id: idCounter++,
      title: match[1].trim(),
      status: 'pending',
      dependencies: []
      // Add other default subtask properties if needed
    });
  }
  return subtasks;
}

interface TaskFileInfo {
  id: number;
  filename: string;
  title: string;
  description: string;
}

/**
 * Simulates listing available task source files, now with titles and descriptions
 * pulled from the simulated content of each file.
 */
export async function listTaskFiles(): Promise<TaskFileInfo[]> {
  try {
    const { tasks } = await getTasks({ tag: 'all' }); // Load all tasks from all tags initially
    return tasks.map(task => ({
      id: task.id,
      filename: `task_${task.id}.md`,
      title: task.title,
      description: task.description || '',
    }));
  } catch (error) {
    console.error("Failed to list task files:", error);
    return [];
  }
}

// NOTE: The following file listing functions for PRDs and Ideas are placeholders.
// In a real application, you'd fetch this from your backend, which would read the directory structure.
export async function listPrdFiles(): Promise<TaskFileInfo[]> {
  console.warn("listPrdFiles is using placeholder data.");
  // This would be an API call in a real scenario
  return [
    { id: 1, filename: 'prd_1.md', title: 'PRD for Deterministic Simulation Core', description: 'Core requirements for the simulation engine.' },
    { id: 2, filename: 'prd_2.md', title: 'PRD for Task Management UI', description: 'Requirements for the user interface.' },
  ];
}

export async function listIdeaFiles(): Promise<TaskFileInfo[]> {
  console.warn("listIdeaFiles is using placeholder data.");
  // This would be an API call in a real scenario
  return [
    { id: 1, filename: 'idea_1.md', title: 'God AI Modifier Marketplace', description: 'Allow players to select AI modifiers for scenarios.' },
    { id: 2, filename: 'idea_2.md', title: 'Branching Timeline Visualizer', description: 'A UI to visualize and navigate different simulation branches.' },
  ];
}

// Task editing functionality removed per PRD. To re-enable, a new edit form, state handlers, and context/service functions will be needed here.

interface RawTask {
  id: number;
  title: string;
  description?: string;
  details?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'done';
  dependencies: number[];
  subtasks: Subtask[];
}

// Fetch Task Master config via MCP
export async function getConfig() {
  // Try MCP tool for models/config, fallback to direct fetch if needed
  try {
    const response = await callMcpTool('models', {});
    if (response && response.data && response.data.config) {
      return response.data.config;
    }
  } catch (e) {
    // fallback below
  }
  // Fallback: fetch config.json directly
  const res = await fetch('/data/config.json');
  if (!res.ok) throw new Error('Failed to load config');
  return await res.json();
}

// List research markdown files via MCP or backend
export async function getResearchFiles() {
  // Use MCP tool only
  return callMcpTool('list_research_files', {});
}

// Fetch a specific research markdown file
export async function getResearchFileContent(filename: string) {
  // Use MCP tool only
  return callMcpTool('get_research_file_content', { filename });
}

// Fetch a specific PRD markdown file
export async function getPRDFileContent(prdId: string) {
  // Use MCP tool only
  return callMcpTool('get_prd_file_content', { prdId });
}