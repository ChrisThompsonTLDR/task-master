import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTask, getMarkdownFile } from '../services/taskService';
import { Task } from '../types/task';
import MarkdownViewer from '../components/MarkdownViewer';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskId) return;
      setIsLoading(true);
      try {
        const taskResult = await getTask({ id: taskId });
        setTask(taskResult);
        const mdPath = { type: 'tasks', filename: `task_${taskResult.id}.md` };
        try {
          const mdContent = await getMarkdownFile(mdPath);
          setMarkdown(mdContent);
        } catch {
          setMarkdown(`*No markdown file found for this task. Details are sourced from tasks.json.*`);
        }
      } catch (e) {
        setError('Failed to load task details.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTaskDetails();
  }, [taskId]);

  if (isLoading) {
    return <div className="p-4">Loading task details...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!task) {
    return <div className="p-4">Task not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Link to="/tasks" className="text-blue-500 hover:text-blue-700 inline-flex items-center mb-4">
        <FaArrowLeft className="mr-2" />
        Back to Task List
      </Link>
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{task.title}</h1>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            task.status === 'done' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {task.status}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{task.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Details</h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p><strong>Priority:</strong> {task.priority}</p>
              <p><strong>ID:</strong> {task.id}</p>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Dependencies</h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {task.dependencies && task.dependencies.length > 0 ? (
                <ul className="list-disc pl-5">
                  {task.dependencies.map(dep => (
                    <li key={dep}><Link to={`/tasks/${dep}`} className="text-blue-500 hover:underline">Task {dep}</Link></li>
                  ))}
                </ul>
              ) : (
                <p>No dependencies</p>
              )}
            </div>
          </div>
        </div>
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Subtasks</h2>
            <ul className="space-y-2">
              {task.subtasks.map((sub, index) => (
                <li key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {sub.status === 'done' ? (
                    <FaCheckCircle className="text-green-500 mr-3" />
                  ) : (
                    <FaExclamationTriangle className="text-yellow-500 mr-3" />
                  )}
                  <span>{sub.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Source Document</h2>
          <MarkdownViewer content={markdown} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;