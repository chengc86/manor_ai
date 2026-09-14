import {neon} from '@neondatabase/serverless';
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL to your private Neon connection string.');
if(!process.env.TEACHER_PASSWORD)throw new Error('Set a private TEACHER_PASSWORD before starting the game.');
const sql=neon(process.env.DATABASE_URL);
const existing=await sql.query("SELECT 1 FROM pg_namespace WHERE nspname='manor_quest'");
if(!existing.length)await sql.query('CREATE SCHEMA manor_quest');
const statements=[
 'CREATE TABLE IF NOT EXISTS manor_quest.accounts (id text PRIMARY KEY,nickname text NOT NULL UNIQUE,password text NOT NULL,salt text NOT NULL,created bigint NOT NULL)',
 'CREATE TABLE IF NOT EXISTS manor_quest.sessions (token text PRIMARY KEY,user_id text NOT NULL,expires bigint NOT NULL)',
 'CREATE INDEX IF NOT EXISTS idx_sessions_user ON manor_quest.sessions(user_id)',
 'CREATE TABLE IF NOT EXISTS manor_quest.auth_attempts (key text PRIMARY KEY,count integer NOT NULL,reset bigint NOT NULL)',
 'CREATE TABLE IF NOT EXISTS manor_quest.world (id text PRIMARY KEY,revision bigint NOT NULL,data text NOT NULL)',
];
await sql.transaction(statements.map(text=>sql.query(text)));
console.log('Neon schema ready. Existing records preserved.');
