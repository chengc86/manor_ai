import postgres from 'postgres';
let connection:ReturnType<typeof postgres>|undefined;
function sql(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is not configured.');return connection??=postgres(process.env.DATABASE_URL,{prepare:false,max:5,idle_timeout:20,connect_timeout:10,ssl:'verify-full'});}
export function postgresQuery(statement:string){let index=0;const ignore=/^INSERT OR IGNORE /i.test(statement);let text=statement.replace(/^INSERT OR IGNORE /i,'INSERT ').replace(/\?/g,()=>`$${++index}`);if(ignore)text+=' ON CONFLICT DO NOTHING';if(text.includes('INSERT INTO auth_attempts'))text=text.replace(/WHEN reset</g,'WHEN auth_attempts.reset<').replace(/ELSE count\+1/g,'ELSE auth_attempts.count+1').replace(/ELSE reset END/g,'ELSE auth_attempts.reset END');return text.replace(/\b(FROM|INTO|UPDATE|JOIN) (accounts|sessions|auth_attempts|world)\b/gi,'$1 manor_quest.$2');}
class Statement{
 constructor(readonly text:string,readonly values:unknown[]=[]){ }
 bind(...values:unknown[]){return new Statement(this.text,values)}
 query(){return sql().unsafe(postgresQuery(this.text),this.values as any[])}
 async run(){const result=await this.query();return{success:true,meta:{changes:result.count??0}}}
 async first<T=Record<string,unknown>>(){const result=await this.query();return(result[0]??null) as T|null}
 async all<T=Record<string,unknown>>(){const result=await this.query();return{results:Array.from(result) as T[],success:true}}
}
const DB={prepare:(text:string)=>new Statement(text),batch:async(statements:Statement[])=>{return sql().begin(async tx=>{const results=[];for(const s of statements){const r=await tx.unsafe(postgresQuery(s.text),s.values as any[]);results.push({success:true,meta:{changes:r.count??0},results:Array.from(r)});}return results;})}};
export const env={DB,get TEACHER_PASSWORD(){return process.env.TEACHER_PASSWORD}};
