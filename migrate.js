const path = require('node:path');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { createDb, createPool } = require('./db');

async function runMigrations(db) {
  await migrate(db, { migrationsFolder: path.join(__dirname, 'drizzle') });
}

async function main() {
  const pool = createPool();
  try {
    await runMigrations(createDb(pool));
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { runMigrations };
