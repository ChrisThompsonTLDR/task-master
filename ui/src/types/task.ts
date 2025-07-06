export interface Subtask {
  id: number;
  title: string;
  description?: string;
  details?: string;
  dependencies: number[];
  status: 'pending' | 'in-progress' | 'done';
  testStrategy?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  details?: string;
  testStrategy?: string;
  priority: 'low' | 'medium' | 'high';
  dependencies: number[];
  status: 'pending' | 'in-progress' | 'done';
  subtasks?: Subtask[];
  relatedDocuments?: string[];
  tags?: string[];
}

export interface ComplexityAnalysis {
  taskId: number;
  taskTitle: string;
  complexityScore: number;
  recommendedSubtasks: number;
  expansionPrompt: string;
  reasoning: string;
}
