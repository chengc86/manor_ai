// Shared by the help board API and the browser. Keep question data out: this file is bundled for pupils.
export const HELP_REWARD=10,HINTS_PER_QUESTION=3,OPEN_HELP_REQUESTS=3,HINT_MIN=5,HINT_MAX=200,HELP_REST=86400000;
export type Hint={id:string;owner:string;name:string;text:string;at:number;removed?:boolean;paidAt?:number};
export type HelpRequest={id:string;at:number;closed?:boolean;hints:Hint[]};
export const liveHints=(help:HelpRequest)=>help.hints.filter(h=>!h.removed);
// open: on the board. closed: taken off by the pupil or solved. full: enough hints, so no more helpers.
export function helpStatus(m:{correctedAt?:number;help?:HelpRequest}){if(!m.help)return null;if(m.correctedAt)return 'closed';if(liveHints(m.help).length>=HINTS_PER_QUESTION)return 'full';return m.help.closed?'closed':'open';}
// Helpers are paid only when the friend they hinted then answers the question correctly. Removed hints earn nothing.
export function rewardHelpers(players:Record<string,{name:string;coins:number}>,help:HelpRequest|undefined,now=Date.now()){const paid:string[]=[];for(const h of help?.hints??[]){const helper=players[h.owner];if(h.removed||h.paidAt||!helper)continue;helper.coins+=HELP_REWARD;h.paidAt=now;paid.push(helper.name);}return paid;}
