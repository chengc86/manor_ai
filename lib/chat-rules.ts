// Shared by the chat API and the browser. The word list stays server-side in chat-filter.ts.
export const CHAT_WARNINGS=2,CHAT_FINE=10;
// Provisional until live chat medians are in. One coin per word, so 10 words cost 10 coins.
export const FREE_WORDS_PER_DAY=200,COINS_PER_WORD=1;
/** Words are whitespace-separated tokens in the trimmed message. Punctuation stays on its word. */
export function countWords(text:string){const trimmed=text.trim();return trimmed?trimmed.split(/\s+/).length:0;}
/** Calendar day in Europe/London (YYYY-MM-DD). Free words reset at midnight there. */
export function chatDay(at:number){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(at),get=(type:string)=>parts.find(p=>p.type===type)?.value??'';return `${get('year')}-${get('month')}-${get('day')}`;}
export type ChatWordUse={day:string;used:number};
export function wordsToday(record:ChatWordUse|undefined,now:number){const day=chatDay(now);return record?.day===day?record:{day,used:0};}
export function priceWords(freeLeft:number,words:number){const freeWords=Math.min(words,Math.max(0,freeLeft)),paidWords=words-freeWords;return {words,freeWords,paidWords,cost:paidWords*COINS_PER_WORD};}
export function chatPaywallMessage(q:{words:number;freeLeft:number;paidWords:number;cost:number;coins:number}){const rate=`Extra words cost ${COINS_PER_WORD} coin each, so 10 words cost 10 coins.`;const afford=`You have ${q.coins} coin${q.coins===1?'':'s'}. Answer questions to earn more coins, then send it again. Quests, battles and reading chat stay free.`;if(q.freeLeft>0)return `You have ${q.freeLeft} free word${q.freeLeft===1?'':'s'} left today. This message is ${q.words} words, so ${q.paidWords} extra word${q.paidWords===1?'':'s'} cost ${q.cost} coin${q.cost===1?'':'s'}. ${rate} ${afford}`;return `You have used today's ${FREE_WORDS_PER_DAY} free words. This message is ${q.words} words and costs ${q.cost} coin${q.cost===1?'':'s'}. ${rate} ${afford}`;}
export type ChatIssue='rude'|'link'|'personal';
export type ChatFlag={id:string;owner:string;name:string;text:string;reason:ChatIssue;at:number;warning:number|null;coins:number};
export const CHAT_ISSUES:Record<ChatIssue,string>={rude:'Rude or unkind words',link:'Link to another website',personal:'Phone number or email address'};
const WHY:Record<ChatIssue,string>={rude:'rude or unkind words are not allowed in class chat',link:'links to other websites are not allowed in class chat',personal:'phone numbers and email addresses must stay private'};
// What the pupil sees when a message is blocked: two warnings each week (Monday to Sunday), then a fine for every blocked message.
export function blockedMessage(f:Pick<ChatFlag,'reason'|'warning'|'coins'>){const why=`That message was not sent: ${WHY[f.reason]}.`;if(f.warning)return `${why} This is warning ${f.warning} of ${CHAT_WARNINGS} this week. After that, each blocked message costs ${CHAT_FINE} coins.`;return f.coins?`${why} You lost ${f.coins} coins.`:`${why} Your teacher can see this.`;}
