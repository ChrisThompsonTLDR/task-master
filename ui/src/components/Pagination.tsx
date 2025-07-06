import React from 'react';
import clsx from 'clsx';
import { usePagination, DOTS } from '../hooks/usePagination';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

interface PaginationProps {
  onPageChange: (page: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  className,
}) => {
  const { colorTheme } = useTheme();
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (currentPage === 0 || (paginationRange && paginationRange.length < 2)) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  const lastPage = paginationRange ? paginationRange[paginationRange.length - 1] : 1;

  // Dynamic color classes based on the selected theme
  const activeButtonClasses = {
    orange: 'bg-orange-600 text-white focus-visible:outline-orange-600',
    blue: 'bg-blue-600 text-white focus-visible:outline-blue-600',
    emerald: 'bg-emerald-600 text-white focus-visible:outline-emerald-600',
    purple: 'bg-purple-600 text-white focus-visible:outline-purple-600',
    rose: 'bg-rose-600 text-white focus-visible:outline-rose-600',
    amber: 'bg-amber-600 text-white focus-visible:outline-amber-600',
    cyan: 'bg-cyan-600 text-white focus-visible:outline-cyan-600',
    red: 'bg-red-600 text-white focus-visible:outline-red-600',
    indigo: 'bg-indigo-600 text-white focus-visible:outline-indigo-600',
    teal: 'bg-teal-600 text-white focus-visible:outline-teal-600',
    lime: 'bg-lime-600 text-white focus-visible:outline-lime-600',
    pink: 'bg-pink-600 text-white focus-visible:outline-pink-600',
    slate: 'bg-slate-600 text-white focus-visible:outline-slate-600',
    zinc: 'bg-zinc-600 text-white focus-visible:outline-zinc-600',
    stone: 'bg-stone-600 text-white focus-visible:outline-stone-600',
    neutral: 'bg-neutral-600 text-white focus-visible:outline-neutral-600'
  };

  return (
    <nav
      className={clsx('isolate inline-flex -space-x-px rounded-md shadow-sm', className)}
      aria-label="Pagination"
    >
      <button
        onClick={onPrevious}
        disabled={currentPage === 1}
        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">Previous</span>
        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
      </button>
      {paginationRange && paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <span
              key={index}
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={index}
            onClick={() => onPageChange(pageNumber as number)}
            className={clsx(
              'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20',
              {
                [activeButtonClasses[colorTheme]]: pageNumber === currentPage,
                'text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800':
                  pageNumber !== currentPage,
              }
            )}
            aria-current={pageNumber === currentPage ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        );
      })}
      <button
        onClick={onNext}
        disabled={currentPage === lastPage}
        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">Next</span>
        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pagination;
