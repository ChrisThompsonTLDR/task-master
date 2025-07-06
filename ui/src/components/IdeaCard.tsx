import React from 'react';
import { Sparkles, Tag } from 'lucide-react';

interface IdeaCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  onClick: () => void;
  isSelected: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ 
  id, 
  title, 
  description, 
  tags, 
  onClick, 
  isSelected 
}) => {
  return (
    <div 
      className={`bg-white dark:bg-zinc-800 rounded-lg shadow-sm border ${
        isSelected 
          ? 'border-orange-300 dark:border-orange-700' 
          : 'border-zinc-200 dark:border-zinc-700'
      } overflow-hidden transition-all duration-200 hover:shadow-md`}
    >
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                IDEA-{id.padStart(4, '0')}: {title}
              </h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {tags.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onClick}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              isSelected
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
            }`}
          >
            {isSelected ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>
      
      <div className="px-6 py-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {description}
        </p>
      </div>
    </div>
  );
};

export default IdeaCard;
