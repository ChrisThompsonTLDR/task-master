import React from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export const statusIcons: { [key: string]: JSX.Element } = {
  completed: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
  'in-progress': <ClockIcon className="h-5 w-5 text-orange-500" />,
  pending: <ExclamationCircleIcon className="h-5 w-5 text-zinc-500" />,
};

export const priorityClasses: { [key: string]: string } = {
  high: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400',
  medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400',
  low: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400',
};
