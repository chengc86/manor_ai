// Keeps class chat suitable for children: rude or unkind words, links, and phone numbers or email addresses are blocked.
// Server-only: import it from API routes, never from a component, so the word list is not sent to pupils.
import type {ChatIssue} from './chat-rules';
// Whole words. Common endings (-s, -ed, -ing, -er, -y, -est) are covered and letters may repeat ("stuuupid").
const WORDS=['ass','arse','crap','piss','damn','dammit','damnit','goddamn','dick','cock','prick','tosser','bugger','slag','sex','boobs','boobies','rape','rapist','penis','vagina','nude','horny','dildo','cum','jizz','orgasm','stupid','idiot','dumb','dumbo','moron','loser','retard','spaz','spastic','paki','chink','fag','tranny','dyke','wtf','stfu','omfg','fck','kys','shutup'];
// Never innocent, so also caught inside longer words ("motherf...", "bullsh...").
const ROOTS=['fuck','fuk','phuck','shit','cunt','wank','bitch','bastard','bollock','twat','whore','slut','porn','nigger','nigga','faggot','dickhead','asshole','arsehole','dumbass','jackass','motherf'];
// Real words that contain a root above.
const ALLOW=new Set(['scunthorpe','shiitake','shitake','swank','swanky','swanks']);
// Unkind phrases, matched as whole words after punctuation is removed ("you're" becomes "youre").
const PHRASES=['shut up','kill yourself','kill urself','kill ur self','kill your self','go die','go and die','hate you','hate u','you suck','u suck','nobody likes you','no one likes you','you are ugly','youre ugly','ur ugly','you are fat','youre fat','ur fat','send nudes'];
const ENDINGS='(?:s|es|d|ed|ing|er|ers|y|ies|est|z)?';
const repeatable=(w:string)=>[...w].map(c=>c===' '?' ':c+'+').join('');
const WORD=new RegExp(`^(?:${WORDS.map(repeatable).join('|')})${ENDINGS}$`),ROOT=new RegExp(ROOTS.map(repeatable).join('|'));
const PHRASE=new RegExp(`(?:^| )(?:${PHRASES.map(repeatable).join('|')})(?= |$)`);
// Masked words such as "f*ck" or "sh#t" are compared with every blocked word and its usual endings.
const FORMS=[...WORDS,...ROOTS].flatMap(w=>['','s','ed','ing','er','ers','y','hole','head'].map(e=>w+e));
const LEET:Record<string,string>={'0':'o','1':'i','!':'i','|':'i','3':'e','4':'a','@':'a','5':'s','$':'s','7':'t','+':'t','v':'u'};
const MASK=/[*#?%&]/;
function rude(word:string){if(!/[a-z]/.test(word))return false;if(MASK.test(word)){const letters=word.replace(/[^a-z]/g,'').length;if(letters<2&&word.length-letters<2)return false;/* "A*" is a grade, "a**" is not */const shape=new RegExp('^'+word.replace(/[*#?%&]/g,'[a-z]{0,2}')+'$');return FORMS.some(f=>shape.test(f));}return WORD.test(word)||(!ALLOW.has(word)&&ROOT.test(word));}
export function checkMessage(text:string):ChatIssue|null{
 const lower=text.normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase();
 const raw=lower.split(/\s+/).map(t=>t.replace(/^[^a-z0-9@$*#]+|[^a-z0-9*#]+$/g,'')).filter(Boolean);
 // Two readings of each word: as typed, and with look-alike symbols swapped for letters ("sh1t", "@ss", "fvck").
 const plain=raw.map(t=>t.replace(/[^a-z*#?%&]/g,'')),leet=raw.map(t=>/[a-z]/.test(t)?[...t].map(c=>LEET[c]??c).join('').replace(/[^a-z*#?%&]/g,''):'');
 const spaced:string[]=[];let run='';for(const t of [...plain,'']){if(t.length===1)run+=t;else{if(run.length>=3)spaced.push(run);run='';}}
 if(/\u{1F595}/u.test(text)||[...plain,...leet,...spaced].some(rude)||PHRASE.test(plain.filter(Boolean).join(' '))||PHRASE.test(leet.filter(Boolean).join(' ')))return 'rude';
 // Email addresses come before links, because they contain a web address too.
 const digits=lower.replace(/(?<=\d)[\s().-]+(?=\d)/g,'');
 if(/[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+/.test(lower)||/(?:\+\d{11,13}|(?<!\d)0\d{9,10})(?!\d)/.test(digits))return 'personal';
 if(/(?:https?:\/\/|\bwww\.|\b[a-z0-9-]+\.(?:com|net|org|io|gg|tv|ly|xyz|app|info|ru|cn)\b|\.(?:co|org|ac|gov|sch)\.uk\b|\byoutu\.be\b|\bt\.me\/|\b(?:dot|\(dot\)|\[dot\])\s*(?:com|net|org|io|gg|co\.uk)\b)/.test(lower))return 'link';
 return null;
}
// Warnings reset every Monday, UK time.
export function weekOf(at:number){const [d,m,y]=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',day:'2-digit',month:'2-digit',year:'numeric'}).format(at).split('/').map(Number),day=new Date(Date.UTC(y,m-1,d));day.setUTCDate(day.getUTCDate()-(day.getUTCDay()+6)%7);return day.toISOString().slice(0,10);}
