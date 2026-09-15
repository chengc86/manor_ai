import {neon} from '@neondatabase/serverless';
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL to your private Neon connection string.');
if(!process.env.TEACHER_PASSWORD)throw new Error('Set a private TEACHER_PASSWORD before starting the game.');
const sql=neon(process.env.DATABASE_URL);
const schema=await sql.query("SELECT 1 FROM pg_namespace WHERE nspname='manor_quest'");
if(!schema.length)await sql.query('CREATE SCHEMA manor_quest');
const tables={
 accounts:'id text PRIMARY KEY,nickname text NOT NULL UNIQUE,password text NOT NULL,salt text NOT NULL,created bigint NOT NULL',
 sessions:'token text PRIMARY KEY,user_id text NOT NULL,expires bigint NOT NULL',
 auth_attempts:'key text PRIMARY KEY,count integer NOT NULL,reset bigint NOT NULL',
 world:'id text PRIMARY KEY,revision bigint NOT NULL,data text NOT NULL',
};
// Runtime roles need data access, not ownership. Never rerun DDL on existing tables.
const existing=await sql.query("SELECT tablename FROM pg_tables WHERE schemaname='manor_quest'");
for(const [table,columns] of Object.entries(tables)){
 if(!existing.some(r=>r.tablename===table))await sql.query(`CREATE TABLE IF NOT EXISTS manor_quest.${table} (${columns})`);
 const [rights]=await sql.query("SELECT has_table_privilege(current_user,$1,'SELECT') AS read,has_table_privilege(current_user,$1,'INSERT') AS insert,has_table_privilege(current_user,$1,'UPDATE') AS update,has_table_privilege(current_user,$1,'DELETE') AS delete",['manor_quest.'+table]);
 if(!rights||!rights.read||!rights.insert||!rights.update||!rights.delete)throw new Error(`The database login needs SELECT, INSERT, UPDATE and DELETE on manor_quest.${table}. Check Render DATABASE_URL and the table grants.`);
 const names=columns.split(',').map(c=>c.trim().split(' ')[0]).join(',');
 await sql.query(`SELECT ${names} FROM manor_quest.${table} LIMIT 0`);
}
const index=await sql.query("SELECT 1 FROM pg_indexes WHERE schemaname='manor_quest' AND tablename='sessions' AND indexname='idx_sessions_user'");
if(!index.length){
 const [owner]=await sql.query("SELECT pg_has_role(current_user,tableowner,'USAGE') AS can_manage FROM pg_tables WHERE schemaname='manor_quest' AND tablename='sessions'");
 if(owner?.can_manage)await sql.query('CREATE INDEX IF NOT EXISTS idx_sessions_user ON manor_quest.sessions(user_id)');
 else console.log('Optional session lookup index is absent; the table owner can add it later.');
}
console.log('Neon schema and data permissions ready. Existing records preserved.');
