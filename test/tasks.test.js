const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createApp } = require('../app');

const calls = [];
const pool = {
  async query(sql) {
    calls.push({ method: 'health', sql });
  }
};
const tasksRepository = {
  async list() {
    calls.push({ method: 'list' });
    return [];
  },
  async create(title) {
    calls.push({ method: 'create', title });
    return { id: '1', title, completed: false };
  },
  async update(id, changes) {
    calls.push({ method: 'update', id, changes });
    return null;
  },
  async remove(id) {
    calls.push({ method: 'remove', id });
    return true;
  }
};
const app = createApp(pool, tasksRepository);

function route(method, path) {
  const layer = app.router.stack.find((item) => item.route?.path === path && item.route.methods[method]);
  return layer.route.stack[0].handle;
}

async function invoke(method, path, { body, id } = {}) {
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
    end() {
      return this;
    }
  };
  await route(method, path)({ body, params: { id } }, response);
  return response;
}

test('creates a task and passes the trimmed title to the repository', async () => {
  const response = await invoke('post', '/tasks', { body: { title: '  Write docs  ' } });
  assert.equal(response.statusCode, 201);
  assert.equal(response.body.title, 'Write docs');
  assert.deepEqual(calls.at(-1), { method: 'create', title: 'Write docs' });
});

test('validates input and reports missing tasks', async () => {
  const invalid = await invoke('post', '/tasks', { body: { title: '   ' } });
  assert.equal(invalid.statusCode, 400);

  const missing = await invoke('patch', '/tasks/:id', { id: '2', body: { completed: true } });
  assert.equal(missing.statusCode, 404);
  assert.deepEqual(calls.at(-1), { method: 'update', id: 2, changes: { completed: true } });
});

test('checks database health, lists tasks and deletes a task', async () => {
  const health = await invoke('get', '/health');
  assert.equal(health.statusCode, 200);
  assert.deepEqual(health.body, { status: 'ok' });

  const list = await invoke('get', '/tasks');
  assert.equal(list.statusCode, 200);
  assert.deepEqual(list.body, []);

  const deletion = await invoke('delete', '/tasks/:id', { id: '1' });
  assert.equal(deletion.statusCode, 204);
  assert.deepEqual(calls.at(-1), { method: 'remove', id: 1 });
});
