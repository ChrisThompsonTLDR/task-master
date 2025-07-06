import React, { useState, useEffect, ReactNode } from 'react';
import { Task, Complexity } from '../types/task';
import { TaskContext } from './TaskContext';
import { getTasks, getTags, getComplexityReport } from '../services/taskService';

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [complexityData, setComplexityData] = useState<Complexity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Fetch tasks from MCP
      const tasksResult = await getTasks({ withSubtasks: true });
      setTasks(tasksResult.tasks || []);

      // Fetch tags from MCP
      const tagsResult = await getTags({});
      setAllTags(tagsResult.tags ? tagsResult.tags.map((t: any) => t.name) : []);

      // Fetch complexity report from MCP
      try {
        const complexityResult = await getComplexityReport({});
        setComplexityData(complexityResult.complexityAnalysis || []);
      } catch (e) {
        setComplexityData([]); // If not available, just clear
      }
      setError(null);
    } catch (e: unknown) {
      console.error("Failed to fetch tasks:", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, allTags, complexityData, loading, error, fetchTasks, updateTask }}>
      {children}
    </TaskContext.Provider>
  );
}; 