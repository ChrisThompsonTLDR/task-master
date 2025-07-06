import React, { useState, useEffect } from 'react';
import { CogIcon, ServerIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Settings, Database, Cloud } from 'lucide-react';
import { Card } from '../components/Card';
import ConfigViewer from '../components/ConfigViewer';
import { TabbedContent } from '../components/TabbedContent';
import { getConfig, getState } from '../services/taskService';

export default function ConfigExplorerPage() {
  const [activeConfig, setActiveConfig] = useState<string | null>('main');
  const [projectName, setProjectName] = useState<string>('TaskMaster Core');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getConfig();
        if (config.global && config.global.projectName) {
          setProjectName(config.global.projectName);
        }
      } catch (error) {
        console.error('Failed to load project name from config:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const configFiles = [
    { id: 'main', name: 'Main Configuration', path: '/data/config.json', icon: Settings },
    { id: 'state', name: 'Application State', path: '/data/state.json', icon: Database },
  ];

  const handleConfigClick = (configId: string) => {
    setActiveConfig(configId === activeConfig ? null : configId);
  };

  // Create tabs for the config viewer
  const configTabs = [
    {
      id: 'models',
      label: 'Models',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Model configurations define the AI models used by the system for various purposes.
          </p>
          <ConfigViewer path="/data/config.json" title="Model Configuration" />
        </div>
      ),
    },
    {
      id: 'global',
      label: 'Global Settings',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Global settings control system-wide behavior and defaults.
          </p>
          <ConfigViewer path="/data/config.json" title="Global Configuration" />
        </div>
      ),
    },
    {
      id: 'state',
      label: 'Application State',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Application state represents the current runtime state of the system.
          </p>
          <ConfigViewer path="/data/state.json" title="Application State" />
        </div>
      ),
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="flex items-center space-x-3 mb-2">
            <CogIcon className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Configuration Explorer</h1>
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Explore and understand the system's configuration and settings.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Config navigation */}
        <div className="lg:col-span-1">
          <Card title="Configuration Files" icon={<Settings className="h-4 w-4" />}>
            <div className="space-y-2">
              {configFiles.map(config => (
                <button
                  key={config.id}
                  onClick={() => handleConfigClick(config.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeConfig === config.id
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <config.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{config.name}</span>
                </button>
              ))}
            </div>
          </Card>

          <div className="mt-6">
            <Card title="System Information" icon={<ServerIcon className="h-4 w-4" />}>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Project Name</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                    {loading ? 'Loading...' : projectName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Environment</p>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">Development</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Current Tag</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      master
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right content - Config details */}
        <div className="lg:col-span-3">
          {activeConfig ? (
            <div className="space-y-6">
              <TabbedContent tabs={configTabs} initialTabId="models" />
              
              <Card title="Configuration Details" icon={<GlobeAltIcon className="h-4 w-4" />}>
                <div className="space-y-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    The configuration system supports multiple environments and can be extended with custom settings.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-zinc-900 dark:text-white mb-2">Model Configuration</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Defines AI models used for various tasks, including parameters like temperature and token limits.
                      </p>
                    </div>
                    
                    <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-zinc-900 dark:text-white mb-2">Global Settings</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Controls system-wide behavior, including logging, default values, and API endpoints.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Cloud className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">Configuration Best Practices</h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Use environment variables for sensitive values</li>
                            <li>Keep configuration files version-controlled</li>
                            <li>Document all configuration options</li>
                            <li>Use feature flags for experimental features</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-8 text-center">
              <CogIcon className="mx-auto h-12 w-12 text-zinc-400" />
              <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">Select a Configuration</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Choose a configuration file from the sidebar to view its details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
