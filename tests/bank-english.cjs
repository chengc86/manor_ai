// Re-checks the English bank (lib/bank-english*.ts) without using the code that wrote the questions.
// Each hand-written question carries an audit note (englishAudit): word classes for every word, the fully corrected
// sentence, the evidence quoted from a passage and so on. This test recounts, rebuilds and re-applies those with its own
// rules and word lists, then checks the question agrees. Run: node tests/bank-english.cjs
const path=require('path');
const dir=require('./build-lib.cjs')('bank-english',[],{only:['English']});
const {bankQuestions,bankTopics}=require(path.join(dir,'bank.cjs'));
const {englishAudit}=require(path.join(dir,'bank-english.cjs'));
const fails=[];const fail=(id,msg)=>fails.push(`${id}: ${msg}`);
const qs=bankQuestions.filter(q=>q.subject==='English'),byId=new Map(qs.map(q=>[q.id,q]));
const topics=bankTopics.filter(t=>t.subject==='English');
const single=(q)=>q.answers.length===1?q.answers[0]:null;

// ---- Topics and counts --------------------------------------------------------------------------------------------
const GRAMMAR=['en-nouns','en-verbs','en-adjectives','en-adverbs','en-pronouns','en-prepositions','en-conjunctions','en-determiners','en-clauses','en-tenses','en-active-passive','en-formality','en-sentence-punctuation','en-commas','en-apostrophes','en-speech','en-colons-semicolons','en-homophones','en-prefixes-suffixes','en-vocabulary'];
const READING={'en-fiction':5,'en-non-fiction':3,'en-poetry':2};
// SATs-style topics (lib/bank-english-sats-*.ts): minimum questions per topic. Their passages follow the same page rules below.
const SATS={'en-sats-grammar':20,'en-sats-punctuation':20,'en-sats-spelling':20,'en-sats-reading':24};
for(const [id,min] of Object.entries(SATS)){const n=qs.filter(q=>q.topic===id).length;if(n<min)fail(id,`${n} questions, expected at least ${min}`);}
for(const id of GRAMMAR){const n=qs.filter(q=>q.topic===id).length;if(n<18)fail(id,`${n} questions, expected at least 18`);}
for(const [id,texts] of Object.entries(READING)){const n=qs.filter(q=>q.topic===id).length;if(n<texts*8)fail(id,`${n} questions, expected at least ${texts*8}`);}
for(const t of topics)if(![...GRAMMAR,...Object.keys(READING),...Object.keys(SATS)].includes(t.id))fail(t.id,'unexpected topic');
if(qs.length<400)fail('English',`${qs.length} questions, target 400`);

// ---- Every question ---------------------------------------------------------------------------------------------------
const NUMBER_WORDS={2:'two',3:'three',4:'four'};
for(const q of qs){
 const text=[q.prompt,q.stimulus??'',...q.options,q.explanation].join(' ');
 if(/[‘’“”]/.test(text))fail(q.id,'curly quotation marks: this bank uses straight ones');
 if(q.select>1&&!new RegExp(`\\b${NUMBER_WORDS[q.select]}\\b`,'i').test(q.prompt))fail(q.id,`asks for ${q.select} answers but the prompt does not say how many`);
 if(!q.select&&/\*\*(two|three)\*\*/i.test(q.prompt))fail(q.id,'prompt asks for several answers but only one is accepted');
 // Text options are shuffled, so an explanation must name an option by its words, never by its position.
 if(!q.options.every(o=>/^[A-F]$/.test(o))&&/\b(first|second|third|fourth|fifth|last) (option|choice|answer)\b|\bthe (third|fourth|fifth) sentence\b|\b(second|third|fourth|last) sentence (has|uses|puts|moves|is)\b/i.test(q.explanation))fail(q.id,'explanation refers to an option by its position');
 if(q.options.length>=4&&q.options.every(o=>/^\d/.test(o))&&q.options.join()!==[...q.options].sort((a,b)=>parseFloat(a)-parseFloat(b)).join())fail(q.id,'number choices are not in number order');
 // Lettered cards: options A, B, C … in order, one card per letter.
 if(q.options.every(o=>/^[A-F]$/.test(o))){const cards=q.visual?.kind==='cards'?q.visual.cards:null;
  if(!cards)fail(q.id,'lettered options without cards');
  else{if(q.options.join('')!=='ABCDEF'.slice(0,q.options.length))fail(q.id,'letters out of order');if(cards.length!==q.options.length||cards.some((c,i)=>c.caption!==q.options[i]))fail(q.id,'card captions do not match the options');}}
 // A stimulus with gaps has one gap per part of the answer (an answer such as 'on … at' fills two).
 if((q.stimulus??'').includes('___')&&!/___\w/.test(q.stimulus)&&q.stimulus.split('___').length-1!==(single(q)??'').split(' … ').length)fail(q.id,'the number of gaps does not match the answer');
}

// ---- Reading passages -------------------------------------------------------------------------------------------------
const texts=new Map();
for(const q of qs.filter(q=>q.reading)){
 const r=q.reading,key=JSON.stringify(r);if(!texts.has(r.id))texts.set(r.id,{key,qs:[],topic:q.topic,reading:r});const t=texts.get(r.id);
 if(t.key!==key)fail(q.id,`passage ${r.id} differs from other questions on the same passage`);if(t.topic!==q.topic)fail(q.id,'one passage used in two topics');t.qs.push(q);
 if(!(Number.isInteger(q.page)&&q.page>=0&&q.page<r.pages.length))fail(q.id,`page ${q.page} does not exist in ${r.id}`);
 if(!/^An original (story|poem|information text|leaflet|diary) written for Manor Quest$/.test(r.byline??''))fail(q.id,`byline "${r.byline}"`);
}
for(const [id,t] of texts){
 const poem=t.topic==='en-poetry'||/poem/.test(id),words=t.reading.pages.map(p=>p.split(/\s+/).filter(Boolean).length);
 if(poem?(t.reading.pages.length<1||t.reading.pages.length>2||words.some(n=>n<40||n>200)):(t.reading.pages.length!==3||words.some(n=>n<120||n>200)))fail(id,`page lengths ${words} (${poem?'a poem has 1–2 pages':'prose has 3 pages of 120–200 words'})`);
 if(t.qs.length!==8)fail(id,`${t.qs.length} questions, expected 8`);
 if(new Set(t.qs.map(q=>q.page)).size<t.reading.pages.length)fail(id,'some page has no questions');
 for(const p of t.reading.pages)if(/(^|\s)'[A-Z][^']*[,.!?]'(\s|$)/.test(p))fail(id,'speech in single inverted commas: this bank uses double');
}
for(const [topic,n] of Object.entries(READING)){const found=[...texts.values()].filter(t=>t.topic===topic).length;if(found!==n)fail(topic,`${found} passages, expected ${n}`);}
for(const topic of Object.keys(READING))if(!qs.some(q=>q.topic===topic&&q.select>1))fail(topic,'no "select the two" question');

// ---- Audit notes ----------------------------------------------------------------------------------------------------
const noted=new Map();for(const a of englishAudit){if(!byId.has(a.id)){fail(a.id,`audit note (${a.kind}) for a question that does not exist`);continue;}if(!noted.has(a.id))noted.set(a.id,[]);noted.get(a.id).push(a);}
// Formats that must carry a note, so their answers are re-checked.
for(const q of qs){const kinds=(noted.get(q.id)??[]).map(a=>a.kind);
 if(q.reading&&!kinds.includes('evidence'))fail(q.id,'reading question without evidence note');
 if(/How many .*(nouns|verbs|adjectives|adverbs|pronouns|prepositions|conjunctions|determiners)\b/.test(q.prompt)&&!kinds.includes('count'))fail(q.id,'word-class count without tags');
 if(/^Select the \*\*two\*\* (nouns|proper nouns|verbs|adjectives|comparative adjectives|adverbs|pronouns|possessive pronouns|prepositions|conjunctions|determiners) (used )?in the (sentence|sentences|expanded noun phrase) below/.test(q.prompt)&&!kinds.includes('pick'))fail(q.id,'select-two word class without tags');
 if(/punctuation mark that is \*\*missing\*\*/.test(q.prompt)&&!kinds.includes('missing'))fail(q.id,'missing-mark question without the full text');
 if(/contains mistakes/.test(q.prompt)&&!kinds.includes('proof'))fail(q.id,'proofreading question without the corrected text');
 if(/INCORRECTLY/.test(q.prompt)&&!kinds.includes('fixes'))fail(q.id,'INCORRECTLY question without corrected options');
}

