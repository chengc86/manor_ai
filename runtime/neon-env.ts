import {neon} from '@neondatabase/serverless';
let connection:ReturnType<typeof neon<false,true>>|undefined;
function sql(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is not configured.');return connection??=neon(process.env.DATABASE_URL,{fullResults:true});}
export function postgresQuery(statement:string){let index=0;const ignore=/^INSERT OR IGNORE /i.test(statement);let text=statement.replace(/^INSERT OR IGNORE /i,'INSERT ').replace(/\?/g,()=>`$${++index}`);if(ignore)text+=' ON CONFLICT DO NOTHING';if(text.includes('INSERT INTO auth_attempts'))text=text.replace(/WHEN reset</g,'WHEN auth_attempts.reset<').replace(/ELSE count\+1/g,'ELSE auth_attempts.count+1').replace(/ELSE reset END/g,'ELSE auth_attempts.reset END');return text.replace(/\b(FROM|INTO|UPDATE|JOIN) (accounts|sessions|auth_attempts|world)\b/gi,'$1 manor_quest.$2');}
class Statement{
 constructor(readonly text:string,readonly values:unknown[]=[]){ }
 bind(...values:unknown[]){return new Statement(this.text,values)}
 query(){return sql().query(postgresQuery(this.text),this.values)}
 async run(){const result=await this.query();return{success:true,meta:{changes:result.rowCount??0}}}
 async first<T=Record<string,unknown>>(){const result=await this.query();return(result.rows[0]??null) as T|null}
 async all<T=Record<string,unknown>>(){const result=await this.query();return{results:result.rows as T[],success:true}}
}
const DB={prepare:(text:string)=>new Statement(text),batch:async(statements:Statement[])=>{const results=await sql().transaction(statements.map(s=>s.query()));return results.map(r=>({success:true,meta:{changes:r.rowCount??0},results:r.rows}))}};
export const env={DB,get TEACHER_PASSWORD(){return process.env.TEACHER_PASSWORD}};
