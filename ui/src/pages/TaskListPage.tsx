import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTaskContext } from '../hooks/useTaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useTaskSorter } from '../hooks/useTaskSorter';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon // Added for error display
} from '@heroicons/react/24/outline';
import Pagination from '../components/Pagination';
import { getState } from '../services/taskService';

const statusIcons = {
  done: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
  'in-progress': <ClockIcon className="h-5 w-5 text-blue-500" />,
  pending: <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />,
};

const priorityMap = { high: 3, medium: 2, low: 1 };

export default function TaskListPage() {
  const { tasks, allTags, loading, error } = useTaskContext(); // Destructure error
  const { colorTheme } = useTheme();
  
  const {
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterTag,
    setFilterTag,
    searchTerm,
    setSearchTerm,
    filteredTasks,
  } = useTaskFilters(tasks);

  const {
    sortKey,
    sortDirection,
    sortedTasks,
    handleSort,
  } = useTaskSorter(filteredTasks);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // State for items per page
  const navigate = useNavigate();

  // Dynamic button classes based on the selected theme
  const sortButtonClasses = {
    orange: 'hover:text-orange-600 dark:hover:text-orange-400',
    blue: 'hover:text-blue-600 dark:hover:text-blue-400',
    emerald: 'hover:text-emerald-600 dark:hover:text-emerald-400',
    purple: 'hover:text-purple-600 dark:hover:text-purple-400',
    rose: 'hover:text-rose-600 dark:hover:text-rose-400',
    amber: 'hover:text-amber-600 dark:hover:text-amber-400',
    cyan: 'hover:text-cyan-600 dark:hover:text-cyan-400',
    red: 'hover:text-red-600 dark:hover:text-red-400',
    indigo: 'hover:text-indigo-600 dark:hover:text-indigo-400',
    teal: 'hover:text-teal-600 dark:hover:text-teal-400',
    lime: 'hover:text-lime-600 dark:hover:text-lime-400',
    pink: 'hover:text-pink-600 dark:hover:text-pink-400',
    slate: 'hover:text-slate-600 dark:hover:text-slate-400',
    zinc: 'hover:text-zinc-600 dark:hover:text-zinc-400',
    stone: 'hover:text-stone-600 dark:hover:text-stone-400',
    neutral: 'hover:text-neutral-600 dark:hover:text-neutral-400'
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterPriority, filterTag, searchTerm, itemsPerPage]);

  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTasks, currentPage, itemsPerPage]);

  // Remove debug logs
  // Remove debug fallback message
  if (paginatedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
        <h2 className="text-xl font-semibold mb-2">No tasks found</h2>
        <p className="text-center max-w-md">
          There are no tasks to display. Try adjusting your filters or add a new task.
        </p>
      </div>
    );
  }

  const SortIcon = ({ for_key }: { for_key: string }) => {
    if (sortKey !== for_key) return null;
    return sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    if (error === 'REST_API_NOT_RUNNING') {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-red-500 dark:text-red-400">
          <ExclamationTriangleIcon className="h-16 w-16 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Task Master REST API Not Running</h2>
          <p className="text-center max-w-md">
            The Task Master REST API server is not running or could not be reached.<br />
            Please start the REST API server in your project root:<br />
            <code className="bg-zinc-900 text-white px-2 py-1 rounded mt-2 block">node rest-server.js</code>
            <br />
            Then refresh this page.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500 dark:text-red-400">
        <ExclamationTriangleIcon className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-center max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-zinc-900 dark:text-white">Tasks</h1>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            A list of all the tasks in your project.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="my-4 grid grid-cols-1 md:grid-cols-4 gap-4"> {/* Changed to md:grid-cols-4 */}
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
        >
          <option value="all">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag} className="capitalize">{tag}</option>
          ))}
        </select>
        {/* Removed itemsPerPage from here */}
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-zinc-700 sm:rounded-lg">
              <table className="min-w-full divide-y divide-zinc-300 dark:divide-zinc-700">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    <th scope="col" className="py-2.5 pl-4 pr-3 text-left text-sm font-semibold text-zinc-900 dark:text-white sm:pl-6">
                      <button onClick={() => handleSort('id')} className={`flex items-center ${sortButtonClasses[colorTheme]} transition-colors`}>
                        ID <SortIcon for_key="id" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      <button onClick={() => handleSort('title')} className={`flex items-center ${sortButtonClasses[colorTheme]} transition-colors`}>
                        Title <SortIcon for_key="title" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      <button onClick={() => handleSort('status')} className={`flex items-center ${sortButtonClasses[colorTheme]} transition-colors`}>
                        Status <SortIcon for_key="status" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      <button onClick={() => handleSort('priority')} className={`flex items-center ${sortButtonClasses[colorTheme]} transition-colors`}>
                        Priority <SortIcon for_key="priority" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Tags
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      <button onClick={() => handleSort('subtasks')} className={`flex items-center ${sortButtonClasses[colorTheme]} transition-colors`}>
                        Subtasks <SortIcon for_key="subtasks" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      <button onClick={() => handleSort('dependencies')} className={`flex items-center ${sortButtonClasses[colorTheme]} transition-colors`}>
                        Dependencies <SortIcon for_key="dependencies" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                  {paginatedTasks.length > 0 ? (
                    paginatedTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/tasks/${task.id}`); }}
                        role="button"
                        aria-label={`View details for task ${task.id}`}
                      >
                        <td className="whitespace-nowrap py-2.5 pl-4 pr-3 text-sm font-medium text-zinc-900 dark:text-white sm:pl-6">
                          #{task.id}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-300 max-w-sm">
                          <div className="truncate">{task.title}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-300">
                          <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-0.5 text-xs font-medium capitalize">
                            {statusIcons[task.status]}
                            <span className="hidden sm:inline">{task.status.replace('-', ' ')}</span>
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-300">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            task.priority === 'high'
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                              : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-300">
                          <div className="flex flex-wrap gap-1">
                            {task.tags?.slice(0, 2).map(tag => (
                              <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 capitalize">
                                {tag}
                              </span>
                            ))}
                            {task.tags && task.tags.length > 2 && (
                              <span className="text-xs text-zinc-400">+{task.tags.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-300 text-center">
                          {task.subtasks?.length || 0}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-300 text-center">
                          {task.dependencies.length}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                        No tasks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 sm:px-6 rounded-b-lg shadow-sm">
          <div className="flex items-center gap-x-2"> {/* Added flex container for count and text */}
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, sortedTasks.length)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedTasks.length)}</span> of{' '}
              <span className="font-medium">{sortedTasks.length}</span> results
            </p>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          <Pagination
            currentPage={currentPage}
            totalCount={sortedTasks.length}
            pageSize={itemsPerPage}
            onPageChange={page => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}
