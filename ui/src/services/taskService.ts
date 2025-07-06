import { Task, ComplexityAnalysis, Subtask } from '../types/task';

interface AppState {
  currentTag: string;
}

// REST API base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Get all tasks (optionally by status/tag)
export async function getTasks({ withSubtasks = false } = {}): Promise<{ tasks: Task[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks?withSubtasks=${withSubtasks}`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const data = await response.json();
    // Patch: Ensure every task has a tags property (for UI filtering)
    const tasks = (data.tasks || []).map((task: any) => ({ ...task, tags: Array.isArray(task.tags) ? task.tags : [] }));
    return { tasks };
  } catch (e) {
    throw new Error('Failed to fetch tasks');
  }
}

// Get a single task by ID
export async function getTask({ id, status, tag }) {
  const response = await fetch(`${API_BASE_URL}/tools/get_task/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: String(id), status, tag }),
  });
  if (!response.ok) throw new Error('Failed to fetch task');
  return await response.json();
}

// Get all tags
export async function getTags({ showMetadata }) {
  const response = await fetch(`${API_BASE_URL}/tools/list_tags/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ showMetadata }),
  });
  if (!response.ok) throw new Error('Failed to fetch tags');
  return await response.json();
}

// Get complexity report
export async function getComplexityReport({ file }) {
  const response = await fetch(`${API_BASE_URL}/tools/complexity_report/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file }),
  });
  if (!response.ok) throw new Error('Failed to fetch complexity report');
  return await response.json();
}

// Get state (current tag, etc.)
export async function getState() {
  const response = await fetch(`${API_BASE_URL}/tools/get_state/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error('Failed to fetch state');
  return await response.json();
}

// Get markdown file (tasks, prd, ideas)
export async function getMarkdownFile({ type, filename }) {
  const response = await fetch(`${API_BASE_URL}/tools/get_markdown_file/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, filename }),
  });
  if (!response.ok) throw new Error('Failed to fetch markdown file');
  return await response.json();
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

// Fetch Task Master config via REST API
export async function getConfig() {
  const response = await fetch(`${API_BASE_URL}/tools/models/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error('Failed to load config');
  return await response.json();
}

// List research markdown files via REST API
export async function getResearchFiles() {
  const response = await fetch(`${API_BASE_URL}/tools/list_research_files/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error('Failed to fetch research files');
  return await response.json();
}

// Fetch a specific research markdown file
export async function getResearchFileContent(filename: string) {
  const response = await fetch(`${API_BASE_URL}/tools/get_research_file_content/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  });
  if (!response.ok) throw new Error('Failed to fetch research file content');
  return await response.json();
}

// Fetch a specific PRD markdown file
export async function getPRDFileContent(prdId: string) {
  const response = await fetch(`${API_BASE_URL}/tools/get_prd_file_content/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prdId }),
  });
  if (!response.ok) throw new Error('Failed to fetch PRD file content');
  return await response.json();
}