import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3 mt-6">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2 mt-4">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-zinc-700 dark:text-zinc-300 mb-4 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-zinc-700 dark:text-zinc-300">
              {children}
            </li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-4 rounded-lg overflow-x-auto mb-4">
                <code className="text-sm font-mono">{children}</code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-orange-500 pl-4 italic text-zinc-600 dark:text-zinc-400 mb-4">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
              {children}
            </tbody>
          ),
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
