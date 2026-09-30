// Checks the Atom-style Year 6 bank (lib/bank-*.ts): structure, fairness, pictures, helpsheets and counts.
// node tests/bank-quality.cjs              every subject, with the full-bank targets
// node tests/bank-quality.cjs Maths        one subject (while it is being written); add --partial to skip the count targets
const path=require('path');
const args=process.argv.slice(2),subject=args.find(a=>!a.startsWith('--')),partial=args.includes('--partial');
const buildLib=require('./build-lib.cjs');if(subject&&!buildLib.SUBJECT_MODULES[subject]){console.log('Subjects:',Object.keys(buildLib.SUBJECT_MODULES).join(', '));process.exit(1);}
const dir=buildLib('bank-quality',['app/question-visual.tsx'],subject?{only:[subject]}:{});
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {bankQuestions,bankTopics,bankProblems,topicById}=require(path.join(dir,'bank.cjs')),{questions,publicQuestion,answerMatches,choiceOrder}=require(path.join(dir,'questions.cjs'));
const {checkQuestion}=require(path.join(dir,'bank-kit.cjs')),{VISUAL_KINDS,visualText}=require(path.join(dir,'visual.cjs')),{layout}=require(path.join(dir,'visual-layout.cjs')),QuestionVisual=require(path.join(dir,'question-visual.cjs')).default;
const TARGET={Maths:720,English:400,'Verbal reasoning':400,'Non-verbal reasoning':240,Science:190},MIN_PER_TOPIC=12;
const scope=bankQuestions.filter(q=>!subject||q.subject===subject),topics=bankTopics.filter(t=>!subject||t.subject===subject),fails=[];
const fail=(q,msg)=>fails.push(`${q?.id??q}: ${msg}`);
const problems=bankProblems.filter(p=>!subject||topics.some(t=>p.startsWith(t.id+':')||p.startsWith('v2-'+t.id+'-')));
problems.forEach(p=>fails.push('template: '+p));
// IDs are unique across every question the game can look up, including retired ones.
const ids=new Map();for(const q of questions){if(ids.has(q.id))fail(q,'duplicate id');ids.set(q.id,q);}
// American spellings and words. A bare "meter" is fine for instruments (force meter); only metre units written the American way fail.
const US=/\b(color|colors|colored|favorite|favorites|center|centers|gray|liter|liters|math|mom|candy|soccer|vacation|cookies?|pants|sidewalk|elevator|faucet|flashlight|fall semester|grade [1-9]|recess|(?:kilo|centi|milli)meters?)\b|\b\d[\d,.]*\s*meters?\b|\bmeters? (?:long|wide|tall|high|deep|away)\b/i;
const finite=(f)=>JSON.stringify(f,(k,v)=>typeof v==='number'&&!Number.isFinite(v)?(fails.push('non-finite number in picture'),0):v);
function checkVisual(q,v,where){
 if(!v)return;if(!VISUAL_KINDS.includes(v.kind)){fail(q,`${where}: unknown picture kind ${v.kind}`);return;}
 if(v.kind==='set')v.items.forEach((i,k)=>checkVisual(q,i,`${where}.items[${k}]`));
 if(v.kind==='compare'){checkVisual(q,v.left,where+'.left');checkVisual(q,v.right,where+'.right');}
 try{const f=layout(v);if(!(f.w>0&&f.h>0&&f.w<2000&&f.h<2000))fail(q,`${where}: odd picture size ${f.w}×${f.h}`);finite(f);renderToStaticMarkup(React.createElement(QuestionVisual,{visual:v}));}catch(e){fail(q,`${where}: picture fails to draw (${e.message})`);}
 if(/\b(correct|answer|odd one out|the rule)\b/i.test(v.alt??''))fail(q,`${where}: picture description gives the game away: ${v.alt}`);
}
const seen=new Map();
for(const q of scope){
 if(!q.id.startsWith('v2-'))fail(q,'bank ids start with v2-');
 const t=topicById.get(q.topic);if(!t)fail(q,'unknown topic');else if(t.subject!==q.subject)fail(q,'topic subject differs');
 checkQuestion(q).forEach(p=>fail(q,p));
 if(q.difficulty!=='Year 6')fail(q,'bank questions are Year 6');if(![10,20,30,40].includes(q.reward))fail(q,'reward must be 10, 20, 30 or 40');
 if(q.legacy)fail(q,'bank questions are not legacy');
 if(!answerMatches(q,q.select>1?q.answers:q.answers[0]))fail(q,'the answer is not accepted');
 if(q.select>1&&answerMatches(q,q.answers.slice(1).concat(q.options.find(o=>!q.answers.includes(o)))))fail(q,'a wrong choice is accepted');
 for(const o of q.options.filter(o=>!q.answers.includes(o)))if(q.select>1?false:answerMatches(q,o))fail(q,`wrong option "${o}" is accepted`);
 const pub=publicQuestion(q);if('answers' in pub||'explanation' in pub||'legacy' in pub)fail(q,'public question leaks answers');
 if(q.prompt.length>600)fail(q,'prompt longer than 600 characters');if((q.stimulus??'').length>400)fail(q,'stimulus longer than 400 characters');
 for(const o of q.options)if(o.length>160)fail(q,'option longer than 160 characters');
 checkVisual(q,q.visual,'visual');(q.optionVisuals??[]).forEach((v,i)=>checkVisual(q,v,`option ${i}`));
 if(q.visual?.scale==='options'&&!q.optionVisuals)fail(q,"a picture drawn at the options' scale needs picture options");
 const text=[q.prompt,q.stimulus??'',...q.options,q.explanation].join(' ');const us=text.match(US);if(us)fail(q,`American word "${us[0]}": use British English`);
 // Picture labels A–E clash with the option letters A–E ("part C" beside option C), unless the options are those letters.
 const lettered=q.options.every(o=>/^[A-Z]$/.test(o)),labels=new Set(visualText(q.visual).filter(s=>/^[A-E]$/.test(s)));
 if(!lettered&&labels.size){const ref=[q.prompt,q.stimulus??'',...q.options].join(' ').match(/\b(?:labelled|label|point|part|parts|angle|bulb|bulbs|layer|bottle|side|vertex|corner|line|shape|arrow|jar|beaker|position)\s+\**([A-E])\**\b/i);if(ref&&labels.has(ref[1]))fail(q,`picture label ${ref[1]} clashes with the option letters: label pictures from P onwards or with numbers`);}
 for(const [k,t] of [['prompt',q.prompt],['stimulus',q.stimulus??''],['explanation',q.explanation]])if((t.match(/\*\*/g)||[]).length%2)fail(q,`unbalanced ** in ${k}`);
 // Each pupil sees these choices in their own order, so the explanation must not point at one by its letter or place.
 if(choiceOrder(q,'probe')){const m=q.explanation.match(/\b(?:option|choice|answer)s?\s+\(?[A-E]\b|\b[A-E]\s+is\s+(?:the\s+)?(?:correct|right|answer|odd one out|only)\b|\b(?:picture|shape|figure|card)\s+[A-E]\b|\b(?:first|second|third|fourth|fifth|last)\s+(?:option|choice|answer)s?\b|\([A-E]\)/i);if(m)fail(q,`the explanation names a choice by its letter or place ("${m[0]}"), but each pupil sees their own order`);}
 if(q.reading){const words=q.reading.pages.map(p=>p.split(/\s+/).length);if(q.reading.pages.length<1||q.reading.pages.length>4||words.some(w=>w<30||w>280))fail(q,`reading pages must be 1–4 pages of 30–280 words (${words})`);}
 const key=[q.prompt,q.stimulus??'',JSON.stringify(q.visual??null),q.page??''].join('#').toLowerCase();if(seen.has(key)&&seen.get(key)!==q.topic)fail(q,'same question appears in another topic');seen.set(key,q.topic);
}
for(const t of topics){
 const n=scope.filter(q=>q.topic===t.id).length,h=t.helpsheet;
 if(n<MIN_PER_TOPIC)fail(t.id,`only ${n} questions (at least ${MIN_PER_TOPIC})`);
 // Children notice patterns: across a topic the right answer must not sit in the same place most of the time.
 const single=scope.filter(q=>q.topic===t.id&&!(q.select>1));if(single.length>=8){const at={};for(const q of single){const i=q.options.indexOf(q.answers[0]);at[i]=(at[i]??0)+1;}const [pos,top]=Object.entries(at).sort((a,b)=>b[1]-a[1])[0];if(top/single.length>=.6)fail(t.id,`the answer is option ${String.fromCharCode(65+Number(pos))} in ${top} of ${single.length} questions`);}
 if(!h?.intro?.trim()||!(h.steps?.length>=2))fail(t.id,'helpsheet needs an intro and at least two steps');
 if(h?.example&&!h.example.lines?.length)fail(t.id,'helpsheet example needs working lines');
 if(h?.example?.visual)checkVisual(t.id,h.example.visual,'helpsheet');
 if(!/^(ma|en|vr|nv|sc)-[a-z0-9-]+$/.test(t.id))fail(t.id,'topic ids look like ma-place-value');
}
if(!partial)for(const [s,target] of Object.entries(TARGET))if(!subject||s===subject){const n=bankQuestions.filter(q=>q.subject===s).length;if(n<target)fails.push(`${s}: ${n} questions, target ${target}`);}
const counts=Object.fromEntries(Object.keys(TARGET).map(s=>[s,bankQuestions.filter(q=>q.subject===s).length]));
console.log('Bank:',bankQuestions.length,'questions,',bankTopics.length,'topics',counts);
if(fails.length){console.log(`FAIL: ${fails.length} problem(s)`);fails.slice(0,80).forEach(f=>console.log(' -',f));process.exit(1);}
console.log(`PASS: ${scope.length} ${subject??'bank'} questions in ${topics.length} topics are well formed, fair and drawable.`);
