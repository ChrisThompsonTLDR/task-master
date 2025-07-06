import React, { useState, useEffect } from 'react';
import { 
  CogIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CpuChipIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Settings, Cloud } from 'lucide-react';
import { Card } from '../components/Card';
import { Save } from 'lucide-react';
import { getConfig } from '../services/taskService';

interface ModelConfig {
  provider: string;
  modelId: string;
  maxTokens: number;
  temperature: number;
}

interface GlobalConfig {
  logLevel: string;
  debug: boolean;
  defaultSubtasks: number;
  defaultPriority: string;
  projectName: string;
  ollamaBaseURL: string;
  bedrockBaseURL: string;
  defaultTag: string;
  azureOpenaiBaseURL: string;
  userId: string;
}

interface ConfigData {
  models: {
    main: ModelConfig;
    research: ModelConfig;
    fallback: ModelConfig;
  };
  global: GlobalConfig;
}

const ConfigCard = ({ 
  title, 
  children, 
  icon: Icon, 
  status = 'active' 
}: { 
  title: string; 
  children: React.ReactNode; 
  icon: React.ComponentType<{ className?: string }>; 
  status?: 'active' | 'warning' | 'error' | 'info';
}) => {
  const statusColors = {
    active: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10',
    warning: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10',
    error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10',
    info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
  };

  const iconColors = {
    active: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400'
  };

  return (
    <div className={`bg-white dark:bg-zinc-800 rounded-xl border-2 ${statusColors[status]} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-white dark:bg-zinc-900 ${iconColors[status]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

const ModelConfigCard = ({ title, model, type }: { title: string; model: ModelConfig; type: 'main' | 'research' | 'fallback' }) => {
  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return GlobeAltIcon;
      case 'openai':
        return Cloud;
      default:
        return CpuChipIcon;
    }
  };

  const getStatusFromType = (type: string) => {
    switch (type) {
      case 'main':
        return 'active';
      case 'research':
        return 'info';
      case 'fallback':
        return 'warning';
      default:
        return 'info';
    }
  };

  const ProviderIcon = getProviderIcon(model.provider);

  return (
    <ConfigCard title={title} icon={ProviderIcon} status={getStatusFromType(type)}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Provider</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-white font-mono bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">
              {model.provider}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Model ID</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-white font-mono bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">
              {model.modelId}
            </dd>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Max Tokens</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-white">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                {model.maxTokens.toLocaleString()}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Temperature</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-white">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">
                {model.temperature}
              </span>
            </dd>
          </div>
        </div>
      </div>
    </ConfigCard>
  );
};

const SettingToggle: React.FC<{ label: string; description: string; enabled: boolean; setEnabled: (enabled: boolean) => void; }> = ({ label, description, enabled, setEnabled }) => (
  <div className="flex items-center justify-between">
    <div>
      <h4 className="font-medium text-zinc-900 dark:text-white">{label}</h4>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
    <div
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
        enabled ? 'bg-orange-600' : 'bg-zinc-200 dark:bg-zinc-700'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  </div>
);

export default function ConfigurationPage() {
  const [configData, setConfigData] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load configuration data from the actual data file
    const loadConfigData = async () => {
      try {
        const data = await getConfig();
        setConfigData(data as ConfigData);
      } catch (err) {
        console.error('Failed to load configuration data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load configuration data');
      } finally {
        setLoading(false);
      }
    };

    loadConfigData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !configData) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">Error Loading Configuration</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {error || 'Unable to load the configuration data.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <CogIcon className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Configuration</h1>
        </div>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          System configuration and model settings for {configData.global.projectName}
        </p>
      </div>

      {/* Model Configurations */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Model Configurations</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModelConfigCard 
            title="Main Model" 
            model={configData.models.main} 
            type="main"
          />
          <ModelConfigCard 
            title="Research Model" 
            model={configData.models.research} 
            type="research"
          />
          <ModelConfigCard 
            title="Fallback Model" 
            model={configData.models.fallback} 
            type="fallback"
          />
        </div>
      </div>

      {/* Global Settings */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <GlobeAltIcon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Global Settings</h2>
        </div>
        <Card title="General" icon={InformationCircleIcon} status="info">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Project Name</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{configData.global.projectName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">User ID</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{configData.global.userId}</dd>
              </div>
            </div>
            <SettingToggle 
              label="Debug Mode"
              description="Enable verbose logging for debugging."
              enabled={configData.global.debug}
              setEnabled={() => {}} // Placeholder
            />
          </div>
        </Card>
      </div>
      
      {/* Save Button */}
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Save className="-ml-1 mr-2 h-5 w-5" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
