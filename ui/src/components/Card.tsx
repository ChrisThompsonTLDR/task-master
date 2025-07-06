import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
  padding?: boolean;
  className?: string; // Added for additional styling flexibility
}

export const Card: React.FC<CardProps> = ({ children, title, icon, padding = true, className = '' }) => (
  <div className={`bg-white dark:bg-zinc-800 shadow-sm rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden ${className}`}>
    <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
    </div>
    <div className={padding ? "p-4" : ""}>{children}</div>
  </div>
);
