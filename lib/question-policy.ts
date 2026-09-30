import {questions,type Question} from './questions';
import type {Player} from './world';
export const QUESTION_SUBJECTS=['Maths','English','Verbal reasoning','Non-verbal reasoning'];
// Each round asks up to 10 questions per subject. A missed or skipped question rests for 24 hours before it comes back.
export const ROUND_SIZE=10,QUESTION_REST=86400000;
export const assignedYear=(p:Player)=>p.assignedYear===2?2:6;
export const matchesYear=(p:Player,q:Question)=>assignedYear(p)===2?q.difficulty==='Year 2':q.difficulty!=='Year 2';
export function subjectExhausted(p:Player,subject:string){return !questions.some(q=>q.subject===subject&&matchesYear(p,q)&&!p.history[q.id]?.correct);}
const askable=(p:Player,q:Question,now:number)=>{const h=p.history[q.id];return !h||(!h.correct&&now-h.at>=QUESTION_REST)};
const canAsk=(p:Player,subject:string,now:number)=>questions.some(q=>q.subject===subject&&matchesYear(p,q)&&askable(p,q,now));
const roundFull=(p:Player,subject:string)=>(p.questionRound?.[subject]??0)>=ROUND_SIZE;
// A round ends once a subject has had its 10 questions and every other subject has too, or has nothing to ask right now (all answered correctly, or resting).
const roundOver=(p:Player,now:number)=>QUESTION_SUBJECTS.some(s=>roundFull(p,s))&&QUESTION_SUBJECTS.every(s=>roundFull(p,s)||!canAsk(p,s,now));
export function startRoundIfOver(p:Player,now=Date.now()){if(roundOver(p,now))p.questionRound={};}
// Questions a subject can offer right now: fresh ones first, then missed ones that have rested. None once the subject has had its 10 this round.
export function readyQuestions(p:Player,subject:string,now=Date.now()){if(roundFull(p,subject))return [];const list=questions.filter(q=>q.subject===subject&&matchesYear(p,q)&&askable(p,q,now)),fresh=list.filter(q=>!p.history[q.id]);return fresh.length?fresh:list;}
// What each subject button shows. ready: a question can be asked now. readyAt: when a resting subject's first question comes back.
export function roundStatus(p:Player,now=Date.now()){const over=roundOver(p,now);return Object.fromEntries(QUESTION_SUBJECTS.map(s=>{const completed=over?0:p.questionRound?.[s]??0,exhausted=subjectExhausted(p,s),ready=completed<ROUND_SIZE&&canAsk(p,s,now),resting=!ready&&!exhausted&&completed<ROUND_SIZE;return [s,{completed,exhausted,ready,...(resting?{readyAt:Math.min(...questions.filter(q=>q.subject===s&&matchesYear(p,q)&&p.history[q.id]&&!p.history[q.id].correct).map(q=>p.history[q.id].at+QUESTION_REST))}:{})}]}));}
export function requireQuestionAllowed(p:Player,q:Question){if(!matchesYear(p,q))throw new Error('Your teacher has changed your year group. Get a new question.');if(p.history[q.id]?.correct)throw new Error('You have already answered this question correctly.');if(roundFull(p,q.subject))throw new Error('You have completed 10 questions in this subject. Complete the other subjects first.');}
export function recordRoundAnswer(p:Player,subject:string){p.questionRound??={};p.questionRound[subject]=(p.questionRound[subject]??0)+1;startRoundIfOver(p);}