// Tagged sentences --------------------------------------------------------------------------------------------------
const PUNCT=/^[,.!?;:]$/;
const parse=(t)=>t.split(' ').filter(Boolean).map(s=>{const i=s.lastIndexOf('/');return i<0?{w:s,tag:''}:{w:s.slice(0,i),tag:s.slice(i+1)};});
const plain=(toks)=>toks.reduce((s,{w})=>!s||PUNCT.test(w)?s+w:s+' '+w,'');
const is=(tag,cls)=>tag===cls||tag.startsWith(cls+'.');
const CLASSES=['noun','noun.ab','noun.pr','noun.col','noun.cmp','verb','verb.aux','verb.mod','adj','adj.cmp','adj.sup','adv','pron','pron.rel','pron.pos','prep','conj.co','conj.sub','det','other'];
// Closed-class words whose class never changes, as a cross-check on the tags.
const FIXED={the:'det',a:'det',an:'det',and:'conj.co',but:'conj.co',or:'conj.co',because:'conj.sub',although:'conj.sub',unless:'conj.sub',whereas:'conj.sub',
 i:'pron',me:'pron',you:'pron',he:'pron',him:'pron',she:'pron',we:'pron',us:'pron',they:'pron',them:'pron',it:'pron',everyone:'pron',everybody:'pron',mine:'pron.pos',yours:'pron.pos',ours:'pron.pos',theirs:'pron.pos',hers:'pron.pos',
 my:'det',our:'det',their:'det',your:'det',several:'det',every:'det',some:'det',those:'det',
 will:'verb.mod',would:'verb.mod',can:'verb.mod',could:'verb.mod',shall:'verb.mod',should:'verb.mod',may:'verb.mod',might:'verb.mod',must:'verb.mod',
 in:'prep',on:'prep',beside:'prep',beneath:'prep',under:'prep',through:'prep',across:'prep',during:'prep',with:'prep',of:'prep'};
const LY_ADJECTIVES=['friendly','lonely','lovely','silly','ugly','early','daily'];
function checkTags(a,q){
 const toks=parse(a.tagged);
 for(const t of toks){if(PUNCT.test(t.w)){if(t.tag)fail(q.id,`punctuation "${t.w}" has a tag`);continue;}
  if(!CLASSES.includes(t.tag))fail(q.id,`"${t.w}" has unknown class "${t.tag}"`);
  const fixed=FIXED[t.w.toLowerCase()];if(fixed&&!is(t.tag,fixed)&&!(fixed==='prep'&&t.tag==='other'))fail(q.id,`"${t.w}" tagged ${t.tag}, expected ${fixed}`);
  if(/ly$/.test(t.w)&&t.tag==='adj'&&!LY_ADJECTIVES.includes(t.w.toLowerCase()))fail(q.id,`"${t.w}" tagged as an adjective`);
  if(t.tag==='noun.pr'&&!/^[A-Z]/.test(t.w))fail(q.id,`proper noun "${t.w}" without a capital`);}
 if(plain(toks)!==q.stimulus)fail(q.id,`stimulus "${q.stimulus}" is not the tagged sentence "${plain(toks)}"`);
 return toks;
}

