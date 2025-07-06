import { createContext } from 'react';
import { Task, Complexity } from '../types/task';

interface TaskContextType {
  tasks: Task[];
  complexityData: Complexity[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => void;
  updateTask: (updatedTask: Task) => void;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);
