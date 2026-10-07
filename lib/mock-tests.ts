import {questions,questionById,publicQuestion,answerMatches,answerText,toCanonical,toViewer,type Question} from './questions';
import {matchesYear,assignedYear,QUESTION_REST} from './question-policy';
import {rewardHelpers} from './friend-help';
import {topicById} from './bank';
import type {Player} from './world';
import {mockSize,MOCK_GRACE,MOCK_COOLDOWN} from './mock-config';
export {MOCK_GRACE,MOCK_COOLDOWN};
// Timed mock tests, like a real entrance paper: a set of questions from one subject, answered in any order before the time runs out,
// then marked together. Marking follows the usual rules: correct answers retire, wrong answers go to the mistake notebook with the
// answer hidden, and unanswered questions simply rest for 24 hours. Coins are paid only for a completed test: every question answered,
// whether the pupil finishes or the clock runs out. A test with any question left blank still shows its marks but pays nothing.
// Mocks do not count towards rounds.
export const mockConfig=(p:Player,subject:string)=>mockSize(assignedYear(p),subject);
export type MockState={id:string;subject:string;ids:string[];answers:Record<string,string|string[]>;flags:string[];startedAt:number;endsAt:number};
export type MockResult={id:string;subject:string;at:number;seconds:number;total:number;score:number;coins:number;unanswered?:number;topics:{title:string;correct:number;total:number}[];items:{id:string;correct:boolean;answered:boolean}[]};
const ready=(p:Player,q:Question,now:number)=>{const h=p.history[q.id];return !h||(!h.correct&&now-h.at>=QUESTION_REST);};
/** Fresh questions first, spread across the subject's topics in turn, then rested ones if the subject is running low. */
export function pickMock(p:Player,subject:string,count:number,now:number,random=Math.random):Question[]{
 const pool=questions.filter(q=>q.subject===subject&&!q.legacy&&matchesYear(p,q)&&q.id!==p.active?.id&&ready(p,q,now)),fresh=pool.filter(q=>!p.history[q.id]),rested=pool.filter(q=>p.history[q.id]);
 const shuffle=<T,>(xs:T[])=>{const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const spread=(list:Question[])=>{const groups=new Map<string,Question[]>();for(const q of shuffle(list)){const k=q.topic??q.id;if(!groups.has(k))groups.set(k,[]);groups.get(k)!.push(q);}const order=shuffle([...groups.values()]),out:Question[]=[];while(order.some(g=>g.length))for(const g of order)if(g.length)out.push(g.pop()!);return out;};
 return [...spread(fresh),...spread(rested)].slice(0,count);
}
export function publicMock(m:MockState,viewer:string){return {id:m.id,subject:m.subject,startedAt:m.startedAt,endsAt:m.endsAt,answers:m.answers,flags:m.flags,questions:m.ids.map(id=>publicQuestion(questionById.get(id)!,undefined,viewer))};}
const hasAnswer=(given:string|string[]|undefined)=>given!==undefined&&(Array.isArray(given)?given.length>0:given!=='');
/** Marks a mock (on time or late) and applies it to the pupil. Returns the result and the helpers to thank. */
export function gradeMock(players:Record<string,Player>,p:Player,viewer:string,now=Date.now()){
 const m=p.mock!,items:MockResult['items']=[],thanked:string[]=[],topics=new Map<string,{title:string;correct:number;total:number}>(),unanswered=m.ids.filter(id=>!hasAnswer(m.answers[id])).length,complete=unanswered===0;let score=0,coins=0;
 p.mistakes??={};p.subjects[m.subject]??={correct:0,incorrect:0};
 for(const id of m.ids){const q=questionById.get(id);if(!q)continue;const given=m.answers[id],answered=hasAnswer(given),correct=answered&&answerMatches(q,toCanonical(q,viewer,given!));
  const t=q.topic?topicById.get(q.topic):undefined,k=t?.title??q.subject,row=topics.get(k)??{title:k,correct:0,total:0};row.total++;if(correct)row.correct++;topics.set(k,row);
  items.push({id,correct,answered});
  if(!answered){p.history[id]={correct:false,at:now,attempted:false};continue;}
  p.history[id]={correct,at:now,attempted:true};p.subjects[m.subject][correct?'correct':'incorrect']++;
  // Correct answers retire either way, but only a completed test pays (and counts towards the class wave).
  if(correct){score++;p.correct++;if(complete){coins+=q.reward??20;p.waveAnswers++;}const mistake=p.mistakes[id];if(mistake&&!mistake.correctedAt){mistake.correctedAt=now;thanked.push(...rewardHelpers(players,mistake.help));}}
  else{p.incorrect++;const old=p.mistakes[id];p.mistakes[id]={...old,attempts:(old?.attempts??0)+1,lastWrongAt:now,lastAnswer:answerText(given!)};}
 }
 p.coins+=coins;
 const result:MockResult={id:m.id,subject:m.subject,at:now,seconds:Math.round((Math.min(now,m.endsAt)-m.startedAt)/1000),total:m.ids.length,score,coins,...(unanswered?{unanswered}:{}),topics:[...topics.values()],items};
 p.mockResults=[result,...(p.mockResults??[])].slice(0,6);p.mockLast={...p.mockLast,[m.subject]:now};delete p.mock;
 return {result,thanked};
}
/** What the results screen needs: every question, whether it was right, and the worked explanation only for correct ones. */
export function reviewMock(r:MockResult,viewer:string){return {...r,items:r.items.map(i=>{const q=questionById.get(i.id);return q?{...i,question:publicQuestion(q,undefined,viewer),...(i.correct?{answers:toViewer(q,viewer,q.answers),explanation:q.explanation}:{})}:i;})};}
