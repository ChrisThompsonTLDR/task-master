import { useState, useMemo } from 'react';
import { Task } from '../types/task';

type SortKey = 'id' | 'title' | 'priority' | 'status' | 'subtasks' | 'dependencies';
type SortDirection = 'asc' | 'desc';

const priorityMap = { high: 3, medium: 2, low: 1 };

export const useTaskSorter = (tasks: Task[]) => {
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      let valA, valB;

      if (sortKey === 'priority') {
        valA = priorityMap[a.priority];
        valB = priorityMap[b.priority];
      } else if (sortKey === 'subtasks') {
        valA = a.subtasks?.length || 0;
        valB = b.subtasks?.length || 0;
      } else if (sortKey === 'dependencies') {
        valA = a.dependencies.length;
        valB = b.dependencies.length;
      } else {
        valA = a[sortKey];
        valB = b[sortKey];
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return {
    sortKey,
    sortDirection,
    sortedTasks,
    handleSort,
  };
}; 