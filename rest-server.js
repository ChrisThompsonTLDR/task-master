// Minimal Express REST API for Task Master UI
import express from 'express';
import cors from 'cors';
import listTasks from './scripts/modules/task-manager/list-tasks.js';
import { tags as listTags } from './scripts/modules/task-manager/tag-management.js';
import { readComplexityReport } from './scripts/modules/utils.js';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// POST /api/tools/get_tasks/execute
app.post('/api/tools/get_tasks/execute', async (req, res) => {
  try {
    // The UI may send a JSON body with parameters; pass them to listTasks
    const params = req.body || {};
    // Map UI params to listTasks arguments
    const tasksPath = params.tasksPath || '.taskmaster/tasks/tasks.json';
    const statusFilter = params.status || undefined;
    const reportPath = params.reportPath || null;
    const withSubtasks = params.withSubtasks || false;
    const outputFormat = 'json';
    const tag = params.tag || null;
    const context = { projectRoot: process.cwd() };
    const result = listTasks(tasksPath, statusFilter, reportPath, withSubtasks, outputFormat, tag, context);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// POST /api/tools/list_tags/execute
app.post('/api/tools/list_tags/execute', async (req, res) => {
  try {
    const params = req.body || {};
    const tasksPath = params.tasksPath || '.taskmaster/tasks/tasks.json';
    const showMetadata = params.showMetadata || false;
    const context = { projectRoot: process.cwd() };
    const options = { showMetadata };
    // listTags returns { tags: [...] }
    const result = await listTags(tasksPath, options, context, 'json');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// POST /api/tools/get_state/execute
app.post('/api/tools/get_state/execute', async (req, res) => {
  try {
    const statePath = path.join(process.cwd(), '.taskmaster', 'state.json');
    if (!fs.existsSync(statePath)) {
      return res.status(404).json({ error: 'State file not found' });
    }
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// POST /api/tools/complexity_report/execute
app.post('/api/tools/complexity_report/execute', async (req, res) => {
  try {
    const params = req.body || {};
    const reportPath = params.file || path.join(process.cwd(), '.taskmaster', 'reports', 'task-complexity-report.json');
    const report = readComplexityReport(reportPath);
    if (!report) {
      return res.status(404).json({ error: 'Complexity report not found' });
    }
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// GET /api/tasks - return all tasks (with optional subtasks)
app.get('/api/tasks', async (req, res) => {
  try {
    const withSubtasks = req.query.withSubtasks === 'true';
    const tasksPath = '.taskmaster/tasks/tasks.json';
    const statusFilter = undefined;
    const reportPath = null;
    const outputFormat = 'json';
    const tag = null;
    const context = { projectRoot: process.cwd() };
    const result = await listTasks(tasksPath, statusFilter, reportPath, withSubtasks, outputFormat, tag, context);
    // result may be { tasks: [...] } or just an array
    const tasks = Array.isArray(result) ? result : result.tasks;
    const patchedTasks = (tasks || []).map(task => ({ ...task, tags: Array.isArray(task.tags) ? task.tags : [] }));
    res.json({ tasks: patchedTasks });
  } catch (err) {
    console.error('Error in GET /api/tasks:', err);
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Task Master REST API listening at http://localhost:${port}/api`);
}); 