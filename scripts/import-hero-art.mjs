// Format conversion only: retain the generated pixels' dimensions and transparency.
// Original PNGs stay outside source control; ship compact WebP game assets.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root=process.argv[2];
if(!root)throw new Error('Supply the directory containing the three generated-art manifests.');
const frames={},prompts=[];
for(const family of ['nature','wonders','playthings']){
 const folder=path.join(root,family);let entries;
 try{entries=JSON.parse(await fs.readFile(path.join(folder,'manifest.json'),'utf8'));}catch(e){if(e.code==='ENOENT')continue;throw e;}
 for(const entry of entries){
  const id=Number(entry.id);if(!Number.isInteger(id)||id<16||id>115)throw new Error('Invalid hero art ID');
  if(frames[id])throw new Error(`Duplicate hero art ID ${id}`);
  const source=path.isAbsolute(entry.file)?entry.file:path.join(folder,entry.file);
  const {width,height,hasAlpha}=await sharp(source).metadata();
  if(!width||!height||!hasAlpha)throw new Error(`Hero ${id} needs a transparent image`);
  const target=`public/starters/${id}.webp`;
  const sourceStat=await fs.stat(source),existing=await fs.stat(target).catch(()=>null);
  if(!existing||existing.mtimeMs<sourceStat.mtimeMs)await sharp(source).webp({quality:88,alphaQuality:100,effort:6}).toFile(target);
  const neckY=entry.neckY;
  if(neckY!==undefined&&(!Number.isFinite(neckY)||neckY<.3||neckY>.7))throw new Error(`Invalid clothing anchor for ${id}`);
  frames[id]={width,height,...(neckY!==undefined?{neckY}:{})};
  prompts.push({id,name:entry.name,file:`/starters/${id}.webp`,prompt:entry.prompt,...(entry.editPrompt?{editPrompt:entry.editPrompt}:{})});
 }
}
await fs.writeFile('lib/hero-art.ts',`// Generated asset dimensions and reviewed clothing anchors.\nexport const HERO_ART:Record<number,{width:number;height:number;neckY?:number}>=${JSON.stringify(frames,null,2)};\n`);
await fs.mkdir('docs/art',{recursive:true});await fs.writeFile('docs/art/hero-100-prompts.json',JSON.stringify(prompts.sort((a,b)=>a.id-b.id),null,2)+'\n');
console.log(`Imported ${prompts.length}/100 generated heroes.`);
if(process.argv.includes('--complete')&&prompts.length!==100)throw new Error('All 100 heroes are required before publishing.');
