import {questions,type Question} from './questions';
import type {Player} from './world';
export const QUESTION_SUBJECTS=['Maths','English','Verbal reasoning','Non-verbal reasoning','Science'];
// Each round asks up to 10 questions per subject. A missed or skipped question rests for 24 hours before it comes back.
export const ROUND_SIZE=10,QUESTION_REST=86400000;
export const assignedYear=(p:Player)=>p.assignedYear===2?2:6;
export const matchesYear=(p:Player,q:Question)=>assignedYear(p)===2?q.difficulty==='Year 2':q.difficulty!=='Year 2';
// Only the current banks are asked: the Atom-style Year 6 bank and the Year 2 bank. Retired questions stay findable for notebooks and hints.
const ASKED:Record<string,Question[]>=Object.fromEntries(QUESTION_SUBJECTS.map(s=>[s,questions.filter(q=>q.subject===s&&!q.legacy)]));
const bank=(p:Player,subject:string)=>(ASKED[subject]??[]).filter(q=>matchesYear(p,q));
export function subjectExhausted(p:Player,subject:string){return !bank(p,subject).some(q=>!p.history[q.id]?.correct);}
const askable=(p:Player,q:Question,now:number)=>{const h=p.history[q.id];return !h||(!h.correct&&now-h.at>=QUESTION_REST)};
const canAsk=(p:Player,subject:string,now:number)=>bank(p,subject).some(q=>askable(p,q,now));
const roundFull=(p:Player,subject:string)=>(p.questionRound?.[subject]??0)>=ROUND_SIZE;
// A round ends once a subject has had its 10 questions and every other subject has too, or has nothing to ask right now (all answered correctly, or resting).
const roundOver=(p:Player,now:number)=>QUESTION_SUBJECTS.some(s=>roundFull(p,s))&&QUESTION_SUBJECTS.every(s=>roundFull(p,s)||!canAsk(p,s,now));
export function startRoundIfOver(p:Player,now=Date.now()){if(roundOver(p,now))p.questionRound={};}
// Questions a subject can offer right now: fresh ones first, then missed ones that have rested. None once the subject has had its 10 this round.
// topics narrows practice to chosen topics (from the mastery map); an empty choice falls back to the whole subject.
export function readyQuestions(p:Player,subject:string,now=Date.now(),topics?:string[]){if(roundFull(p,subject))return [];const all=bank(p,subject).filter(q=>askable(p,q,now)),focused=topics?.length?all.filter(q=>q.topic&&topics.includes(q.topic)):all,list=focused.length?focused:all,fresh=list.filter(q=>!p.history[q.id]);return fresh.length?fresh:list;}
// What each subject button shows. ready: a question can be asked now. readyAt: when a resting subject's first question comes back.
// available is false for a subject the pupil's year group has no questions in, so the page can hide it.
export function roundStatus(p:Player,now=Date.now()){const over=roundOver(p,now);return Object.fromEntries(QUESTION_SUBJECTS.map(s=>{const available=bank(p,s).length>0,completed=over?0:p.questionRound?.[s]??0,exhausted=subjectExhausted(p,s),ready=completed<ROUND_SIZE&&canAsk(p,s,now),resting=available&&!ready&&!exhausted&&completed<ROUND_SIZE;return [s,{available,completed,exhausted,ready,...(resting?{readyAt:Math.min(...bank(p,s).filter(q=>p.history[q.id]&&!p.history[q.id].correct).map(q=>p.history[q.id].at+QUESTION_REST))}:{})}]}));}
export function requireQuestionAllowed(p:Player,q:Question){if(!matchesYear(p,q))throw new Error('Your teacher has changed your year group. Get a new question.');if(p.history[q.id]?.correct)throw new Error('You have already answered this question correctly.');if(roundFull(p,q.subject))throw new Error('You have completed 10 questions in this subject. Complete the other subjects first.');}
export function recordRoundAnswer(p:Player,subject:string){p.questionRound??={};p.questionRound[subject]=(p.questionRound[subject]??0)+1;startRoundIfOver(p);}
