import {user,json,readWorld,mutate,requireOrigin,type World} from '@/lib/world';
import {questionById,publicQuestion,toViewer} from '@/lib/questions';
import {schoolLockResponse} from '@/lib/school-lock-guard';
// Open question reports come with the answer and explanation, because only the teacher sees them.
// The question is shown in the choice order the pupil saw, so a note such as "C is also right" matches the letters.
const openReports=(reports:World['reports']=[])=>reports.filter(r=>!r.resolvedAt).slice(-50).reverse().map(r=>{const q=questionById.get(r.question);return {...r,question:q?{...publicQuestion(q,undefined,r.owner),answers:toViewer(q,r.owner,q.answers),explanation:q.explanation}:null}});
export async function GET(req:Request){try{const closed=schoolLockResponse();if(closed)return closed;if(await user(req)!=='teacher')return json({error:'Teacher sign-in required.'},403);const {w}=await readWorld();return json({pupils:Object.entries(w.players).map(([id,p])=>({id,yearGroup:p.assignedYear===2?2:6,name:p.name,correct:p.correct,incorrect:p.incorrect,coins:p.coins,refund:p.reserveRefund?.coins??0,subjects:p.subjects,hero:p.hero,heroLocked:p.heroLocked})),wave:w.wave,reports:openReports(w.reports)})}catch{return json({error:'The class register is temporarily unavailable.'},503)}}

export async function POST(req:Request){try{const closed=schoolLockResponse();if(closed)return closed;requireOrigin(req);if(await user(req)!=='teacher')return json({error:'Teacher sign-in required.'},403);const b:any=await req.json();
 if(b.action==='resolve_report'){await mutate(w=>{const r=w.reports?.find(r=>r.id===b.id);if(!r)throw new Error('That report has gone.');r.resolvedAt??=Date.now();});return json({ok:true});}
 if(b.action!=='set_year'||![2,6].includes(b.year))return json({error:'Choose Year 2 or Year 6.'},400);await mutate(w=>{const p=w.players[b.id];if(!p)throw new Error('Pupil not found.');if((p.assignedYear??6)!==b.year){p.assignedYear=b.year;delete p.active;delete p.mock;} });return json({ok:true});}catch(e){return json({error:e instanceof Error?e.message:'Unable to save.'},400)}}
