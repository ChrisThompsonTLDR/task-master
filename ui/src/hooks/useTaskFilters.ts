import { useState, useMemo } from 'react';
import { Task } from '../types/task';

export const useTaskFilters = (tasks: Task[]) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Treat 'done' as 'completed' for filtering
        const normalizedStatus = task.status === 'done' ? 'completed' : task.status;
        return filterStatus === 'all' || normalizedStatus === filterStatus;
      })
      .filter(task => filterPriority === 'all' || task.priority === filterPriority)
      .filter(task => filterTag === 'all' || (Array.isArray(task.tags) && task.tags.includes(filterTag)))
      .filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tasks, filterStatus, filterPriority, filterTag, searchTerm]);

  return {
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterTag,
    setFilterTag,
    searchTerm,
    setSearchTerm,
    filteredTasks,
  };
}; 