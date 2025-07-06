import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Brain, FileText, Search } from 'lucide-react';
import Pagination from '../components/Pagination';
import MarkdownViewer from '../components/MarkdownViewer';
import { getResearchFiles, getResearchFileContent } from '../services/taskService';

interface ResearchFile {
  filename: string;
  title: string;
  query: string;
  date: string;
  time: string;
  timestamp: string;
  exchanges: number;
  description: string;
  content?: string;
}

type SortKey = 'filename' | 'title' | 'date' | 'exchanges';
type SortDirection = 'asc' | 'desc';

export default function ResearchPage() {
  const [researchFiles, setResearchFiles] = useState<ResearchFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedFile, setSelectedFile] = useState<ResearchFile | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        // Use MCP-backed function to get file list
        const fileList = await getResearchFiles();
        const filePromises = fileList.map(async (filename: string) => {
          const content = await getResearchFileContent(filename);
          // Parse the markdown frontmatter and content
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
          if (!frontmatterMatch) {
            console.warn(`Invalid markdown format - missing frontmatter in ${filename}`);
            return null;
          }

          const frontmatter = frontmatterMatch[1];
          const markdownContent = frontmatterMatch[2];

          // Parse frontmatter
          const metadata: { [key: string]: string } = {};
          frontmatter.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
              const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
              metadata[key.trim()] = value;
            }
          });

          // Extract description from the content (first paragraph after title)
          const lines = markdownContent.split('\n').filter(line => line.trim());
          let description = 'Research session exploring various topics and questions.';
          
          // Find the first substantial paragraph
          for (const line of lines) {
            if (line.length > 50 && !line.startsWith('#') && !line.startsWith('**')) {
              description = line.substring(0, 200) + (line.length > 200 ? '...' : '');
              break;
            }
          }

          // Extract filename from path
          const file: ResearchFile = {
            filename,
            title: metadata.title || 'Research Session',
            query: metadata.query || 'General Research',
            date: metadata.date || '',
            time: metadata.time || '',
            timestamp: metadata.timestamp || '',
            exchanges: parseInt(metadata.exchanges) || 0,
            description,
            content: markdownContent
          };

          return file;
        });
        const fileResults = await Promise.all(filePromises);
        setResearchFiles(fileResults.filter(Boolean));
      } catch (err) {
        console.error("Failed to load research files:", err);
        setError("Failed to load research files. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const filteredAndSortedFiles = useMemo(() => {
    const filtered = researchFiles.filter(file => 
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let valA: string | number = a[sortKey];
      let valB: string | number = b[sortKey];

      if (sortKey === 'date') {
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
      } else if (sortKey === 'exchanges') {
        valA = a.exchanges;
        valB = b.exchanges;
      } else {
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [researchFiles, searchTerm, sortKey, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
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

  const handleFileClick = async (file: ResearchFile) => {
    if (selectedFile?.filename === file.filename) {
      setSelectedFile(null);
      return;
    }

    setLoadingContent(true);
    setSelectedFile(file);
    setLoadingContent(false);
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
        <h2 className="text-xl font-semibold mb-2">Error Loading Research Files</h2>
        <p className="text-center max-w-md">
          There was an issue fetching your research files. Please try again later.
          <br />
          Error: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="flex items-center space-x-3 mb-2">
            <BeakerIcon className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold leading-6 text-zinc-900 dark:text-white">Research</h1>
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Research sessions and documentation from your project investigations.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="my-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search research files by title, query, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 rounded-lg border-0 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      {/* Research Files Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-zinc-700 sm:rounded-lg">
              <table className="min-w-full divide-y divide-zinc-300 dark:divide-zinc-700">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-zinc-900 dark:text-white sm:pl-6">
                      <button onClick={() => handleSort('title')} className="flex items-center hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        <Brain className="h-4 w-4 mr-2" />
                        Title <SortIcon for_key="title" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      <button onClick={() => handleSort('filename')} className="flex items-center hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        <FileText className="h-4 w-4 mr-2" />
                        Query <SortIcon for_key="filename" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      <button onClick={() => handleSort('date')} className="flex items-center hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Date <SortIcon for_key="date" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      <button onClick={() => handleSort('exchanges')} className="flex items-center hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                        Exchanges <SortIcon for_key="exchanges" />
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                  {paginatedFiles.length > 0 ? (
                    paginatedFiles.map((file) => (
                      <tr 
                        key={file.filename} 
                        className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${
                          selectedFile?.filename === file.filename ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                        }`}
                        onClick={() => handleFileClick(file)}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-zinc-900 dark:text-white sm:pl-6">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-5 w-5 text-zinc-400 mr-3" />
                            <div>
                              <div className="font-medium">{file.title}</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">{file.filename}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-zinc-500 dark:text-zinc-300">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                            {file.query}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-zinc-500 dark:text-zinc-300">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-zinc-400" />
                            <div>
                              <div>{file.date}</div>
                              <div className="text-xs text-zinc-400 flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {file.time}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-zinc-500 dark:text-zinc-300 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                            {file.exchanges}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-zinc-500 dark:text-zinc-300 max-w-md">
                          <div className="line-clamp-2">{file.description}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                        No research files found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Content Viewer */}
      {selectedFile && (
        <div className="mt-8 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-6 w-6 text-orange-500" />
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {selectedFile.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Research session from {selectedFile.date} at {selectedFile.time}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {loadingContent ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : selectedFile.content ? (
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <MarkdownViewer content={selectedFile.content} />
              </div>
            ) : (
              <p className="text-zinc-500 dark:text-zinc-400">No content available for this file.</p>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 sm:px-6 rounded-b-lg shadow-sm mt-8">
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
