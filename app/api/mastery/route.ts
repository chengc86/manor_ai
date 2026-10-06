import {user,json,readWorld} from '@/lib/world';
import {topicMastery,classMastery,MASTERY_LEVELS} from '@/lib/mastery';
import {assignedYear} from '@/lib/question-policy';
import {schoolLockResponse} from '@/lib/school-lock-guard';
// Topic mastery: a pupil sees their own topics; the teacher sees the class. Year 2 questions have no topics, so Year 2 pupils see none.
export async function GET(req:Request){try{const closed=schoolLockResponse();if(closed)return closed;const uid=await user(req);if(!uid)return json({error:'Sign in to see your topics.'},401);const {w}=await readWorld();
 if(uid==='teacher')return json({isTeacher:true,levels:MASTERY_LEVELS,topics:classMastery(w.players)});
 const p=w.players[uid];if(!p)return json({error:'Sign in again.'},401);
 return json({levels:MASTERY_LEVELS,year:assignedYear(p),topics:assignedYear(p)===2?[]:topicMastery(p)})}catch{return json({error:'Your topics are unavailable. Please try again.'},503)}}
