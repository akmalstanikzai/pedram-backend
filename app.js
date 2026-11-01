const express = require('express');

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function createApp(pool, tasksRepository) {
  const app = express();
  app.use(express.json());

  app.get('/health', async (req, res) => {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  });

  app.get('/tasks', async (req, res) => {
    res.json(await tasksRepository.list());
  });

  app.post('/tasks', async (req, res) => {
    const title = req.body?.title;
    if (typeof title !== 'string' || !title.trim() || title.length > 500) {
      return res.status(400).json({ error: 'title must be a nonempty string of at most 500 characters' });
    }

    const task = await tasksRepository.create(title.trim());
    return res.status(201).json(task);
  });

  app.patch('/tasks/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'invalid task id' });
    }

    const { title, completed } = req.body || {};
    if (title === undefined && completed === undefined) {
      return res.status(400).json({ error: 'provide title or completed' });
    }
    if (title !== undefined && (typeof title !== 'string' || !title.trim() || title.length > 500)) {
      return res.status(400).json({ error: 'title must be a nonempty string of at most 500 characters' });
    }
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }

    const changes = {};
    if (title !== undefined) {
      changes.title = title.trim();
    }
    if (completed !== undefined) {
      changes.completed = completed;
    }
    const task = await tasksRepository.update(id, changes);
    if (!task) {
      return res.status(404).json({ error: 'task not found' });
    }
    return res.json(task);
  });

  app.delete('/tasks/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'invalid task id' });
    }

    const removed = await tasksRepository.remove(id);
    if (!removed) {
      return res.status(404).json({ error: 'task not found' });
    }
    return res.status(204).end();
  });

  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ error: 'invalid JSON' });
    }
    console.error(error);
    return res.status(500).json({ error: 'internal server error' });
  });

  return app;
}

module.exports = { createApp };
