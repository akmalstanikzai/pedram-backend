const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const schema = require('./schema');

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  return new Pool({ connectionString: process.env.DATABASE_URL });
}

function createDb(pool) {
  return drizzle({ client: pool, schema });
}

module.exports = { createPool, createDb };
