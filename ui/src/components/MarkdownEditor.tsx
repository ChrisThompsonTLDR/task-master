import React, { useState } from 'react';

interface MarkdownEditorProps {
  initialContent: string;
}

export default function MarkdownEditor({ initialContent }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    // onSave(content);
  };

  return (
    <div className="space-y-4">
      <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
        <div className="bg-zinc-50 dark:bg-zinc-800 px-4 py-2 border-b border-zinc-300 dark:border-zinc-600">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
              Markdown Editor
            </h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96 p-4 text-sm font-mono text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 border-0 resize-none focus:ring-0 focus:outline-none"
          placeholder="Enter your markdown content here..."
        />
      </div>
      
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        <p>
          <strong>Tip:</strong> Use Markdown syntax for formatting. 
          Supports headers (#), lists (-), code blocks (```), and more.
        </p>
      </div>
    </div>
  );
}
