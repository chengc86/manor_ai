import {explain,type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
// Prefixes and suffixes: meanings, in-/im-/il-/ir-, and the spelling rules for adding suffixes.
// Notes: 'affix' says which word the chosen prefix or suffix makes; 'suffix' names the spelling rule, which the test
// applies with its own code; 'spelling' names a word the test looks up in its own list.

const topic:Topic={id:'en-prefixes-suffixes',subject:'English',strand:'Spelling and vocabulary',title:'Prefixes and suffixes',helpsheet:{
 intro:'A **prefix** goes at the start of a root word and changes its meaning (un + kind = unkind). A **suffix** goes at the end and often changes the word class (kind + ness = kindness) or the tense (jump + ed).',
 steps:[
  'Find the root word, then look at what has been added before or after it.',
  "Prefixes meaning 'not' include un-, dis- and in-. In- becomes **im-** before m or p (impatient), **il-** before l (illogical) and **ir-** before r (irresponsible).",
  'Adding a suffix: drop a final **e** before a vowel suffix (make → making); double a single final consonant after a short vowel (skip → skipped); change **y** to **i** after a consonant (happy → happiness).',
  'Common suffixes: -ful and -ous (adjectives), -ness and -ment (nouns), -ly (adverbs), -ise, -ify and -en (verbs).',
 ],
 example:{title:'Building words',lines:['dis + agree = disagree (prefix meaning not)','care + ful = careful (suffix making an adjective)','hurry + ed = hurried (y changes to i)','shine + ing = shining (drop the e)']},
 tips:['Some words keep the e to keep a soft sound: noticeable, outrageous.',"For words ending in -fer, double the r when the stress stays on 'fer': transfer → transferring, but transfer → transference.",'Words ending in -le make adverbs by changing -le to -ly: humble → humbly.'],
}};

const w=writer(topic);
const affix=(roots:string[],words:string[])=>({kind:'affix',roots,words});
const rule=(root:string,suffix:string,how:string)=>({kind:'suffix',root,suffix,rule:how});

w.add({prompt:"Which prefix makes the opposite of 'possible'?",answer:'im-',wrong:['un-','dis-','in-'],rewardGroup:'quick',
 explanation:explain('Before a word beginning with **p**, the prefix in- becomes **im-**: impossible.',"- 'unpossible', 'dispossible' and 'inpossible' are not words.")},affix(['possible'],['impossible']));

w.add({prompt:"Which prefix makes the opposite of 'legal'?",answer:'il-',wrong:['un-','im-','dis-'],
 explanation:explain('Before a word beginning with **l**, we use **il-**: illegal (not allowed by law).','- unlegal, imlegal and dislegal are not words.')},affix(['legal'],['illegal']));

w.add({prompt:"Which prefix makes the opposite of 'regular'?",answer:'ir-',wrong:['un-','in-','dis-'],
 explanation:explain('Before a word beginning with **r**, we use **ir-**: irregular.','- unregular, inregular and disregular are not words.')},affix(['regular'],['irregular']));

w.add({prompt:'Which prefix means **again**?',answer:'re-',wrong:['pre-','mis-','sub-'],rewardGroup:'quick',
 explanation:explain('**re-** means again: rebuild, reheat, retell.','- **pre-** means before, **mis-** means wrongly and **sub-** means under.')});

w.add({prompt:"What does the prefix 'sub-' mean in the words 'submarine' and 'subway'?",answer:'under',wrong:['again','before','against'],
 explanation:explain('**sub-** means **under** or below: a submarine travels under the sea, and a subway goes under the ground.','- again is re-, before is pre- and against is anti-.')});

w.add({prompt:'Which prefix can go in front of **all three** words to make new words?',stimulus:'___behave · ___spell · ___lead',answer:'mis-',wrong:['dis-','re-','un-'],rewardGroup:'challenge',
 explanation:explain('**mis-** means wrongly or badly: misbehave, misspell, mislead.',"- **re-** makes respell, but 'rebehave' is not a word.",'- dis- and un- do not work with these words.')},affix(['behave','spell','lead'],['misbehave','misspell','mislead']));

w.add({prompt:"What is 'hope' + 'ing'?",answer:'hoping',wrong:['hopeing','hopping','hopinng'],
 explanation:explain('When a word ends in **e** and the suffix begins with a vowel, drop the e: hope → **hoping**.','- **hopping** comes from hop (to jump on one leg), which doubles the p.','- hopeing keeps the e, and hopinng doubles the wrong letter.')},rule('hope','ing','drop-e'));

w.add({prompt:"What is 'stop' + 'ed'?",answer:'stopped',wrong:['stoped','stoppd','stopd'],rewardGroup:'quick',
 explanation:explain('stop has one short vowel followed by one consonant, so **double the p** before adding -ed: **stopped**.',"- 'stoped' would sound like 'stoaped'.",'- stoppd and stopd leave out the e of -ed.')},rule('stop','ed','double'));

w.add({prompt:"What is 'lonely' + 'ness'?",answer:'loneliness',wrong:['lonelyness','lonliness','lonelness'],
 explanation:explain('When a word ends in a consonant + **y**, change the y to **i** before adding the suffix: lonely → **loneliness**.','- lonelyness keeps the y, and the other two miss out letters.')},rule('lonely','ness','y-i'));

w.add({prompt:"What is 'courage' + 'ous'?",answer:'courageous',wrong:['couragous','courageus','couragious'],rewardGroup:'challenge',
 explanation:explain('Usually the e is dropped before -ous, but here the **e is kept** so that the g stays soft, like a j: **courageous**.',"- 'couragous' would have a hard g, as in 'go'.",'- courageus and couragious are misspellings.')},rule('courage','ous','keep-e'));

w.add({prompt:'Which word is spelt correctly?',answer:'electrician',wrong:['electrition','electrision','electrisian'],
 explanation:explain('Many words for jobs that come from words ending in **-ic** end in **-cian**: electric → **electrician** (also magician, musician).','- These job words do not use the endings -tion or -sion.')},{kind:'spelling',word:'electrician'});

w.add({prompt:"Which ending completes the noun made from 'expand'?",stimulus:'expan___',answer:'-sion',wrong:['-tion','-ssion','-cian'],rewardGroup:'challenge',
 explanation:explain('Verbs ending in **-nd** often make nouns ending in **-sion**: expand → **expansion** (also extend → extension).','- expantion, expanssion and expancian are misspellings.')},{kind:'ending',stem:'expan',word:'expansion'});

w.add({prompt:"What is 'rely' + 'able'?",answer:'reliable',wrong:['relyable','reliible','relable'],rewardGroup:'challenge',
 explanation:explain('rely ends in a consonant + **y**, so change the y to **i** before adding -able: **reliable**.','- relyable keeps the y, and the other two are misspellings.')},rule('rely','able','y-i'));

w.add({prompt:'Which word is spelt correctly?',answer:'confidence',wrong:['confidance','confidense','confidanse'],
 explanation:explain('**confident** ends in -ent, so its noun ends in **-ence**: **confidence**.','- The -ance ending does not match confident, and -se is the wrong ending.')},{kind:'spelling',word:'confidence'});

w.add({prompt:"Which suffix turns the noun 'danger' into an **adjective**?",answer:'-ous',wrong:['-ful','-ness','-ment'],rewardGroup:'quick',
 explanation:explain('**-ous** makes adjectives: danger → **dangerous**.',"- 'dangerful' is not a word.",'- **-ness** and **-ment** make nouns, not adjectives.')},affix(['danger'],['dangerous']));

w.add({prompt:"What is 'simple' + 'ly'?",answer:'simply',wrong:['simplely','simpley','simplly'],
 explanation:explain('When a word ends in **-le**, change the -le to **-ly**: simple → **simply**.','- simplely and simpley are misspellings, and simplly has one l too many.')},rule('simple','ly','le-ly'));

w.add({prompt:"What does the prefix 'auto-' mean in 'autobiography'?",answer:'self',wrong:['against','between','many'],
 explanation:explain("**auto-** means **self**: an autobiography is the story of a person's life written by that person.",'- against is anti-, between is inter-, and many is multi-.')});

w.add({prompt:"What is 'refer' + 'ing'?",answer:'referring',wrong:['refering','reffering','referreing'],rewardGroup:'challenge',
 explanation:explain("In re**fer**, the stress is on the last part, 'fer', so the **r is doubled** before -ing: **referring**.",'- refering does not double the r, reffering doubles the wrong letter, and referreing adds an extra e.')},rule('refer','ing','double'));

export const affixes=w.done();
