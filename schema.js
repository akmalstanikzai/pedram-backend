const { sql } = require('drizzle-orm');
const { bigint, boolean, check, pgTable, text, timestamp } = require('drizzle-orm/pg-core');

const tasks = pgTable('tasks', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  title: text('title').notNull(),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  check('tasks_title_check', sql`length(trim(${table.title})) > 0`)
]);

module.exports = { tasks };
