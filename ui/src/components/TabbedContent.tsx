import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabbedContentProps {
  tabs: Tab[];
  initialTabId?: string;
}

export const TabbedContent: React.FC<TabbedContentProps> = ({ tabs, initialTabId }) => {
  const [activeTabId, setActiveTabId] = useState(initialTabId || (tabs.length > 0 ? tabs[0].id : ''));
  const { colorTheme } = useTheme();

  if (tabs.length === 0) {
    return null; // Or some fallback UI if no tabs are provided
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Dynamic border color classes based on the selected theme
  const activeBorderClasses = {
    orange: 'border-orange-500 text-orange-600 dark:text-orange-400',
    blue: 'border-blue-500 text-blue-600 dark:text-blue-400',
    emerald: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
    purple: 'border-purple-500 text-purple-600 dark:text-purple-400',
    rose: 'border-rose-500 text-rose-600 dark:text-rose-400',
    amber: 'border-amber-500 text-amber-600 dark:text-amber-400',
    cyan: 'border-cyan-500 text-cyan-600 dark:text-cyan-400',
    red: 'border-red-500 text-red-600 dark:text-red-400',
    indigo: 'border-indigo-500 text-indigo-600 dark:text-indigo-400',
    teal: 'border-teal-500 text-teal-600 dark:text-teal-400',
    lime: 'border-lime-500 text-lime-600 dark:text-lime-400',
    pink: 'border-pink-500 text-pink-600 dark:text-pink-400',
    slate: 'border-slate-500 text-slate-600 dark:text-slate-400',
    zinc: 'border-zinc-500 text-zinc-600 dark:text-zinc-400',
    stone: 'border-stone-500 text-stone-600 dark:text-stone-400',
    neutral: 'border-neutral-500 text-neutral-600 dark:text-neutral-400'
  };

  return (
    <div>
      <div className="border-b border-zinc-200 dark:border-zinc-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`${
                activeTabId === tab.id
                  ? activeBorderClasses[colorTheme]
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200'
              } whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium`}
              aria-current={activeTabId === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {activeTab ? activeTab.content : null}
      </div>
    </div>
  );
};
