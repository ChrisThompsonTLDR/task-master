import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContextProvider';
import { TaskProvider } from './contexts/TaskContextProvider';
import Layout from './components/Layout';
import TaskListPage from './pages/TaskListPage';
import TreePage from './pages/TreePage';
import ResearchPage from './pages/ResearchPage';
import ConfigExplorerPage from './pages/ConfigExplorerPage';
import ConfigurationPage from './pages/ConfigurationPage';
import TaskFilesPage from './pages/TaskFilesPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <TaskProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tasks" element={<TaskListPage />} />
              <Route path="/tree" element={<TreePage />} />
              <Route path="/config-explorer" element={<ConfigExplorerPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/configuration" element={<ConfigurationPage />} />
              <Route path="/task-files" element={<TaskFilesPage />} />
            </Routes>
          </Layout>
        </TaskProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
