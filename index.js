const { createApp } = require('./app');
const { createDb, createPool } = require('./db');
const { createTasksRepository } = require('./tasksRepository');
const { runMigrations } = require('./migrate');

async function main() {
  const pool = createPool();
  try {
    const db = createDb(pool);
    await runMigrations(db);
    const port = Number(process.env.PORT || 3000);
    const server = createApp(pool, createTasksRepository(db)).listen(port, '0.0.0.0', () => {
      console.log(`API listening on port ${port}`);
    });

    async function shutdown() {
      server.close(async () => {
        await pool.end();
      });
    }

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    await pool.end();
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
