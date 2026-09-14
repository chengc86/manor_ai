# Manor Quest on Render + Neon

Use a Render Docker web service for the app and a separate Neon Postgres project for durable records. The app container is disposable; Neon keeps accounts, hashed passwords, coins, answer history, costumes, weapons and the shared class wave.

1. Create a Neon project near your Render region. Copy its pooled connection string privately.
2. Put this repository in your own Git repository and create a Render Docker web service using the included `Dockerfile` (or the `render.yaml` Blueprint).
3. Add secret environment variables in Render: `DATABASE_URL` (Neon connection string) and `TEACHER_PASSWORD` (your private teacher login password). Never commit them.
4. The container listens on `0.0.0.0:$PORT` and creates missing database tables in the dedicated `manor_quest` schema on startup. It does not erase existing records. Render checks `/api/health`.
5. Start with one web-service instance. All coin purchases, permanent choices and shared-wave mutations use optimistic concurrency in Postgres. Polling currently synchronises clients; WebSockets are optional future work for lower latency.

## Moving the current class

The existing private Sites game still uses Cloudflare D1. A fresh Neon database does not automatically contain Hayden or any current pupil progress.

- Stop class play and finish the current wave.
- Sign in as teacher on the old site and download `/api/teacher/export`. This backup contains password hashes and private pupil records: keep it private.
- Initialise the target with `node scripts/neon-migrate.mjs` using private environment settings.
- Before starting the new app, run `node scripts/neon-import.mjs /path/to/manor-quest-private-backup.json` with the target `DATABASE_URL`. Import refuses to overwrite a non-empty target.
- Verify the new site before switching children to it. Keep the old site closed to play during the move; do not run two independently changing copies of the class.
- Do not include the backup in Git or in the Docker image. Pupils sign in again after migration.

## Included files

`Dockerfile`, `.dockerignore`, `render.yaml`, `runtime/neon-env.ts`, `scripts/neon-migrate.mjs`, `scripts/neon-import.mjs`, and the separate `build:render` script. The existing Sites build remains available.

References: [Render Docker](https://render.com/docs/docker), [Render web services](https://render.com/docs/web-services), [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver).

## Existing Neon database

This project isolates all tables in `manor_quest`; it does not use or modify existing public-schema tables. If the connection role cannot create schemas, a database owner must first run `CREATE SCHEMA IF NOT EXISTS manor_quest; GRANT USAGE, CREATE ON SCHEMA manor_quest TO authenticator;` (use your actual application role). Then run the migration with the application connection.
