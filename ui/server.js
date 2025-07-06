const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());

const tasksFilePath = path.join(__dirname, '.taskmaster', 'tasks', 'tasks.json');
const stateFilePath = path.join(__dirname, '.taskmaster', 'state.json');

// Endpoint to get all tasks
app.get('/api/tasks', (req, res) => {
  fs.readFile(tasksFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading tasks file:", err);
      return res.status(500).json({ error: 'Failed to read tasks file' });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to get state
app.get('/api/state', (req, res) => {
  fs.readFile(stateFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading state file:", err);
      return res.status(500).json({ error: 'Failed to read state file' });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to get a specific markdown file
app.get('/api/markdown/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  
  // Basic validation to prevent path traversal
  if (!['tasks', 'ideas', 'prd'].includes(type) || !/^[a-zA-Z0-9_.-]+$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid file request' });
  }

  let filePath;
  if (type === 'tasks') {
    filePath = path.join(__dirname, '.taskmaster', 'tasks', filename);
  } else {
    filePath = path.join(__dirname, '.taskmaster', 'docs', type, filename);
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading markdown file: ${filePath}`, err);
      return res.status(404).json({ error: 'File not found' });
    }
    res.type('text/markdown').send(data);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 