import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=(await readFile(new URL('../scripts/neon-migrate.mjs',import.meta.url),'utf8')).replace("import {neon} from '@neondatabase/serverless';",'const neon=()=>globalThis.mockNeon;');
process.env.DATABASE_URL='test-only';process.env.TEACHER_PASSWORD='test-only';
for(const withIndex of [true,false]){
 const calls=[];globalThis.mockNeon={async query(q){calls.push(q);if(q.includes('pg_namespace'))return[{}];if(q.includes('has_table_privilege'))return[{read:true,insert:true,update:true,delete:true}];if(q.includes('pg_has_role'))return[{can_manage:false}];if(q.includes('pg_tables'))return['accounts','sessions','auth_attempts','world'].map(tablename=>({tablename}));if(q.includes('pg_indexes'))return withIndex?[{}]:[];if(q.includes('LIMIT 0'))return[];throw Error('Unexpected SQL: '+q)}};
 await import('data:text/javascript;base64,'+Buffer.from(source+'\n// '+withIndex).toString('base64'));assert(!calls.some(q=>/CREATE|ALTER|DROP/.test(q)));
}
console.log('PASS: non-owner runtime role starts against existing tables, with or without optional index; no DDL issued.');
