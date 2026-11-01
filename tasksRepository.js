const { eq, sql } = require('drizzle-orm');
const { tasks } = require('./schema');

function asApiTask(row) {
  return { ...row, id: String(row.id) };
}

function createTasksRepository(db) {
  return {
    async list() {
      const rows = await db.select().from(tasks).orderBy(tasks.id);
      return rows.map(asApiTask);
    },

    async create(title) {
      const [row] = await db.insert(tasks).values({ title }).returning();
      return asApiTask(row);
    },

    async update(id, changes) {
      const [row] = await db.update(tasks)
        .set({ ...changes, updatedAt: sql`now()` })
        .where(eq(tasks.id, id))
        .returning();
      return row ? asApiTask(row) : null;
    },

    async remove(id) {
      const rows = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
      return rows.length > 0;
    }
  };
}

module.exports = { createTasksRepository };
