const { defineConfig } = require('drizzle-kit');

module.exports = defineConfig({
  schema: './schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://app:app_dev_password@db:5432/app'
  }
});
