# Tasks API with Drizzle and PostgreSQL

This small Express API is a learning example for Drizzle ORM, Drizzle Kit migrations, and Drizzle Studio. Docker Compose runs the API and PostgreSQL; no local Node or PostgreSQL installation is needed.

## Start and try the API

From this repository directory:

```sh
docker compose up --build
```

The API starts at `http://localhost:3000`. It applies committed Drizzle migrations before accepting requests. PostgreSQL data persists in the `postgres_data` Docker volume. The credentials in `compose.yaml` are for local development only.

Try these requests with Postman or curl:

```sh
curl http://localhost:3000/health
curl -X POST http://localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Learn Drizzle"}'
curl http://localhost:3000/tasks
curl -X PATCH http://localhost:3000/tasks/1 -H 'Content-Type: application/json' -d '{"completed":true}'
curl -X DELETE http://localhost:3000/tasks/1
```

POST returns HTTP 201 with a task. Invalid input returns HTTP 400, and a missing task returns HTTP 404. Task IDs remain strings in JSON, as they were before this Drizzle change.

## Where Drizzle is used

| File | Purpose |
| --- | --- |
| `schema.js` | Defines the `tasks` table, columns, defaults, and title check constraint. |
| `db.js` | Creates the `pg` connection pool and passes it to Drizzle. |
| `tasksRepository.js` | Uses Drizzle's select, insert, update, and delete query builders. |
| `drizzle.config.js` | Tells Drizzle Kit where the schema, migrations, and database are. |
| `drizzle/` | Committed SQL migrations and schema snapshots. |
| `migrate.js` | Runs pending Drizzle migrations from the API or on demand. |

The Express routes in `app.js` validate requests and call the repository. The API still uses plain SQL for its simple health check.

## Change the database schema

1. Edit `schema.js`. For example, add a `dueDate` column to the `tasks` table.
2. Generate a migration from the schema change:

   ```sh
   docker compose exec api npm run db:generate
   ```

3. Inspect the new SQL file and snapshot under `drizzle/`. Check any data conversion or destructive statements before applying them.
4. Apply it to your running database:

   ```sh
   docker compose exec api npm run db:migrate
   ```

5. Update the repository and API code that use the new column, run `docker compose exec api npm test`, and commit `schema.js`, the generated `drizzle/` files, and the application changes together.

When another developer pulls the commit and runs `docker compose up --build`, the API applies pending migrations automatically. `npm run migrate` is also available and uses the same Drizzle migration history as `npm run db:migrate`. Use generated migration files for shared schema changes; avoid `drizzle-kit push` in this workflow because it changes the database without creating a committed migration.

The first Drizzle migration uses `CREATE TABLE IF NOT EXISTS`, so it can register itself on a database that already has the original `tasks` table without deleting task rows. The previous SQL migration is retained under `legacy/` for reference. The old `schema_migrations` table may remain in an existing database; Drizzle records its own history in `drizzle.__drizzle_migrations`.

Check applied Drizzle migrations:

```sh
docker compose exec db psql -U app -d app -c 'SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at;'
```

## Browse the data with Drizzle Studio

Start the optional Studio container:

```sh
docker compose --profile studio up -d --build studio
```

Open `https://local.drizzle.studio` in your browser. Its local proxy is available through `127.0.0.1:4983` on your computer. Studio is for local development here; the Compose port is bound only to localhost. You can browse and edit rows or run SQL in its interface.

You can also inspect data in PostgreSQL directly:

```sh
docker compose exec db psql -U app -d app -c 'SELECT * FROM tasks;'
```

## Other commands

| Command | Purpose |
| --- | --- |
| `docker compose exec api npm test` | Run the backend tests. |
| `docker compose logs -f api` | Follow API logs. |
| `docker compose exec db psql -U app -d app` | Open a PostgreSQL shell. |
| `docker compose down` | Stop the containers and keep database data. |
| `docker compose down -v` | Delete local database data and recreate it from migrations on the next start. |

The backend uses JavaScript and CommonJS, so you can learn Drizzle without converting the app to TypeScript first. If you move to TypeScript later, the schema can also provide compile-time query types.

Docker uses `package-lock.json` and `npm ci` to install recorded dependency versions. Commit the lockfile with the source. When you change `package.json`, regenerate and commit the lockfile with it.
