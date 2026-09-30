// Renders bank questions as PNG contact sheets for checking by eye: prompt, picture, options (answer ticked) and explanation.
// Usage: node scripts/preview-bank.cjs <topic id or prefix> [more …]   e.g.  node scripts/preview-bank.cjs ma-place-value nv-
// Sheets are written to work/preview/<topic>-<n>.png (six questions each). Nothing here ships with the game.
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const buildLib=require('../tests/build-lib.cjs');
const wanted=process.argv.slice(2);if(!wanted.length){console.log('Name a topic id or prefix, e.g. ma-place-value or nv-');process.exit(1);}
// Only the subjects being previewed are built, so another subject's unfinished work cannot get in the way.
const dir=buildLib('preview-lib',['app/question-visual.tsx'],{only:[...new Set(wanted.map(buildLib.subjectOfTopic).filter(Boolean))]});
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {bankQuestions,bankProblems,topicById}=require(path.join(dir,'bank.cjs')),QuestionVisual=require(path.join(dir,'question-visual.cjs')).default,{layout}=require(path.join(dir,'visual-layout.cjs'));
fs.mkdirSync('work/preview',{recursive:true});
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const wrap=(s,max)=>{const out=[];for(const para of String(s).split('\n')){let line='';for(const w of para.split(' ')){if(line&&(line+' '+w).length>max){out.push(line);line=w;}else line=line?line+' '+w:w;}out.push(line);}return out;};
const W=860;
function card(q){
 const parts=[];let y=26;const t=(s,size=15,o='')=>{parts.push(`<text x="20" y="${y}" font-size="${size}" ${o}>${esc(s)}</text>`);y+=size*1.35;};
 t(`${q.id} · ${topicById.get(q.topic)?.title??q.topic} · ${q.rewardGroup} ${q.select?`· choose ${q.select}`:''}`,12,'fill="#66756c"');
 if(q.reading){for(const l of wrap(`[${q.reading.title}, page ${q.page+1}] ${q.reading.pages[q.page]}`,118))t(l,11,'fill="#445"');y+=4;}
 for(const l of wrap(q.prompt.replace(/\*\*/g,''),92))t(l,16,'font-weight="700"');
 if(q.stimulus)for(const l of wrap(q.stimulus,70))t(l,17,'font-weight="700" fill="#7a3971"');
 const pic=(v,maxW,maxH)=>{const f=layout(v),s=Math.min(1,maxW/f.w,maxH/f.h);return {w:f.w*s,h:f.h*s,svg:renderToStaticMarkup(React.createElement(QuestionVisual,{visual:v})).replace(/ width="[^"]*" height="[^"]*"/,'').replace(/ style="[^"]*"/,'').replace('<svg ',`<svg x="{X}" y="{Y}" width="${f.w*s}" height="${f.h*s}" `)};};
 if(q.visual){const p=pic(q.visual,W-40,300);parts.push(p.svg.replace('{X}',20).replace('{Y}',y));y+=p.h+10;}
 if(q.optionVisuals){let x=20;q.options.forEach((o,i)=>{const p=pic(q.optionVisuals[i],120,120),ok=q.answers.includes(o);parts.push(`<rect x="${x-4}" y="${y-4}" width="128" height="150" rx="8" fill="${ok?'#d9f2e1':'#fff'}" stroke="${ok?'#1f7a4a':'#99a'}"/>`,p.svg.replace('{X}',x).replace('{Y}',y),`<text x="${x+60}" y="${y+140}" font-size="15" text-anchor="middle" font-weight="700">${ok?'✓ ':''}${esc(o)}</text>`);x+=138;});y+=160;}
 else q.options.forEach((o,i)=>{const ok=q.answers.includes(o);t(`${String.fromCharCode(65+i)} ${ok?'✓':' '} ${o}`,15,ok?'fill="#1f7a4a" font-weight="700"':'');});
 y+=4;for(const l of q.explanation.split('\n').flatMap(l=>wrap(l.replace(/\*\*/g,''),110)))t(l,12,'fill="#334"');
 return {h:y+12,svg:parts.join('')};
}
(async()=>{
 let sheets=0;
 for(const want of wanted){
  const qs=bankQuestions.filter(q=>q.topic===want||q.topic.startsWith(want));if(!qs.length){console.log('No questions for',want);continue;}
  const byTopic=new Map();for(const q of qs){if(!byTopic.has(q.topic))byTopic.set(q.topic,[]);byTopic.get(q.topic).push(q);}
  for(const [topic,list] of byTopic)for(let k=0;k<list.length;k+=6){
   const cards=list.slice(k,k+6).map(card);let y=0;const body=cards.map(c=>{const g=`<g transform="translate(0 ${y})"><rect x="6" y="4" width="${W-12}" height="${c.h-8}" rx="10" fill="#fff" stroke="#c9d3cc"/>${c.svg}</g>`;y+=c.h;return g;}).join('');
   const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}" font-family="Arial, sans-serif"><rect width="100%" height="100%" fill="#eef3ef"/>${body}</svg>`;
   await sharp(Buffer.from(svg)).png().toFile(`work/preview/${topic}-${k/6+1}.png`);sheets++;
  }
 }
 console.log(`${sheets} sheet(s) in work/preview. Template problems: ${bankProblems.length}`);bankProblems.slice(0,30).forEach(p=>console.log(' -',p));
})().catch(e=>{console.error(e);process.exit(1);});
