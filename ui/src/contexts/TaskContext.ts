import { createContext, useContext } from 'react';
import { Task, Complexity } from '../types/task';

export interface TaskContextType {
  tasks: Task[];
  allTags: string[];
  complexityData: Complexity[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => void;
  updateTask: (task: Task) => void;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTaskContext must be used within a TaskContextProvider');
  return context;
}