const CHECK={
 count(a,q){const toks=checkTags(a,q),n=toks.filter(t=>is(t.tag,a.cls)).length;if(single(q)!==String(n))fail(q.id,`${a.cls}: counted ${n}, answer ${q.answers}`);if(q.options.filter(o=>o===String(n)).length!==1)fail(q.id,'count not among the options');},
 pick(a,q){const toks=checkTags(a,q),members=q.options.filter(o=>toks.some(t=>t.w===o&&is(t.tag,a.cls)));
  for(const o of q.options)if(!q.stimulus.includes(o))fail(q.id,`option "${o}" is not in the sentence`);
  for(const o of q.options.filter(o=>!o.includes(' ')))if(toks.filter(t=>t.w===o).length!==1)fail(q.id,`option "${o}" appears ${toks.filter(t=>t.w===o).length} times in the sentence`);
  if(members.sort().join('|')!==[...q.answers].sort().join('|'))fail(q.id,`${a.cls} options by the tags: ${members}, answers: ${q.answers}`);
  if(a.all){const all=toks.filter(t=>is(t.tag,a.cls)).length;if(all!==q.answers.length)fail(q.id,`the sentence has ${all} words of class ${a.cls}, but ${q.answers.length} are asked for`);}},
 capitals(a,q){const s=q.stimulus,c=a.corrected;if(s.toLowerCase()!==c.toLowerCase())fail(q.id,'corrected sentence has different letters');
  const diff=[...s].filter((ch,i)=>ch!==c[i]).length;
  if(/^\d+$/.test(single(q)??''))(String(diff)!==single(q))&&fail(q.id,`${diff} capitals differ, answer ${q.answers}`);
  else{const sw=s.split(/\s+/),cw=c.split(/\s+/),changed=sw.filter((w,i)=>w!==cw[i]).map(w=>w.replace(/[^\w']/g,''));if(changed.length!==1||changed[0].toLowerCase()!==single(q)?.toLowerCase())fail(q.id,`changed words ${changed}, answer ${q.answers}`);}},
 proof(a,q){const shown=q.visual?.kind==='cards'?q.visual.cards.map(c=>c.text):q.options,answerText=q.visual?.kind==='cards'?shown[q.options.indexOf(single(q))]:single(q);
  if(answerText!==a.correct)fail(q.id,`answer "${answerText}" is not the corrected sentence "${a.correct}"`);
  if(shown.filter(s=>s===a.correct).length!==1)fail(q.id,'the corrected sentence is not exactly one of the choices');
  const words=(s)=>s.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(/\s+/).join(' ');
  if(q.stimulus&&words(q.stimulus)!==words(a.correct))fail(q.id,'the corrected sentence changes the words, not just capitals and punctuation');
  if(q.stimulus===a.correct)fail(q.id,'the stimulus has no mistakes');
  for(const s of shown.filter(s=>s!==a.correct)){let i=0;while(s[i]===a.correct[i])i++;let j=0;while(j<s.length-i&&s[s.length-1-j]===a.correct[a.correct.length-1-j])j++;const gap=Math.max(s.length-i-j,a.correct.length-i-j);if(gap>14)fail(q.id,`"${s}" differs from the corrected sentence in more than one place`);}},
 fixes(a,q){const shown=a.cards??q.options,fixedOf=(s,i)=>a.cards?a.fixed[i]:a.fixes[s];
  if(a.cards&&(q.visual?.kind!=='cards'||q.visual.cards.some((c,i)=>c.text!==a.cards[i])))fail(q.id,'cards differ from the note');
  if(!a.cards&&q.options.some(o=>!(o in a.fixes)))fail(q.id,'an option has no corrected form');
  const odd=shown.map((s,i)=>a.want==='incorrect'?s!==fixedOf(s,i):s===fixedOf(s,i)).map((b,i)=>b?i:-1).filter(i=>i>=0);
  const answerIndex=a.cards?q.options.indexOf(single(q)):shown.indexOf(single(q));
  if(odd.length!==1||odd[0]!==answerIndex)fail(q.id,`${a.want} choices by the notes: ${odd.map(i=>a.cards?String.fromCharCode(65+i):shown[i])}, answer ${q.answers}`);},
 missing(a,q){const marks={'Full stop':'.','Comma':',','Question mark':'?','Exclamation mark':'!','Colon':':','Semicolon':';','Inverted commas':'"','Dash':' –','Hyphen':'-'};
  const put=(opt)=>{const m=/^(.+?) (after|before) '(.+)'$/.exec(opt);if(!m||!(m[1] in marks))return null;const s=q.stimulus,w=m[3];const at=[];for(let i=s.indexOf(w);i>=0;i=s.indexOf(w,i+1)){const before=s[i-1],after=s[i+w.length];if((!before||!/[A-Za-z]/.test(before))&&(!after||!/[A-Za-z]/.test(after)))at.push(i);}if(at.length!==1)return undefined;const i=m[2]==='after'?at[0]+w.length:at[0];return s.slice(0,i)+marks[m[1]]+s.slice(i);};
  const ok=put(single(q));if(ok===null)fail(q.id,`cannot read the answer "${q.answers}"`);else if(ok===undefined)fail(q.id,'the answer names a word that is not once in the text');else if(ok!==a.full)fail(q.id,`putting back "${q.answers}" gives "${ok}", not "${a.full}"`);
  for(const o of q.options.filter(o=>o!==single(q))){const r=put(o);if(r===null)fail(q.id,`cannot read option "${o}"`);else if(r===a.full)fail(q.id,`option "${o}" also completes the text`);}},
 endMark(a,q){const marks={'full stop':'.','question mark':'?','exclamation mark':'!','comma':',','semicolon':';'};if(q.stimulus+marks[single(q)]!==a.full)fail(q.id,`"${q.stimulus}" + ${q.answers} is not "${a.full}"`);
  for(const o of q.options.filter(o=>o!==single(q)))if(q.stimulus+marks[o]===a.full)fail(q.id,`option ${o} also completes the sentence`);},
 clauses(a,q){for(const c of a.clauses)if(!q.stimulus.includes(c))fail(q.id,`clause "${c}" is not in the sentence`);if(String(a.clauses.length)!==single(q))fail(q.id,`${a.clauses.length} clauses, answer ${q.answers}`);
  const verbs=a.clauses.map(c=>c.split(' ').filter(w=>/ed$|ew$|ang$/.test(w)).length);if(verbs.some(n=>n<1))fail(q.id,'a listed clause has no past-tense verb');},
};

// Verb forms: the test's own tables. ------------------------------------------------------------------------------------
const PARTICIPLE={visit:'visited',start:'started',finish:'finished',do:'done',eat:'eaten',drive:'driven',ring:'rung',lose:'lost',flood:'flooded',paint:'painted',play:'played',see:'seen',pitch:'pitched',practise:'practised',break:'broken',win:'won',lock:'locked',follow:'followed',build:'built',clean:'cleaned',ruin:'ruined',heat:'heated',chase:'chased',write:'written',sing:'sung',throw:'thrown',destroy:'destroyed',present:'presented',steal:'stolen'};
const PAST={visit:'visited',start:'started',finish:'finished',do:'did',eat:'ate',drive:'drove',ring:'rang',lose:'lost',flood:'flooded',paint:'painted',play:'played',see:'saw',pitch:'pitched',break:'broke',kick:'kicked',lock:'locked',close:'closed',heat:'heated',walk:'walked',wait:'waited',sit:'sat',chase:'chased',write:'wrote',sing:'sang',throw:'threw'};
const PRESENT3={bake:'bakes',paint:'paints',flood:'floods',see:'sees'};
const participles=new Set(Object.values(PARTICIPLE)),pasts=new Set(Object.values(PAST)),presents=new Set([...Object.values(PRESENT3),'clean','heat','follow']);
function tenseOf(p){const w=p.toLowerCase().split(/\s+/);
 if(w.length===1)return pasts.has(w[0])?'simple past':presents.has(w[0])?'simple present':'none';
 const [x,y,z]=w;
 if(x==='had'&&y==='been'&&z?.endsWith('ing'))return 'past perfect progressive';
 if((x==='has'||x==='have')&&y==='been'&&z?.endsWith('ing'))return 'present perfect progressive';
 if(x==='had'&&participles.has(y))return 'past perfect';
 if((x==='has'||x==='have')&&participles.has(y))return 'present perfect';
 if((x==='was'||x==='were')&&y.endsWith('ing'))return 'past progressive';
 if(['am','is','are'].includes(x)&&y.endsWith('ing'))return 'present progressive';
 return 'none';}
const BE=['am','is','are','was','were','be','been','being'];
function voiceOf(p){const w=p.toLowerCase().split(/\s+/);for(let i=0;i<w.length-1;i++)if(BE.includes(w[i])&&participles.has(w[i+1])&&!(w[i]==='been'&&w[i+1].endsWith('ing')))return 'passive';return 'active';}
function timeOf(p){const w=p.toLowerCase().split(/\s+/);if(w[0]==='will')return 'future';if(['was','were','had'].includes(w[0])||(w.length===1&&pasts.has(w[0])))return 'past';if(['is','are','am','has','have'].includes(w[0])||(w.length===1&&presents.has(w[0])))return 'present';return 'unknown';}
const ING={sing:'singing'};
const cap=(s)=>s[0].toUpperCase()+s.slice(1);
Object.assign(CHECK,{
 tenseName(a,q){if(!q.stimulus.includes(a.phrase))fail(q.id,`"${a.phrase}" is not in the sentence`);const t=tenseOf(a.phrase);if(t!==single(q))fail(q.id,`"${a.phrase}" is ${t}, answer ${q.answers}`);if(q.options.filter(o=>o===t).length!==1)fail(q.id,'tense not among the options');},
 tenseOptions(a,q){const hits=q.options.filter(o=>{const p=a.phrases[o];if(p===undefined){fail(q.id,`no verb phrase for "${o}"`);return false;}if(!o.toLowerCase().includes(p.toLowerCase()))fail(q.id,`"${p}" is not in "${o}"`);return tenseOf(p)===a.target;});
  if(hits.length!==1||hits[0]!==single(q))fail(q.id,`${a.target} options: ${hits}, answer ${q.answers}`);},
 participle(a,q){if(PARTICIPLE[a.verb]!==single(q))fail(q.id,`participle of ${a.verb} is ${PARTICIPLE[a.verb]}, answer ${q.answers}`);if(q.options.some(o=>o!==single(q)&&o===PARTICIPLE[a.verb]))fail(q.id,'participle appears twice');},
 voice(a,q){const hits=q.options.filter(o=>{const p=a.phrases[o];if(p===undefined){fail(q.id,`no verb phrase for "${o}"`);return false;}if(!o.toLowerCase().includes(p.toLowerCase()))fail(q.id,`"${p}" is not in "${o}"`);return voiceOf(p)===a.target;});
  if(hits.length!==1||hits[0]!==single(q))fail(q.id,`${a.target} options: ${hits}, answer ${q.answers}`);},
 voiceCount(a,q){const cards=q.visual?.cards?.map(c=>c.text)??[];a.phrases.forEach((p,i)=>cards[i]?.includes(p)||fail(q.id,`"${p}" is not on card ${i+1}`));const n=a.phrases.filter(p=>voiceOf(p)==='passive').length;if(String(n)!==single(q))fail(q.id,`${n} passive, answer ${q.answers}`);},
 voiceTime(a,q){const [v,t]=a.target.split(' ');const hits=q.options.filter(o=>{const p=a.phrases[o];return p&&o.toLowerCase().includes(p.toLowerCase())&&voiceOf(p)===v&&timeOf(p)===t;});if(hits.length!==1||hits[0]!==single(q))fail(q.id,`${a.target} options: ${hits}, answer ${q.answers}`);},
 passiveOf(a,q){if(a.tense!=='simple past')fail(q.id,'unsupported tense');const expected=`${cap(a.object)} was ${PARTICIPLE[a.verb]} by ${a.doer}.`;if(single(q)!==expected)fail(q.id,`expected "${expected}", answer "${q.answers}"`);if(q.stimulus!==`${cap(a.doer)} ${PAST[a.verb]} ${a.object}.`)fail(q.id,'the active sentence does not match the note');},
 activeOf(a,q){const verb=a.tense==='simple past'?PAST[a.verb]:a.tense==='present progressive'?'is '+ING[a.verb]:null;const expected=`${cap(a.doer)} ${verb} ${a.object}.`;if(single(q)!==expected)fail(q.id,`expected "${expected}", answer "${q.answers}"`);
  const be=a.tense==='simple past'?'was':'is being';if(q.stimulus!==`${cap(a.object)} ${be} ${PARTICIPLE[a.verb]} by ${a.doer.replace(/^The /,'the ')}.`)fail(q.id,'the passive sentence does not match the note');},
});

// Apostrophes, commas, hyphens -------------------------------------------------------------------------------------------
const CONTRACTION={'they are':"they're",'would not':"wouldn't",'shall not':"shan't",'will not':"won't",'who is':"who's"};
Object.assign(CHECK,{
 possessive(a,q){const form=a.plural&&a.owner.endsWith('s')?a.owner+"'":a.owner+"'s",expected=`${form} ${a.thing}`;if(!single(q)?.includes(expected))fail(q.id,`expected "${expected}" in the answer "${q.answers}"`);for(const o of q.options.filter(o=>o!==single(q)))if(new RegExp(`(^|\\s)${expected.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`).test(o))fail(q.id,`wrong option "${o}" contains "${expected}"`);},
 contraction(a,q){const c=CONTRACTION[a.full];if(!c)fail(q.id,`no contraction for ${a.full}`);else if(single(q)?.toLowerCase()!==c)fail(q.id,`contraction of ${a.full} is ${c}, answer ${q.answers}`);},
 apostropheCount(a,q){const n=(s)=>(s.match(/'/g)??[]).length;if(a.corrected.replace(/'/g,'')!==q.stimulus)fail(q.id,'corrected sentence differs by more than apostrophes');if(String(n(a.corrected)-n(q.stimulus))!==single(q))fail(q.id,`${n(a.corrected)-n(q.stimulus)} apostrophes missing, answer ${q.answers}`);},
 apostropheWord(a,q){const sw=q.stimulus.split(' '),cw=a.corrected.split(' ');const changed=sw.filter((w,i)=>w!==cw[i]);if(changed.length!==1||changed[0]!==single(q)||cw[sw.indexOf(changed[0])].replace("'",'')!==changed[0])fail(q.id,`changed words ${changed}, answer ${q.answers}`);},
 commaCount(a,q){if(a.full.replace(/,/g,'')!==q.stimulus)fail(q.id,'full sentence differs by more than commas');const n=(a.full.match(/,/g)??[]).length-(q.stimulus.match(/,/g)??[]).length;if(String(n)!==single(q))fail(q.id,`${n} commas needed, answer ${q.answers}`);},
 hyphen(a,q){if(a.full.replace(/-/g,' ')!==q.stimulus)fail(q.id,'full sentence differs by more than the hyphen');const m=/^between '(.+)' and '(.+)'$/.exec(single(q)??'');if(!m||!a.full.includes(`${m[1]}-${m[2]}`))fail(q.id,`answer ${q.answers} does not match "${a.full}"`);for(const o of q.options.filter(o=>o!==single(q))){const n=/^between '(.+)' and '(.+)'$/.exec(o);if(n&&a.full.includes(`${n[1]}-${n[2]}`))fail(q.id,`option ${o} is also hyphenated`);}},
});

// Homophones and word building ---------------------------------------------------------------------------------------------
const HOMOPHONES=[['their','there',"they're"],['to','too','two'],['your',"you're",'yore'],['practise','practice'],['advise','advice'],['stationery','stationary'],['aloud','allowed'],['past','passed'],['whether','weather'],['piece','peace'],['affect','effect'],['herd','heard'],['led','lead'],['brake','break'],['seen','scene'],['whose',"who's"]];
const WORDS=new Set(['impossible','illegal','irregular','misbehave','misspell','mislead','dangerous','electrician','expansion','confidence','hoping','stopped','loneliness','courageous','reliable','simply','referring']);
function addSuffix(root,suffix,rule){switch(rule){
 case 'drop-e':return root.replace(/e$/,'')+suffix;
 case 'double':return root+root.at(-1)+suffix;
 case 'y-i':return root.replace(/y$/,'i')+suffix;
 case 'keep-e':return root+suffix;
 case 'le-ly':return root.replace(/le$/,'ly');
 default:return null;}}
Object.assign(CHECK,{
 gap(a,q){if(q.stimulus.replace('___',single(q))!==a.full)fail(q.id,`"${q.stimulus}" filled with ${q.answers} is not "${a.full}"`);
  const set=HOMOPHONES.find(s=>s.includes(single(q).toLowerCase()));if(!set)fail(q.id,`${q.answers} is not in the test's homophone list`);else if(!q.options.some(o=>o!==single(q)&&set.includes(o.toLowerCase())))fail(q.id,'no homophone among the wrong options');},
 wordFixes(a,q){const sw=q.stimulus.split(' '),cw=a.corrected.split(' ');if(sw.length!==cw.length)fail(q.id,'corrected sentence has a different number of words');const changed=sw.filter((w,i)=>w!==cw[i]);if(changed.sort().join('|')!==[...q.answers].sort().join('|'))fail(q.id,`changed words ${changed}, answers ${q.answers}`);
  for(const [i,w] of sw.entries())if(w!==cw[i]&&!HOMOPHONES.some(s=>s.includes(cw[i].toLowerCase().replace(/[^a-z']/g,''))&&s.includes(w.toLowerCase()))&&!(w==='Its'&&cw[i]==="It's"))fail(q.id,`${w} → ${cw[i]} is not a homophone swap`);},
 affix(a,q){const piece=single(q).replace(/-/g,'');const made=a.roots.map(r=>single(q).startsWith('-')?r+piece:piece+r);if(made.join('|')!==a.words.join('|'))fail(q.id,`${q.answers} makes ${made}, expected ${a.words}`);for(const x of a.words)if(!WORDS.has(x))fail(q.id,`${x} is not in the test's word list`);
  for(const o of q.options.filter(o=>o!==single(q))){const p=o.replace(/-/g,'');const other=a.roots.map(r=>o.startsWith('-')?r+p:p+r);if(other.every(x=>WORDS.has(x)))fail(q.id,`option ${o} also makes real words`);}},
 suffix(a,q){const made=addSuffix(a.root,a.suffix,a.rule);if(made!==single(q))fail(q.id,`${a.root} + ${a.suffix} (${a.rule}) = ${made}, answer ${q.answers}`);if(!WORDS.has(made))fail(q.id,`${made} is not in the test's word list`);if(q.options.filter(o=>o===made).length!==1)fail(q.id,'the built word is not exactly one option');},
 spelling(a,q){if(single(q)!==a.word||!WORDS.has(a.word))fail(q.id,`${q.answers} is not the listed spelling ${a.word}`);},
 ending(a,q){const made=a.stem+single(q).replace('-','');if(made!==a.word||!WORDS.has(made))fail(q.id,`${a.stem} + ${q.answers} = ${made}`);for(const o of q.options.filter(o=>o!==single(q)))if(WORDS.has(a.stem+o.replace('-','')))fail(q.id,`option ${o} also makes a real word`);},
 evidence(a,q){if(!q.reading)return fail(q.id,'evidence note on a question without a passage');if(a.page!==q.page)fail(q.id,`note page ${a.page}, question page ${q.page}`);if(!a.quotes.length)fail(q.id,'no evidence quoted');
  const page=q.reading.pages[q.page]??'';for(const s of a.quotes){if(!page.includes(s))fail(q.id,`"${s}" is not on page ${q.page+1} of ${q.reading.id}`);if(!q.explanation.includes(s))fail(q.id,`the explanation does not quote "${s}"`);}},
});

// Sentence types, by the KS2 rules: a question ends with ?, an exclamation starts with What or How and ends with !,
// a command starts with an imperative verb. The verb list is this test's own.
const IMPERATIVE=['tidy','close','hurry','watch','stir','pour','wash','tell','please','put','bring','check','take','wait'];
function sentenceType(s){const w=s.trim().split(/\s+/),first=w[0].toLowerCase().replace(/[^a-z]/g,'');
 if(w.length<2)return 'interjection';if(/\?$/.test(s))return 'question';if(/^(What an?|How)\b/.test(s)&&/!$/.test(s))return 'exclamation';if(IMPERATIVE.includes(first))return 'command';return 'statement';}
Object.assign(CHECK,{
 sentenceType(a,q){const t=sentenceType(q.stimulus);if(t!==single(q))fail(q.id,`"${q.stimulus}" is a ${t}, answer ${q.answers}`);},
 sentenceTypeOptions(a,q){const hits=q.options.filter(o=>sentenceType(o)===a.target);if(hits.length!==1||hits[0]!==single(q))fail(q.id,`${a.target} options: ${hits}, answer ${q.answers}`);},
});

// SATs practice (lib/bank-english-sats-*.ts): the test's own word lists and rules for subjects and objects, modal verbs,
// relative pronouns, fronted adverbials, clauses, standard English, the subjunctive, formal words, synonyms, punctuation
// functions, bullet points and the Year 5/6 spelling words. ---------------------------------------------------------------
const SATS_WORDS=new Set(['necessary','embarrass','accommodate','definitely','separate','occasionally','rhythm','mischievous','conscience','environment','government','parliament','privilege','recommend','sincerely','vegetable','yacht','foreign','immediately','exaggerate','apparent','bruise','cemetery','committee','correspond','desperate','dictionary','equipment','familiar','guarantee','hindrance','interrupt','leisure','lightning','marvellous','muscle','neighbour','nuisance','persuade','physical','programme','queue','restaurant','sacrifice','secretary','shoulder','signature','soldier','stomach','sufficient','suggest','symbol','system','temperature','thorough','twelfth','variety','vehicle',
 'delicious','ambitious','cautious','nutritious','infectious','spacious','precious','conscious','vicious','gracious','anxious','special','official','artificial','partial','essential','financial','confidential','substantial','initial','social','crucial','independence','obedience','patience','innocence','tolerance','assistance','appearance','observance','hesitant','confident','obedient','patient','independent','tolerant','decent','frequent','innocent','important','dependable','adorable','considerable','enjoyable','reasonable','understandable','horrible','possible','terrible','visible','sensible','incredible','responsible','edible','legible','audible','preferred','preferring','referred','transferred','transferring','reference','preference','conference','offered','offering','suffered','beautiful','argument','beginning','forgetting','knowledge','island','doubt','lamb','thistle','wrist','gnome','honest','whistle','knee','autumn','wrestle','answer','climb','thumb','column','receipt','cupboard','bristle','believe','achieve','receive','ceiling','deceive','perceive','chief','field','piece','niece','thief','friend','weird','seize','protein','caffeine','height','weigh','eight']);
const SILENT={knowledge:'k',island:'s',doubt:'b',lamb:'b',thistle:'t',wrist:'w',gnome:'g',honest:'h',solemn:'n',whistle:'t',knee:'k',autumn:'n',wrestle:'w',answer:'w',climb:'b',thumb:'b',column:'n',receipt:'p',cupboard:'p',bristle:'t'};
SATS_WORDS.add('solemn');
const SATS_HOMOPHONES=[...HOMOPHONES,['principal','principle'],['desert','dessert'],['bare','bear'],['steal','steel'],['guessed','guest'],['morning','mourning'],['serial','cereal']];
const SATS_CONTRACTION={'could not':"couldn't",'it is':"it's",'she will':"she'll",'we have':"we've",'does not':"doesn't",'i would':"I'd",'cannot':"can't",'you are':"you're",'there is':"there's",'let us':"let's"};
const IRREGULAR_PLURAL={child:'children',mouse:'mice',tooth:'teeth',foot:'feet',sheep:'sheep',person:'people',goose:'geese',man:'men',woman:'women'};
const F_TO_VES=['shelf','leaf','loaf','wolf','knife','half','calf','thief','wife','life','elf','scarf'],O_ES=['potato','tomato','hero','echo','volcano'];
function pluralOf(s){if(IRREGULAR_PLURAL[s])return IRREGULAR_PLURAL[s];if(F_TO_VES.includes(s))return s.replace(/fe?$/,'ves');if(O_ES.includes(s))return s+'es';if(/[^aeiou]y$/.test(s))return s.slice(0,-1)+'ies';if(/(s|x|z|ch|sh)$/.test(s))return s+'es';return s+'s';}
const MODALS=['can','could','may','might','must','shall','should','will','would','ought'];
const MODAL_MEANING={possibility:['might','may','could'],certainty:['will','must','shall'],obligation:['must','should','ought'],ability:['can','could']};
const RELATIVE=['who','which','that','whose','whom'],PEOPLE=['teacher','gardener','girl','boy','friend','cousin','man','woman','doctor','pupil','farmer','baker','neighbour','guide','coach','lady','aunt','uncle','child','children','people','hero','heroes'];
const REL_VERBS=['won','lives','runs','made','is','was','has','had','sat','sang','owns','grew','mended','taught','painted','keeps','plays','crosses','stands','works','sells','bakes','helped','rescued'];
const FRONTED_STARTS=['after','before','during','later','soon','suddenly','slowly','quietly','carefully','sadly','without','with','in','on','at','under','beneath','behind','beyond','across','every','last','next','all','as','once','just','early','yesterday','outside','inside','far','high','deep','much','many','long','minutes','moments','hours','meanwhile','however','eventually','finally','first','then','luckily','by','from','that','this','one','two','three'];
const SUBORD=['because','although','though','when','whenever','while','if','unless','until','after','before','since','as','once','so','even','whereas','where','wherever','in'];
const CO=['and','but','or','so','nor','yet'];
const NONSTANDARD=[/\b(we|they|you) was\b/i,/\b(i|we|you|they|he|she) (done|seen|gone)\b/i,/\b(?!Has\b|Have\b|Had\b|Was\b|Were\b|Is\b|Are\b|Been\b)[A-Z][a-z]+ (done|seen|gone)\b/,/\b(could|should|would|might|must) of\b/i,/\bthem [a-z]+s\b/i,/\b(didn't|don't|never|can't|couldn't|won't|haven't|hasn't|isn't|wasn't) [a-z' ]*\b(nothing|nowhere|nobody|no one|none)\b/i,/\bain't\b/i,/\b(he|she|it) don't\b/i,/\b(we|they|you) (is|has)\b/i,/\bI is\b/,/\bmore (better|worse|bigger|smaller|faster|slower|taller|shorter|easier|harder)\b/i,/\bmost (biggest|best|fastest|smallest)\b/i,/\b(goed|runned|writed|gived|taked|catched|bringed|doed|thinked|buyed|teached|comed|swimmed|hitted)\b/i,/\b(have|has|had) (did|went|saw|ate|wrote|took|ran|came|sang|drank|began|broke|chose|drove|fell|flew|forgot|gave|grew|knew|rode|rang|spoke|swam|threw|wore)\b/i,/\b(me|him|her|them|us) (and|or) (i|me|him|her|them|us|[a-z]+) (went|was|were|are|like|played|have|had)\b/i,/^(me|him|her|them|us) (and [a-z]+ )?(went|was|were|are|like|played)/i,/\b(that|this) (there|here)\b/i,/^us (was|were|are|is)\b/i];
const BASE_VERBS=['be','wear','go','stay','arrive','bring','leave','attend','wait','remain','finish','hand','keep','take','come','sit','meet','listen','practise','return','rest','stand','write','read','help','start','stop','walk','run','tidy','send','pay'];
const subjunctiveOf=(s)=>/\b(if|wish|wished|as though|as if)\b[^.,;]*\b(i|he|she|it|[a-z]+) were\b/i.test(s)||new RegExp(`\\b(insist|insists|insisted|suggest|suggests|suggested|recommend|recommends|recommended|demand|demands|demanded|request|requests|requested|propose|proposed|ask|asked|essential|vital|important|necessary|crucial) that (?:[a-z]+ ){1,3}(?:${BASE_VERBS.join('|')})\\b`,'i').test(s);
const SATS_PAST=new Set(['rang','hurried','ran','walked','sang','ate','went','saw','came','jumped','laughed','shouted','played','waited','opened','closed','cheered','scored','finished','started','wrote','read','made','took','gave','found','lost','won','fell','sat','stood','left','arrived','rested','packed','carried','crossed','climbed','thanked','marched']);
const SATS_PRESENT=new Set(['rings','hurry','hurries','runs','run','walks','walk','sings','sing','eats','eat','goes','go','sees','see','comes','come','jumps','jump','laughs','laugh','shouts','shout','plays','play','waits','wait','opens','open','closes','close','cheers','cheer','scores','score','finishes','finish','starts','start','writes','write','reads','makes','make','takes','take','gives','give','finds','find','loses','lose','wins','win','falls','fall','sits','sit','stands','stand','leaves','leave','arrives','arrive','rests','rest','packs','pack','carries','carry','crosses','cross','climbs','climb','thanks','thank','marches','march']);
const satsTime=(p)=>{const w=p.toLowerCase().split(/\s+/),f=w[0];if(f==='will'||f==='shall')return 'future';if(['was','were','had','did'].includes(f)||(w.length===1&&SATS_PAST.has(f)))return 'past';if(['is','are','am','has','have','does','do'].includes(f)||(w.length===1&&SATS_PRESENT.has(f)))return 'present';return 'unknown';};
const FORMAL={buy:['purchase'],ask:['request','enquire'],help:['assist'],get:['receive','obtain'],'find out':['discover'],start:['commence','begin'],need:['require'],'put off':['postpone'],'think about':['consider'],kids:['children'],tell:['inform'],'loads of':['numerous','many'],sorry:['apologise'],about:['approximately'],let:['permit','allow'],try:['attempt'],end:['conclude'],'go up':['rise','increase'],big:['large','considerable'],fix:['repair']};
const SYN={enormous:['huge','gigantic','massive','vast','immense'],ancient:['old','aged','antique'],begin:['start','commence'],brave:['courageous','fearless','bold'],quick:['fast','rapid','swift','speedy'],afraid:['scared','frightened','terrified']};
const ANT={ancient:['modern','new','recent'],enormous:['tiny','minute','small'],brave:['cowardly','timid'],quick:['slow'],generous:['mean','selfish'],noisy:['quiet','silent']};
const LY_ADJ=['friendly','lonely','lovely','silly','ugly','early','daily','likely','lively','jolly','elderly','curly'];
const ADVERBS={time:['soon','later','now','often','always','never','already','still','yet','afterwards','sometimes','earlier','recently','today','immediately','then','finally'],place:['here','there','everywhere','upstairs','downstairs','outside','inside','nearby','away','abroad','indoors','outdoors','somewhere','underneath','overhead','ahead','home']};
const mannerAdverb=(w)=>(/ly$/.test(w)&&!LY_ADJ.includes(w))||['well','fast','hard'].includes(w);
const COMMA_KEY={fronted:/fronted adverbial/i,list:/\blist\b/i,parenthesis:/extra information|parenthesis/i,address:/spoken to|being addressed|talking to/i,subordinate:/subordinate clause/i};
const MARK_KEY={list:/\blist\b/i,explanation:/explain|explanation|reason/i,clauses:/two (closely linked |linked )?(main )?clauses|join/i,extra:/extra information|parenthesis/i,afterthought:/afterthought|surprise|pause|dramatic/i};
const esc=(s)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const {NAMES:KIT_NAMES}=require(path.join(dir,'bank-kit.cjs'));
const wrongOf=(q)=>q.options.filter(o=>!q.answers.includes(o));
const inText=(s,w)=>new RegExp(`(^|[^A-Za-z'])${esc(w)}(?=$|[^A-Za-z'])`).test(s);
Object.assign(CHECK,{
 subjectObject(a,q){const toks=checkTags(a,q),isV=(t)=>is(t.tag,'verb');const v0=toks.findIndex(isV);if(v0<0)return fail(q.id,'no verb in the tagged sentence');
  let v1=v0;while(v1+1<toks.length&&(isV(toks[v1+1])||(toks[v1+1].tag==='adv'&&toks[v1+2]&&isV(toks[v1+2]))))v1++;
  let s0=0;for(let i=v0-1;i>=0;i--)if(toks[i].w===','){s0=i+1;break;}
  const subj=toks.slice(s0,v0).filter(t=>!PUNCT.test(t.w));while(subj.length&&subj[0].tag==='adv')subj.shift();
  const NP=(t)=>['det','adj','noun','pron'].some(c=>is(t.tag,c));let o1=v1+1;while(o1<toks.length&&NP(toks[o1]))o1++;const obj=toks.slice(v1+1,o1);
  const want=a.role==='subject'?subj:obj,phrase=plain(want);if(!want.length)return fail(q.id,`no ${a.role} found by the tags`);
  if(phrase.toLowerCase()!==(single(q)??'').toLowerCase())fail(q.id,`${a.role} by the tags is "${phrase}", answer ${q.answers}`);
  for(const o of q.options)if(!q.stimulus.includes(o))fail(q.id,`option "${o}" is not in the sentence`);},
 nounPhrase(a,q){const toks=checkTags(a,q),NP=(t)=>['det','adj','noun','prep'].some(c=>is(t.tag,c));const spans=[];let i=0;
  while(i<toks.length){if(!NP(toks[i])){i++;continue;}let j=i;while(j<toks.length&&NP(toks[j]))j++;const span=toks.slice(i,j);while(span.length&&span[0].tag==='prep')span.shift();if(span.length)spans.push(span);i=j;}
  const expanded=spans.filter(s=>s.some(t=>is(t.tag,'noun'))&&s.some(t=>is(t.tag,'adj')||t.tag==='prep')).map(plain);
  if(expanded.length!==1||expanded[0].toLowerCase()!==(single(q)??'').toLowerCase())fail(q.id,`expanded noun phrases by the tags: ${expanded}, answer ${q.answers}`);},
 wordClass(a,q){for(const o of q.options){const t=a.tagged[o];if(!t){fail(q.id,`no tagged sentence for "${o}"`);continue;}const toks=parse(t);if(plain(toks)!==o)fail(q.id,`"${o}" is not the tagged sentence "${plain(toks)}"`);
  for(const tok of toks){if(PUNCT.test(tok.w))continue;if(!CLASSES.includes(tok.tag))fail(q.id,`"${tok.w}" has unknown class "${tok.tag}"`);const f=FIXED[tok.w.toLowerCase()];if(f&&!is(tok.tag,f)&&!(f==='prep'&&tok.tag==='other'))fail(q.id,`"${tok.w}" tagged ${tok.tag}, expected ${f}`);}
  const hits=toks.filter(tok=>tok.w.toLowerCase()===a.word);if(hits.length!==1){fail(q.id,`"${a.word}" appears ${hits.length} times in "${o}"`);continue;}
  const match=is(hits[0].tag,a.cls);if(match!==(o===single(q)))fail(q.id,`"${a.word}" is tagged ${hits[0].tag} in "${o}"`);}},
 modal(a,q){const modalOf=(o)=>o.toLowerCase().split(/[^a-z']+/).find(x=>MODALS.includes(x));
  if(a.meaning){const set=MODAL_MEANING[a.meaning];if(!set)return fail(q.id,`unknown modal meaning ${a.meaning}`);for(const o of q.options)if(!modalOf(o))fail(q.id,`"${o}" has no modal verb`);
   const hits=q.options.filter(o=>set.includes(modalOf(o)));if(hits.length!==1||hits[0]!==single(q))fail(q.id,`${a.meaning} options: ${hits}, answer ${q.answers}`);}
  else{for(const x of q.answers)if(!MODALS.includes(x.toLowerCase()))fail(q.id,`"${x}" is not a modal verb`);for(const o of q.options){if(!inText(q.stimulus,o))fail(q.id,`"${o}" is not in the sentence`);if(!q.answers.includes(o)&&MODALS.includes(o.toLowerCase()))fail(q.id,`"${o}" is also a modal verb`);}}},
 relative(a,q){const ans=single(q)??'';
  if(a.full){if(q.stimulus.replace('___',ans)!==a.full)fail(q.id,`"${q.stimulus}" filled with ${ans} is not "${a.full}"`);const gap=q.stimulus.indexOf('___');
   const before=q.stimulus.slice(0,gap).trim().split(' ').pop().toLowerCase(),after=(a.full.slice(gap+ans.length).trim().split(' ')[0]??'').replace(/[^a-z]/gi,'').toLowerCase();
   const person=PEOPLE.includes(before)||KIT_NAMES.map(n=>n.toLowerCase()).includes(before);const ok=REL_VERBS.includes(after)?(person?['who','that']:['which','that']):['whose'];
   if(!ok.includes(ans))fail(q.id,`by the test's rule the gap takes ${ok}, answer ${ans}`);for(const o of wrongOf(q))if(ok.includes(o))fail(q.id,`"${o}" also fits the gap`);}
  else if(a.clause){if(!RELATIVE.includes(ans.split(' ')[0].toLowerCase()))fail(q.id,`"${ans}" does not start with a relative pronoun`);if(!new RegExp(esc(ans)+'[,.]').test(q.stimulus))fail(q.id,'the clause does not run to a comma or full stop');
   for(const o of wrongOf(q))if(RELATIVE.includes(o.split(' ')[0].toLowerCase())&&new RegExp(esc(o)+'[,.]').test(q.stimulus))fail(q.id,`"${o}" is also a relative clause`);}
  else{if(!RELATIVE.includes(ans.toLowerCase()))fail(q.id,`"${ans}" is not a relative pronoun`);for(const o of q.options){if(!inText(q.stimulus,o))fail(q.id,`"${o}" is not in the sentence`);if(!q.answers.includes(o)&&RELATIVE.includes(o.toLowerCase()))fail(q.id,`"${o}" is also a relative pronoun`);}}},
 fronted(a,q){const ans=single(q)??'',first=ans.split(' ')[0].toLowerCase();if(!FRONTED_STARTS.includes(first))fail(q.id,`"${ans}" does not start with an adverbial word the test knows`);
  if(!q.stimulus.startsWith(ans+','))fail(q.id,'the adverbial is not at the front followed by a comma');for(const o of wrongOf(q))if(q.stimulus.startsWith(o+','))fail(q.id,`"${o}" is also at the front`);},
 clause(a,q){const s=q.stimulus,sub=a.sub;if(!s.includes(sub))return fail(q.id,`"${sub}" is not in the sentence`);if(!SUBORD.includes(sub.split(' ')[0].toLowerCase()))fail(q.id,`"${sub}" does not start with a subordinating conjunction`);
  const main=s.replace(sub,'').replace(/[,.!?]/g,'').replace(/\s+/g,' ').trim(),want=a.role==='main'?main:sub;if(!main)fail(q.id,'no main clause left');
  if((single(q)??'').toLowerCase()!==want.toLowerCase())fail(q.id,`${a.role} clause is "${want}", answer ${q.answers}`);for(const o of wrongOf(q))if(o.toLowerCase()===want.toLowerCase())fail(q.id,`"${o}" is also the ${a.role} clause`);},
 conjType(a,q){const set=a.type==='co'?CO:SUBORD;for(const x of q.answers)if(!set.includes(x.toLowerCase()))fail(q.id,`"${x}" is not a ${a.type} conjunction the test knows`);
  for(const o of q.options){if(!inText(q.stimulus,o))fail(q.id,`"${o}" is not in the sentence`);if(!q.answers.includes(o)&&set.includes(o.toLowerCase()))fail(q.id,`"${o}" is also a ${a.type} conjunction`);}},
 consistent(a,q){for(const o of q.options){const ps=a.phrases[o];if(!ps){fail(q.id,`no verb phrases for "${o}"`);continue;}for(const p of ps)if(!o.includes(p))fail(q.id,`"${p}" is not in "${o}"`);
  const times=new Set(ps.map(satsTime));if(times.has('unknown'))fail(q.id,`unknown tense in ${ps}`);const ok=times.size===1;if(ok!==(o===single(q)))fail(q.id,`"${o}" ${ok?'is':'is not'} consistent`);}},
 standard(a,q){const fill=(o)=>a.full?q.stimulus.replace('___',o):o,bad=(s)=>NONSTANDARD.some(r=>r.test(s));if(a.full&&fill(single(q))!==a.full)fail(q.id,`"${q.stimulus}" filled with ${q.answers} is not "${a.full}"`);
  if(bad(fill(single(q))))fail(q.id,'the answer breaks a standard English rule the test knows');for(const o of wrongOf(q))if(!bad(fill(o)))fail(q.id,`"${fill(o)}" breaks no rule the test knows`);},
 subjunctive(a,q){const fill=(o)=>a.full?q.stimulus.replace('___',o):o;if(a.full&&fill(single(q))!==a.full)fail(q.id,`"${q.stimulus}" filled with ${q.answers} is not "${a.full}"`);
  if(!subjunctiveOf(fill(single(q))))fail(q.id,'the answer is not a subjunctive form the test knows');for(const o of wrongOf(q))if(subjunctiveOf(fill(o)))fail(q.id,`"${fill(o)}" is also subjunctive`);},
 formal(a,q){const set=FORMAL[a.informal];if(!set)return fail(q.id,`no formal words for ${a.informal}`);if(!inText(q.stimulus,a.informal))fail(q.id,`"${a.informal}" is not in the sentence`);
  if(!set.includes(single(q)))fail(q.id,`${q.answers} is not a formal word for ${a.informal}`);const all=new Set(Object.values(FORMAL).flat());for(const o of wrongOf(q))if(all.has(o))fail(q.id,`"${o}" is also a formal word`);},
 synonym(a,q){const set=SYN[a.word];if(!set)return fail(q.id,`no synonyms for ${a.word}`);if(!inText(q.stimulus,a.word))fail(q.id,`"${a.word}" is not in the sentence`);if(!set.includes(single(q)))fail(q.id,`${q.answers} is not a synonym of ${a.word}`);for(const o of wrongOf(q))if(set.includes(o))fail(q.id,`"${o}" is also a synonym`);},
 antonym(a,q){const set=ANT[a.word];if(!set)return fail(q.id,`no antonyms for ${a.word}`);if(!inText(q.stimulus,a.word))fail(q.id,`"${a.word}" is not in the sentence`);if(!set.includes(single(q)))fail(q.id,`${q.answers} is not an antonym of ${a.word}`);for(const o of wrongOf(q))if(set.includes(o))fail(q.id,`"${o}" is also an antonym`);},
 advType(a,q){const isType=(x)=>a.type==='manner'?mannerAdverb(x):(ADVERBS[a.type]??[]).includes(x);if(!isType(single(q)))fail(q.id,`${q.answers} is not an adverb of ${a.type} the test knows`);
  for(const o of q.options){if(!inText(q.stimulus,o))fail(q.id,`"${o}" is not in the sentence`);if(!q.answers.includes(o)&&isType(o))fail(q.id,`"${o}" is also an adverb of ${a.type}`);}},
 parenthesis(a,q){const toks=checkTags(a,q),words=toks.filter(t=>!PUNCT.test(t.w));
  const find=(s)=>{const n=s.split(' ').length;for(let i=0;i+n<=words.length;i++)if(plain(words.slice(i,i+n))===s)return [i,i+n];return null;};
  const judge=(s)=>{const sp=find(s);if(!sp)return 'not in the sentence';const [i,j]=sp;if(i===0||j===words.length)return 'includes the start or the end of the sentence';
   const span=words.slice(i,j),rest=[...words.slice(0,i),...words.slice(j)],v=rest.findIndex(t=>is(t.tag,'verb'));if(v<0)return 'leaves no verb';
   if(!rest.slice(0,v).some(t=>is(t.tag,'noun')||is(t.tag,'pron')))return 'leaves no subject before the verb';
   if(span.some((t,k)=>k>0&&is(t.tag,'verb'))&&!is(span[0].tag,'pron.rel'))return 'contains a verb but does not begin with a relative pronoun';
   if(!['pron.rel','det','adj','verb','adv','prep'].some(c=>is(span[0].tag,c)))return 'does not begin like extra information';
   if(!(is(words[i-1].tag,'noun')||is(words[i-1].tag,'pron')))return 'does not follow a noun';return null;};
  const r=judge(single(q)??'');if(r)fail(q.id,`"${q.answers}": ${r}`);for(const o of wrongOf(q))if(!judge(o))fail(q.id,`"${o}" could also be the extra information`);},
 markRole(a,q){const s=q.stimulus,m=a.mark;if(!s.includes(m))return fail(q.id,`no ${m} in the sentence`);let role;
  if(m===':')role=/,[^:]* (and|or) /.test(s.slice(s.indexOf(':')+1))?'list':'explanation';else if(m===';')role=(s.match(/;/g)??[]).length>=2?'list':'clauses';else if(m==='–')role=(s.match(/–/g)??[]).length===2?'extra':'afterthought';else if(m==='(')role='extra';else return fail(q.id,`unknown mark ${m}`);
  if(!MARK_KEY[role].test(single(q)??''))fail(q.id,`the ${m} is used for ${role}, answer ${q.answers}`);for(const o of wrongOf(q))if(MARK_KEY[role].test(o))fail(q.id,`"${o}" also describes ${role}`);},
 commaWhy(a,q){const s=q.stimulus;let ok=false;
  if(a.reason==='fronted')ok=s.startsWith(a.adverbial+',')&&FRONTED_STARTS.includes(a.adverbial.split(' ')[0].toLowerCase())&&!/\b(i|we|you|he|she|they|it)\b/i.test(a.adverbial);
  else if(a.reason==='subordinate')ok=s.startsWith(a.clause+',')&&SUBORD.includes(a.clause.split(' ')[0].toLowerCase());
  else if(a.reason==='list')ok=a.items.length>=3&&s.includes(a.items.slice(0,-1).join(', ')+' and '+a.items.at(-1));
  else if(a.reason==='parenthesis'){const rest=s.replace(', '+a.extra+',',' ').replace(/\s+/g,' ');ok=s.includes(', '+a.extra+',')&&/^[A-Z]/.test(rest)&&/[.!?]$/.test(rest);}
  else if(a.reason==='address')ok=KIT_NAMES.includes(a.name)&&new RegExp(`(^|, )${a.name}(,|[.?!]$)`).test(s);
  else return fail(q.id,`unknown comma reason ${a.reason}`);
  if(!ok)fail(q.id,`the sentence does not show a ${a.reason} comma as the note says`);if(!COMMA_KEY[a.reason].test(single(q)??''))fail(q.id,`answer ${q.answers} does not describe a ${a.reason} comma`);for(const o of wrongOf(q))if(COMMA_KEY[a.reason].test(o))fail(q.id,`"${o}" also describes a ${a.reason} comma`);},
 bullets(a,q){const consistent=(o)=>{const items=o.split('•').map(x=>x.trim()).filter(Boolean);if(items.length<2)return false;return items.every(x=>/^[A-Z]/.test(x)&&/\.$/.test(x))||items.every(x=>/^[a-z]/.test(x)&&!/[.;,]$/.test(x));};
  if(!consistent(single(q)??''))fail(q.id,'the answer is not a consistent list');for(const o of wrongOf(q))if(consistent(o))fail(q.id,`"${o}" is also consistent`);},
 satsContraction(a,q){const c=SATS_CONTRACTION[a.full.toLowerCase()];if(!c)fail(q.id,`no contraction for ${a.full}`);else if((single(q)??'').toLowerCase()!==c.toLowerCase())fail(q.id,`contraction of ${a.full} is ${c}, answer ${q.answers}`);},
 satsSpelling(a,q){if(single(q)!==a.word||!SATS_WORDS.has(a.word))fail(q.id,`${q.answers} is not the listed spelling ${a.word}`);for(const o of wrongOf(q))if(SATS_WORDS.has(o)||WORDS.has(o))fail(q.id,`"${o}" is also a real word`);},
 satsEnding(a,q){const made=a.stem+(single(q)??'').replace('-','');if(made!==a.word||!SATS_WORDS.has(made))fail(q.id,`${a.stem} + ${q.answers} = ${made}`);for(const o of wrongOf(q)){const x=a.stem+o.replace('-','');if(SATS_WORDS.has(x)||WORDS.has(x))fail(q.id,`option ${o} also makes a real word`);}},
 satsSuffix(a,q){const made=addSuffix(a.root,a.suffix,a.rule);if(made!==single(q))fail(q.id,`${a.root} + ${a.suffix} (${a.rule}) = ${made}, answer ${q.answers}`);if(!SATS_WORDS.has(made))fail(q.id,`${made} is not in the test's word list`);for(const o of wrongOf(q))if(SATS_WORDS.has(o)||WORDS.has(o))fail(q.id,`"${o}" is also a real word`);},
 silent(a,q){if(single(q)!==a.word||!SATS_WORDS.has(a.word))fail(q.id,`${q.answers} is not the listed spelling ${a.word}`);if(SILENT[a.word]!==a.letter)fail(q.id,`the silent letter of ${a.word} is ${SILENT[a.word]}, note says ${a.letter}`);
  const dropped=a.word.replace(a.letter,'');if(!wrongOf(q).includes(dropped))fail(q.id,`the spelling without the silent letter (${dropped}) is not among the wrong options`);for(const o of wrongOf(q))if(SATS_WORDS.has(o)||WORDS.has(o))fail(q.id,`"${o}" is also a real word`);},
 ieRule(a,q){const word=a.word;if(single(q)!==word||!SATS_WORDS.has(word))fail(q.id,`${q.answers} is not the listed spelling ${word}`);const m=/(c?)(ie|ei)/.exec(word);if(!m)return fail(q.id,`${word} has no ie or ei`);
  const expected=m[1]==='c'?'ei':'ie';if(!['weird','seize','protein','caffeine','height','weigh','eight','their','foreign','leisure','neighbour'].includes(word)&&m[2]!==expected)fail(q.id,`${word} breaks the i-before-e rule`);
  const swapped=word.replace(m[2],m[2]==='ie'?'ei':'ie');if(!wrongOf(q).includes(swapped))fail(q.id,`the swapped spelling (${swapped}) is not among the wrong options`);for(const o of wrongOf(q))if(SATS_WORDS.has(o)||WORDS.has(o))fail(q.id,`"${o}" is also a real word`);},
 plural(a,q){const p=pluralOf(a.singular);if(single(q)!==p)fail(q.id,`plural of ${a.singular} is ${p}, answer ${q.answers}`);if(!new RegExp(`\\b${esc(a.singular)}\\b`).test(q.prompt))fail(q.id,`the prompt does not name ${a.singular}`);for(const o of wrongOf(q))if(o===p)fail(q.id,'the plural appears twice');},
 satsGap(a,q){if(q.stimulus.replace('___',single(q))!==a.full)fail(q.id,`"${q.stimulus}" filled with ${q.answers} is not "${a.full}"`);const set=SATS_HOMOPHONES.find(s=>s.includes(single(q).toLowerCase()));
  if(!set)fail(q.id,`${q.answers} is not in the test's homophone list`);else if(!q.options.some(o=>o!==single(q)&&set.includes(o.toLowerCase())))fail(q.id,'no homophone among the wrong options');},
});

for(const a of englishAudit){const q=byId.get(a.id);if(!q)continue;const check=CHECK[a.kind];if(!check){fail(a.id,`unknown audit kind ${a.kind}`);continue;}try{check(a,q);}catch(e){fail(a.id,`${a.kind} check crashed: ${e.message}`);}}

// ---- Punctuation linters ------------------------------------------------------------------------------------------------------
// For proofreading, INCORRECTLY and 'which is correct' questions about sentence punctuation and direct speech, the test lints
// every choice with its own rules: the answer must be the only choice that breaks a rule (INCORRECTLY), or the only one
// that breaks none. Names come from the shared class list plus the other names these questions use.
const {NAMES}=require(path.join(dir,'bank-kit.cjs'));
const NAME_SET=new Set([...NAMES,'Oscar','Ellie','Pepper'].map(n=>n.toLowerCase()));
const DAYS=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],MONTHS=['january','february','march','april','may','june','july','august','september','october','november','december'];
const LANGS=['french','welsh','spanish','english'],PLACES=['bristol','cardiff','wales','scotland','edinburgh','whitby','snowdon','falmouth','leeds','london'],TITLES=['mr','mrs','miss','dr','aunt','uncle'];
const PROPER=new Set([...DAYS,...MONTHS,...LANGS,...PLACES,...NAME_SET,'ahmed','ruth','meg','grandma','grandpa','jones']);
const QUESTION_START=['where','when','who','why','which','whose','is','are','was','were','do','does','did','have','has','can','could','will','would','shall','should','may','might'];
function sentenceLint(text){const v=[];
 for(const s of text.split(/(?<=[.!?])\s+/)){
  if(!/^[A-Z]/.test(s))v.push('no capital letter at the start');if(!/[.!?]$/.test(s))v.push('no end mark');
  const words=s.replace(/[^A-Za-z' ]/g,' ').split(/\s+/).filter(Boolean);
  words.forEach((w,i)=>{const lw=w.toLowerCase();
   if(w==='i')v.push('I needs a capital letter');
   if(PROPER.has(lw)&&/^[a-z]/.test(w))v.push(`${w} needs a capital letter`);
   if(TITLES.includes(lw)&&/^[a-z]/.test(w)&&/^[A-Z]/.test(words[i+1]??''))v.push(`the title ${w} needs a capital letter`);
   if(i>0&&/^[A-Z]/.test(w)&&w!=='I'&&!PROPER.has(lw)&&!TITLES.includes(lw))v.push(`${w} should not have a capital letter`);});
  const first=(words[0]??'').toLowerCase(),exclamation=/^What an? /.test(s),question=QUESTION_START.includes(first)||(first==='how'&&!/!$/.test(s))||(first==='what'&&!exclamation);
  if(exclamation&&!s.endsWith('!'))v.push('an exclamation needs an exclamation mark');
  if(question&&!s.endsWith('?'))v.push('a question needs a question mark');
  if(s.endsWith('?')&&!question)v.push('only a direct question ends with a question mark');}
 return v;}
function speechLint(s){const v=[],at=[...s].flatMap((c,i)=>c==='"'?[i]:[]);
 if(!at.length)return ['no inverted commas'];if(at.length%2)return ['inverted commas do not come in pairs'];
 const outside=s.split('"').filter((_,i)=>i%2===0).join(' ');if(/[?!]/.test(outside))v.push('? or ! outside the spoken words');
 let prevEnd=null;
 for(let k=0;k<at.length;k+=2){const o=at[k],c=at[k+1],spoken=s.slice(o+1,c),before=s.slice(0,o),after=s.slice(c+1),last=spoken.at(-1);
  if(!/[,.!?]/.test(last))v.push('the spoken words must end with a mark inside the inverted commas');
  if(after&&!/^ [A-Za-z]/.test(after))v.push('a mark straight after the closing inverted commas');
  const verbAfter=/^ [a-z]/.test(after)?after.trim().split(/\s+/)[0]:null,verbBefore=before.match(/\b([a-z]+), $/)?.[1];
  if(verbAfter&&last==='.')v.push('a full stop before the reporting clause');
  if(o>0&&!/, $/.test(before)&&!/[.!?] $/.test(before))v.push('no comma before the opening inverted commas');
  const continuing=o>0&&/, $/.test(before)&&prevEnd===',',start=spoken.trim()[0];
  if(continuing&&/[A-Z]/.test(start)&&!/^I\b/.test(spoken))v.push('a split sentence carries on with a small letter');
  if(!continuing&&/[a-z]/.test(start))v.push('spoken words start with a capital letter');
  if((verbAfter??verbBefore)==='asked'&&last!=='?')v.push('a spoken question needs a question mark');
  prevEnd=last;}
 if(!/[.!?]"?$/.test(s))v.push('no end mark');
 for(const w of s.match(/\b[a-z]+\b/g)??[])if(NAME_SET.has(w))v.push(`the name ${w} needs a capital letter`);
 return v;}
let linted=0;
for(const a of englishAudit){const q=byId.get(a.id);if(!q)continue;
 const lint=q.topic==='en-speech'?speechLint:q.topic==='en-sentence-punctuation'?sentenceLint:null;if(!lint)continue;
 const cards=q.visual?.kind==='cards'?q.visual.cards.map(c=>c.text):null;
 if(!(a.kind==='fixes'||(a.kind==='proof'&&cards)))continue;
 const shown=cards??q.options,answer=cards?q.options.indexOf(single(q)):shown.indexOf(single(q)),incorrect=a.kind==='fixes'&&a.want==='incorrect';
 linted++;shown.forEach((s,i)=>{const broken=lint(s),should=incorrect?i===answer:i!==answer;if((broken.length>0)!==should)fail(q.id,`${lint.name}: "${s}" ${broken.length?'breaks a rule ('+broken.join('; ')+')':'breaks no rule'}, but it ${i===answer?'is':'is not'} the answer`);});}

// ---- Helpsheets never contain a question or its answer ---------------------------------------------------------------------
const norm=(s)=>s.toLowerCase().replace(/\*\*/g,'').replace(/\s+/g,' ');
for(const t of topics){const h=t.helpsheet,sheet=norm([h.intro,...h.steps,...(h.example?.lines??[]),h.example?.title??'',...(h.tips??[])].join(' '));
 for(const q of qs.filter(q=>q.topic===t.id)){const bits=[q.stimulus,...q.answers.filter(a=>a.length>=25)].filter(s=>s&&s.length>=20);for(const b of bits)if(sheet.includes(norm(b)))fail(t.id,`helpsheet contains "${b}" from ${q.id}`);}}

const withNotes=qs.filter(q=>noted.has(q.id)).length;
console.log(`English: ${qs.length} questions in ${topics.length} topics; ${englishAudit.length} audit notes cover ${withNotes} questions; ${texts.size} passages; ${linted} punctuation questions linted choice by choice.`);
if(fails.length){console.log(`FAIL: ${fails.length} problem(s)`);fails.slice(0,100).forEach(f=>console.log(' -',f));process.exit(1);}
console.log('PASS: English answers re-checked from the tags, corrected texts, verb tables, spelling rules and passage evidence.');
