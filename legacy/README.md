# Previous migration

`001_create_tasks.sql` is the SQL migration used before Drizzle was introduced. Existing databases may have a `schema_migrations` record for it. New databases use the Drizzle migration in `drizzle/` instead. Keep this file as historical reference; do not apply it again.
