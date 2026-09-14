import fs from 'node:fs';
import {neon} from '@neondatabase/serverless';
if(!process.env.DATABASE_URL||!process.argv[2])throw new Error('Set DATABASE_URL privately and provide the backup file path.');
const backup=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
if(backup.format!=='manor-quest-backup-v1'||!Array.isArray(backup.accounts)||!backup.world)throw new Error('Unrecognised backup.');
const sql=neon(process.env.DATABASE_URL);
// Import into an empty target only; never overwrite an active class.
const statements=[sql.query('LOCK TABLE manor_quest.accounts, manor_quest.world IN ACCESS EXCLUSIVE MODE'),sql.query(`DO $$ BEGIN IF EXISTS(SELECT 1 FROM manor_quest.accounts) OR EXISTS(SELECT 1 FROM manor_quest.world) THEN RAISE EXCEPTION 'Target is not empty; import cancelled'; END IF; END $$`)];
for(const a of backup.accounts)statements.push(sql.query('INSERT INTO manor_quest.accounts (id,nickname,password,salt,created) VALUES ($1,$2,$3,$4,$5)',[a.id,a.nickname,a.password,a.salt,a.created]));
statements.push(sql.query('INSERT INTO manor_quest.world (id,revision,data) VALUES ($1,0,$2)',['class',JSON.stringify(backup.world)]));
await sql.transaction(statements);console.log('Imported accounts and class progress. Pupils must sign in again.');
