// Shared by the chat API and the browser. The word list stays server-side in chat-filter.ts.
export const CHAT_WARNINGS=2,CHAT_FINE=10;
export type ChatIssue='rude'|'link'|'personal';
export type ChatFlag={id:string;owner:string;name:string;text:string;reason:ChatIssue;at:number;warning:number|null;coins:number};
export const CHAT_ISSUES:Record<ChatIssue,string>={rude:'Rude or unkind words',link:'Link to another website',personal:'Phone number or email address'};
const WHY:Record<ChatIssue,string>={rude:'rude or unkind words are not allowed in class chat',link:'links to other websites are not allowed in class chat',personal:'phone numbers and email addresses must stay private'};
// What the pupil sees when a message is blocked: two warnings each week (Monday to Sunday), then a fine for every blocked message.
export function blockedMessage(f:Pick<ChatFlag,'reason'|'warning'|'coins'>){const why=`That message was not sent: ${WHY[f.reason]}.`;if(f.warning)return `${why} This is warning ${f.warning} of ${CHAT_WARNINGS} this week. After that, each blocked message costs ${CHAT_FINE} coins.`;return f.coins?`${why} You lost ${f.coins} coins.`:`${why} Your teacher can see this.`;}
