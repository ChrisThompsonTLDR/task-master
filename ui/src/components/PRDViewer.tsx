import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import MarkdownViewer from './MarkdownViewer';
import { getPRDFileContent } from '../services/taskService';

interface PRDViewerProps {
  prdId: string;
  title?: string;
}

const PRDViewer: React.FC<PRDViewerProps> = ({ prdId, title }) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPRD = async () => {
      try {
        setLoading(true);
        const text = await getPRDFileContent(prdId);
        setContent(text);
      } catch (err) {
        console.error(`Failed to load PRD ${prdId}:`, err);
        setError(`Failed to load PRD document. ${err instanceof Error ? err.message : ''}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPRD();
  }, [prdId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error Loading PRD</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{error || 'Unable to load the PRD document.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="h-6 w-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {title || `PRD-${prdId.padStart(4, '0')}`}
          </h3>
        </div>
      </div>
      <div className="px-6 py-4">
        <MarkdownViewer content={content} />
      </div>
    </div>
  );
};

export default PRDViewer;
