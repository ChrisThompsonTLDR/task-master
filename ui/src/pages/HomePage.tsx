import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome to Taskmaster</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Select a feature from the sidebar to get started.
      </p>
    </div>
  );
};

export default HomePage;
