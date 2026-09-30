// Transpiles every lib/*.ts (and any extra files, such as .tsx components) into a flat work folder so node can require them.
// Each run gets its own folder (removed on exit), so tests can run side by side.
// only: subjects whose bank modules are kept; the other subjects' banks become empty stubs, so one subject's
// half-finished work never breaks another subject's checks.
const fs=require('fs'),path=require('path'),ts=require('typescript');
const opts={compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}};
const fix=s=>s.replace(/require\("(?:@\/lib\/|\.\/|@\/app\/)(.*?)"\)/g,'require("./$1.cjs")');
const SUBJECT_MODULES={Maths:['bank-maths','mathsBank'],English:['bank-english','englishBank'],'Verbal reasoning':['bank-vr','vrBank'],'Non-verbal reasoning':['bank-nvr','nvrBank'],Science:['bank-science','scienceBank']};
const TOPIC_SUBJECT={ma:'Maths',en:'English',vr:'Verbal reasoning',nv:'Non-verbal reasoning',sc:'Science'};
function buildLib(name,extra=[],{only,keep=false}={}){
 const out=path.resolve('work',`${name}-${process.pid}`);fs.mkdirSync(out,{recursive:true});
 if(!keep)process.on('exit',()=>{try{fs.rmSync(out,{recursive:true,force:true});}catch{}});
 for(const f of fs.readdirSync('lib').filter(f=>f.endsWith('.ts')))fs.writeFileSync(path.join(out,f.replace(/\.ts$/,'.cjs')),fix(ts.transpileModule(fs.readFileSync(path.join('lib',f),'utf8'),opts).outputText));
 // extra: a source path (saved under its own name) or [source, saved name] for files that share a name, such as API routes.
 for(const item of extra){const [src,name]=Array.isArray(item)?item:[item,path.basename(item).replace(/\.tsx?$/,'.cjs')];fs.writeFileSync(path.join(out,name),fix(ts.transpileModule(fs.readFileSync(src,'utf8'),{...opts,fileName:src}).outputText));}
 if(only)for(const [subject,[file,exported]] of Object.entries(SUBJECT_MODULES))if(!only.includes(subject))fs.writeFileSync(path.join(out,file+'.cjs'),`exports.${exported}={topics:[],questions:[],problems:[]};`);
 return out;
}
module.exports=buildLib;
module.exports.SUBJECT_MODULES=SUBJECT_MODULES;
/** The subject a topic id belongs to: ma-… Maths, en-… English, vr-…, nv-…, sc-…. */
module.exports.subjectOfTopic=id=>TOPIC_SUBJECT[String(id).slice(0,2)];
