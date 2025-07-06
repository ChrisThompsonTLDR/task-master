import React, { useState, useEffect } from 'react';
import { CogIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { getConfig, getState } from '../services/taskService';

interface ConfigViewerProps {
  path: string;
  title?: string;
}

const ConfigViewer: React.FC<ConfigViewerProps> = ({ path, title }) => {
  const [config, setConfig] = useState<Record<string, unknown> | Array<unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        let data;
        if (path.includes('state')) {
          data = await getState();
        } else {
          data = await getConfig();
        }
        setConfig(data);
      } catch (err) {
        console.error(`Failed to load config from ${path}:`, err);
        setError(`Failed to load configuration. ${err instanceof Error ? err.message : ''}`);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [path]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error Loading Configuration</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{error || 'Unable to load the configuration file.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-zinc-400 dark:text-zinc-500">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return (
        <span className={value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
          {value.toString()}
        </span>
      );
    }
    
    if (typeof value === 'number') {
      return <span className="text-purple-600 dark:text-purple-400">{value}</span>;
    }
    
    if (typeof value === 'string') {
      if (value.startsWith('http')) {
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {value}
          </a>
        );
      }
      return <span className="text-orange-600 dark:text-orange-400">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      return (
        <div className="pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
          {value.map((item, i) => (
            <div key={i} className="mb-1">
              {renderValue(item)}
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <div className="pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="mb-2">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{key}:</span>{' '}
              {renderValue(val)}
            </div>
          ))}
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center space-x-3">
          <CogIcon className="h-6 w-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {title || 'Configuration'}
          </h3>
        </div>
      </div>
      <div className="px-6 py-4 overflow-auto">
        <div className="font-mono text-sm">
          {renderValue(config)}
        </div>
      </div>
    </div>
  );
};

export default ConfigViewer;
