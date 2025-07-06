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
      // Fetch tasks from REST API
      const tasksResult = await getTasks({ withSubtasks: true });
      setTasks(tasksResult.tasks || []);

      // Fetch tags from REST API
      const tagsResult = await getTags({});
      setAllTags(tagsResult.tags ? tagsResult.tags.map((t: any) => t.name) : []);

      // Fetch complexity report from REST API
      try {
        const complexityResult = await getComplexityReport({});
        setComplexityData(complexityResult.complexityAnalysis || []);
      } catch (e) {
        setComplexityData([]); // If not available, just clear
      }
      setError(null);
    } catch (e: unknown) {
      console.error('Error fetching tasks:', e);
      // Detect REST API not running (network error)
      if (e instanceof TypeError && e.message && e.message.match(/Failed to fetch/)) {
        setError('REST_API_NOT_RUNNING');
      } else {
        setError('Failed to fetch tasks');
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