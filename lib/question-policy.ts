import {questions,type Question} from './questions';
import type {Player} from './world';
export const QUESTION_SUBJECTS=['Maths','English','Verbal reasoning','Non-verbal reasoning'];
export const assignedYear=(p:Player)=>p.assignedYear===2?2:6;
export const matchesYear=(p:Player,q:Question)=>assignedYear(p)===2?q.difficulty==='Year 2':q.difficulty!=='Year 2';
export function subjectExhausted(p:Player,subject:string){return !questions.some(q=>q.subject===subject&&matchesYear(p,q)&&!p.history[q.id]?.correct);}
export function roundStatus(p:Player){return Object.fromEntries(QUESTION_SUBJECTS.map(s=>[s,{completed:p.questionRound?.[s]??0,exhausted:subjectExhausted(p,s)}]));}
export function requireQuestionAllowed(p:Player,q:Question){if(!matchesYear(p,q))throw new Error('Your teacher has changed your year group. Get a new question.');if(p.history[q.id]?.correct)throw new Error('You have already answered this question correctly.');if((p.questionRound?.[q.subject]??0)>=10)throw new Error('You have completed 10 questions in this subject. Complete the other subjects first.');}
export function recordRoundAnswer(p:Player,subject:string){p.questionRound??={};p.questionRound[subject]=(p.questionRound[subject]??0)+1;if(QUESTION_SUBJECTS.every(s=>(p.questionRound?.[s]??0)>=10||subjectExhausted(p,s)))p.questionRound={};}
