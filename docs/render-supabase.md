# Manor Quest on Render + Supabase

Render runs the Docker app. Supabase PostgreSQL stores accounts, password hashes, coins, question history, inventory and the shared class world in the dedicated `manor_quest` schema. The app retains its existing teacher/pupil login; it does not use Supabase Auth or the browser Data API.

1. In Supabase, open **Connect > Session pooler** and copy its PostgreSQL URI. The session pooler supports IPv4 and suits a persistent Render service. URL-encode special characters in the database password. Do not use a project HTTPS URL, anon key or service-role key as DATABASE_URL.
2. In Render, set the private **DATABASE_URL** to that URI and retain **TEACHER_PASSWORD**. Save and deploy the latest GitHub main commit. No credentials belong in Git or client code.
3. Startup runs `scripts/postgres-migrate.mjs`: it creates missing tables and checks existing columns/data permissions. It does not erase records, change ownership or grant access. Use a database role with rights to create the schema/tables initially, or have the owner create `manor_quest` and grant the application role the required privileges.
4. The Docker container starts on `$PORT`; `/api/health` is the health check. The driver uses TLS certificate verification, at most five connections per process, and unnamed queries (`prepare:false`) so transaction-pooler connections are also supported. Do not disable certificate verification; if your database requires a custom CA, provide it via Node's `NODE_EXTRA_CA_CERTS` configuration.

## Existing class records

Changing DATABASE_URL does not copy data from Neon. If the Supabase target already contains the `manor_quest` tables and records, they are reused. A fresh target starts empty. Keep any old database/backup until the class has been verified on Supabase.

For an existing Manor Quest teacher export: stop play on the old app, finish the wave and download `/api/teacher/export` while signed in as teacher. Initialise the target using `node scripts/postgres-migrate.mjs`, then run `node scripts/postgres-import.mjs /private/path/backup.json` with the target DATABASE_URL. The import is one transaction and refuses any non-empty target. It copies accounts and world records but not sessions, so pupils sign in again. Never commit the backup. An inaccessible source (such as quota-blocked Neon) must be restored or recovered from backup before its progress can be transferred.

Local `npm run dev` continues to use its separate Cloudflare D1 database. A local successful login does not verify the Render/Supabase deployment.

Validation: `node tests/postgres-startup.mjs`, `node tests/postgres-adapter.cjs`, `node tests/persistence.cjs`, and `npm run build:render`.

Reference: [Supabase PostgreSQL connections](https://supabase.com/docs/guides/database/connecting-to-postgres) and [Postgres.js configuration](https://supabase.com/docs/guides/database/postgres-js).
