import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { listTaskFiles } from '../services/taskService';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Pagination from '../components/Pagination';

interface TaskFile {
  id: number;
  filename: string;
  title: string;
  description: string;
}

type SortKey = 'id' | 'filename' | 'title' | 'description';
type SortDirection = 'asc' | 'desc';

export default function TaskFilesPage() {
  const [taskFiles, setTaskFiles] = useState<TaskFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const files = await listTaskFiles();
        setTaskFiles(files);
      } catch (err) {
        console.error("Failed to load task files:", err);
        setError("Failed to load task files. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const filteredAndSortedFiles = useMemo(() => {
    const filtered = taskFiles
      .filter(file => 
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return filtered.sort((a, b) => {
      let valA: string | number = a[sortKey];
      let valB: string | number = b[sortKey];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [taskFiles, searchTerm, sortKey, sortDirection]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on filter/search/itemsPerPage change
  }, [searchTerm, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedFiles.length / itemsPerPage);
  const paginatedFiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedFiles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedFiles, currentPage, itemsPerPage]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const SortIcon = ({ for_key }: { for_key: SortKey }) => {
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
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500 dark:text-red-400">
        <ExclamationTriangleIcon className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Task Files</h2>
        <p className="text-center max-w-md">
          There was an issue fetching your task files. Please try again later.
          <br />
          Error: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-zinc-900 dark:text-white">Task Files</h1>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            A list of all the source files for your tasks.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="my-4">
        <input
          type="text"
          placeholder="Search files by name, title, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
        />
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-zinc-700 sm:rounded-lg">
              <table className="min-w-full divide-y divide-zinc-300 dark:divide-zinc-700">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    <th scope="col" className="py-2.5 pl-4 pr-3 text-left text-sm font-semibold text-zinc-900 dark:text-white sm:pl-6">
                      <button onClick={() => handleSort('id')} className="flex items-center hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        ID <SortIcon for_key="id" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      <button onClick={() => handleSort('filename')} className="flex items-center hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        Filename <SortIcon for_key="filename" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      <button onClick={() => handleSort('title')} className="flex items-center hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        Title <SortIcon for_key="title" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      <button onClick={() => handleSort('description')} className="flex items-center hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        Description <SortIcon for_key="description" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                  {paginatedFiles.length > 0 ? (
                    paginatedFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                        <Link to={`/tasks/${file.id}`} className="contents">
                          <td className="whitespace-nowrap py-2.5 pl-4 pr-3 text-sm font-medium text-zinc-900 dark:text-white sm:pl-6">
                            <div className="flex items-center">
                              <DocumentTextIcon className="h-4 w-4 text-zinc-400 mr-2" />
                              #{file.id}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-300 max-w-xs truncate">
                            {file.filename}
                          </td>
                          <td className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 max-w-xs truncate">
                            {file.title}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-300 max-w-md">
                            <div className="line-clamp-2">{file.description}</div>
                          </td>
                        </Link>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                        No task files found matching your criteria.
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
          <div className="flex items-center gap-x-2">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedFiles.length)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedFiles.length)}</span> of{' '}
              <span className="font-medium">{filteredAndSortedFiles.length}</span> results
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
            totalCount={filteredAndSortedFiles.length}
            pageSize={itemsPerPage}
            onPageChange={page => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}
