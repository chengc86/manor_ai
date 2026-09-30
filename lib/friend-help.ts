// Shared by the help board API and the browser. Keep question data out: this file is bundled for pupils.
export const HELP_REWARD=20,ANSWER_PENALTY=10,HINTS_PER_QUESTION=3,OPEN_HELP_REQUESTS=3,HINT_MIN=5,HINT_MAX=200,HELP_REST=86400000;
// What a pupil can say is tricky when they ask. Helpers and the teacher see it. Fixed choices, so there is no free text to moderate.
export const STUCK={meaning:'I don’t understand the question',start:'I don’t know how to start',wrong:'I don’t know where I went wrong',word:'There’s a word I don’t know'} as const;
export type Stuck=keyof typeof STUCK;
export const isStuck=(v:unknown):v is Stuck=>typeof v==='string'&&Object.keys(STUCK).includes(v);
// Sentence starters that steer helpers towards a clue rather than the answer. The first ones suit what the friend is stuck on.
const STARTERS:Record<Stuck|'any',string[]>={any:['Start by','Look at','Remember that','Try'],meaning:['The question wants you to','Look for the key word'],start:['Start by','First, work out'],wrong:['Check your','Be careful with'],word:['This word means','It is a word for']};
export const hintStarters=(stuck?:Stuck|null)=>[...new Set([...(stuck?STARTERS[stuck]:[]),...STARTERS.any])].slice(0,5);
export type Hint={id:string;owner:string;name:string;text:string;at:number;removed?:boolean;paidAt?:number;gaveAnswer?:{at:number;coins:number}};
export type HelpRequest={id:string;at:number;closed?:boolean;stuck?:Stuck;hints:Hint[]};
export const liveHints=(help:HelpRequest)=>help.hints.filter(h=>!h.removed);
// open: on the board. closed: taken off by the pupil or solved. full: enough hints, so no more helpers.
export function helpStatus(m:{correctedAt?:number;help?:HelpRequest}){if(!m.help)return null;if(m.correctedAt)return 'closed';if(liveHints(m.help).length>=HINTS_PER_QUESTION)return 'full';return m.help.closed?'closed':'open';}
// Helpers are paid only when the friend they hinted then answers the question correctly. Removed hints earn nothing.
export function rewardHelpers(players:Record<string,{name:string;coins:number}>,help:HelpRequest|undefined,now=Date.now()){const paid:string[]=[];for(const h of help?.hints??[]){const helper=players[h.owner];if(h.removed||h.paidAt||!helper)continue;helper.coins+=HELP_REWARD;h.paidAt=now;paid.push(helper.name);}return paid;}
// Coins a hint that gave the answer away costs: the penalty, plus the reward if it was already paid, so giving the answer never pays.
export const answerPenalty=(hint:Hint)=>ANSWER_PENALTY+(hint.paidAt?HELP_REWARD:0);
// The teacher found a hint that gives the answer away: it is removed (never paid) and the helper loses coins. Balances stop at zero; applying it twice changes nothing.
export function penaliseAnswer(players:Record<string,{coins:number}>,hint:Hint,now=Date.now()){if(hint.gaveAnswer)return hint.gaveAnswer.coins;const helper=players[hint.owner],coins=helper?Math.min(answerPenalty(hint),Math.max(0,helper.coins)):0;if(helper)helper.coins-=coins;hint.removed=true;hint.gaveAnswer={at:now,coins};return coins;}
