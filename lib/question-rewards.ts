import type {Question} from './questions';
export const REWARD_GROUPS={quick:{label:'Quick',coins:10},standard:{label:'Standard',coins:20},challenge:{label:'Challenge',coins:30},extended:{label:'Extended',coins:40}} as const;
export type RewardGroup=keyof typeof REWARD_GROUPS;
// Initial editorial grouping for the existing bank. Individual questions can override rewardGroup.
export function rewardGroupFor(q:Question):RewardGroup{
 if(q.rewardGroup)return q.rewardGroup;
 const p=q.prompt.toLowerCase();
 if(q.passage){
  const reasoning=/why|suggest|infer|purpose|theme|summary|summari|evidence|contrast|compare|differ|attitude|change|main message|technique|quality|supports/.test(p);
  if(reasoning&&(/comparison|poem/.test(q.id)||/summary|summari|viewpoint|feelings.*differ/.test(p)))return 'extended';
  return reasoning?'challenge':'standard';
 }
 if(q.subject==='Maths'){
  if(/ratio|perimeter|mean |average|reduced|discount|train leaves|remainder|volume|lowest common multiple|highest common factor/.test(p))return 'challenge';
  if(/value of the digit|round |how many.*in |write this distance|opposite|prime number|multiple of|simplify/.test(p))return 'quick';
  return /first.*then|two.*steps|three.*steps/.test(p)?'extended':'standard';
 }
 if(q.subject==='Non-verbal reasoning')return /rotate|reflect|reflection|rotation|fold/.test(p)?'challenge':'standard';
 if(q.subject==='Verbal reasoning')return /code|sequence|analogy|rearrange/.test(p)?'standard':'quick';
 if(/copy the|prefix|synonym|opposite|which word|correct word/.test(p))return 'quick';
 return /subjunctive|passive|semicolon|hyphen|possession/.test(p)?'challenge':'standard';
}
export function questionReward(q:Question){return REWARD_GROUPS[rewardGroupFor(q)].coins;}
