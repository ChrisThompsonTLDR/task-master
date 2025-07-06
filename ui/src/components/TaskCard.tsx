import React from 'react';
import { Link } from 'react-router-dom';
import { Task, ComplexityAnalysis } from '../types/task';
import { ArrowRightIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { statusIcons, priorityClasses } from '../constants/ui.tsx';
import { useTheme } from '../contexts/ThemeContext';

interface TaskCardProps {
  task: Task;
  complexity?: ComplexityAnalysis;
  showDescription?: boolean;
  showComplexity?: boolean;
  showRecommendedSubtasks?: boolean;
  showStatus?: boolean;
  showPriority?: boolean;
  className?: string; // Allows overriding outer div classes
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  complexity,
  showDescription = true,
  showComplexity = true,
  showRecommendedSubtasks = true,
  showStatus = true,
  showPriority = true,
  className = ''
}) => {
  const { colorTheme } = useTheme();
  
  // Dynamic color classes based on the selected theme
  const hoverBorderClasses = {
    orange: 'hover:border-orange-300 dark:hover:border-orange-600',
    blue: 'hover:border-blue-300 dark:hover:border-blue-600',
    emerald: 'hover:border-emerald-300 dark:hover:border-emerald-600',
    purple: 'hover:border-purple-300 dark:hover:border-purple-600',
    rose: 'hover:border-rose-300 dark:hover:border-rose-600',
    amber: 'hover:border-amber-300 dark:hover:border-amber-600',
    cyan: 'hover:border-cyan-300 dark:hover:border-cyan-600',
    red: 'hover:border-red-300 dark:hover:border-red-600',
    indigo: 'hover:border-indigo-300 dark:hover:border-indigo-600',
    teal: 'hover:border-teal-300 dark:hover:border-teal-600',
    lime: 'hover:border-lime-300 dark:hover:border-lime-600',
    pink: 'hover:border-pink-300 dark:hover:border-pink-600',
    slate: 'hover:border-slate-300 dark:hover:border-slate-600',
    zinc: 'hover:border-zinc-300 dark:hover:border-zinc-600',
    stone: 'hover:border-stone-300 dark:hover:border-stone-600',
    neutral: 'hover:border-neutral-300 dark:hover:border-neutral-600'
  };
  
  const hoverTextClasses = {
    orange: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
    blue: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    emerald: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    purple: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    rose: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
    amber: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    cyan: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
    red: 'group-hover:text-red-600 dark:group-hover:text-red-400',
    indigo: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    teal: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
    lime: 'group-hover:text-lime-600 dark:group-hover:text-lime-400',
    pink: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
    slate: 'group-hover:text-slate-600 dark:group-hover:text-slate-400',
    zinc: 'group-hover:text-zinc-600 dark:group-hover:text-zinc-400',
    stone: 'group-hover:text-stone-600 dark:group-hover:text-stone-400',
    neutral: 'group-hover:text-neutral-600 dark:group-hover:text-neutral-400'
  };
  
  const iconClasses = {
    orange: 'group-hover:text-orange-500 dark:group-hover:text-orange-400',
    blue: 'group-hover:text-blue-500 dark:group-hover:text-blue-400',
    emerald: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
    purple: 'group-hover:text-purple-500 dark:group-hover:text-purple-400',
    rose: 'group-hover:text-rose-500 dark:group-hover:text-rose-400',
    amber: 'group-hover:text-amber-500 dark:group-hover:text-amber-400',
    cyan: 'group-hover:text-cyan-500 dark:group-hover:text-cyan-400',
    red: 'group-hover:text-red-500 dark:group-hover:text-red-400',
    indigo: 'group-hover:text-indigo-500 dark:group-hover:text-indigo-400',
    teal: 'group-hover:text-teal-500 dark:group-hover:text-teal-400',
    lime: 'group-hover:text-lime-500 dark:group-hover:text-lime-400',
    pink: 'group-hover:text-pink-500 dark:group-hover:text-pink-400',
    slate: 'group-hover:text-slate-500 dark:group-hover:text-slate-400',
    zinc: 'group-hover:text-zinc-500 dark:group-hover:text-zinc-400',
    stone: 'group-hover:text-stone-500 dark:group-hover:text-stone-400',
    neutral: 'group-hover:text-neutral-500 dark:group-hover:text-neutral-400'
  };

  return (
    <Link
      to={`/tasks/${task.id}`}
      className={`block p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 ${hoverBorderClasses[colorTheme]} transition-colors group ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* This div now uses justify-between to push title left and tags right */}
          <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
            <h3 className={`text-sm font-medium text-zinc-900 dark:text-white ${hoverTextClasses[colorTheme]} truncate flex-shrink-0`}>
              #{task.id} {task.title}
            </h3>
            {/* New div to group status, priority, and complexity tags */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
              {showPriority && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClasses[task.priority]}`}>
                  {task.priority}
                </span>
              )}
              {showStatus && (
                <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium capitalize text-zinc-700 dark:text-zinc-300">
                  {statusIcons[task.status]}
                  <span className="hidden sm:inline">{task.status.replace('-', ' ')}</span>
                </span>
              )}
              {showComplexity && complexity && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300">
                  <ChartBarIcon className="w-3 h-3 mr-1" />
                  {complexity.complexityScore}/10
                </span>
              )}
            </div>
          </div>
          {showDescription && task.description && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {task.description}
            </p>
          )}
          {showRecommendedSubtasks && complexity && complexity.recommendedSubtasks > 0 && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
              Recommended subtasks: {complexity.recommendedSubtasks}
            </p>
          )}
        </div>
        <ArrowRightIcon className={`h-5 w-5 text-zinc-400 dark:text-zinc-600 ${iconClasses[colorTheme]} transition-colors ml-4 flex-shrink-0`} />
      </div>
    </Link>
  );
};
