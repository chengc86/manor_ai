import {explain,type Topic} from './bank-kit';
import {writer,lettered} from './bank-english-kit';
// Direct speech: inverted commas, the punctuation inside them, reporting clauses, split speech, reported speech.
// Speech in this bank uses double inverted commas.

const topic:Topic={id:'en-speech',subject:'English',strand:'Punctuation',title:'Direct speech',helpsheet:{
 intro:'**Direct speech** gives the exact words someone says, inside **inverted commas** (speech marks). **Reported speech** tells us what someone said without using their exact words, so it has no inverted commas.',
 steps:[
  'Put inverted commas around the spoken words only, and start the spoken words with a capital letter.',
  `Put the punctuation that ends the spoken words **inside** the closing inverted commas. If the sentence carries on after the speech, use a comma (or ? or !), not a full stop: "I'm ready," said Ruby.`,
  'If the reporting clause comes first, put a comma after it: Dad said, "Supper is ready."',
  'Start a new line each time a new person speaks.',
 ],
 example:{title:'Speech punctuation',lines:['"Look at the stars," whispered Luca. "They are so bright tonight."',"- a comma inside the inverted commas before 'whispered'","- a full stop after 'Luca', because that sentence has ended",'- the next spoken sentence starts with a capital letter']},
 tips:['When one spoken sentence is split by the reporting clause, the second part carries on with a small letter: "If we run," said Zain, "we can make it."',"Reported speech often uses 'that' and changes the pronouns and tense: Sam said that he was tired.",'A question mark or exclamation mark can end the spoken words even when the sentence carries on: "Stop!" shouted Zain.'],
}};

const w=writer(topic);
const allTo=(correct:string,...others:string[])=>({kind:'fixes',want:'correct',fixes:Object.fromEntries([correct,...others].map(o=>[o,correct]))});
const CARDS='Four versions of the sentence on cards labelled A to D';

{const c='"Is it time to go home?" asked Oscar.',o=['"Is it time to go home," asked Oscar.','"Is it time to go home"? asked Oscar.','Is it time to go home? asked Oscar.'];
w.add({prompt:'Which sentence with speech is punctuated correctly?',answer:c,wrong:o,
 explanation:explain('The spoken words are a question, so the **question mark** goes **inside** the closing inverted commas: "Is it time to go home?" asked Oscar.','- A comma cannot end a spoken question.','- The question mark must not go outside the inverted commas.',"- 'Is it time to go home? asked Oscar.' has no inverted commas at all.")},allTo(c,...o));}

{const c='Mum called, "Dinner is ready!"',o=['Mum called "Dinner is ready!"','Mum called, "Dinner is ready"!','Mum called, Dinner is ready!'];
w.add({prompt:'Which sentence with speech is punctuated correctly?',answer:c,wrong:o,
 explanation:explain('When the reporting clause (Mum called) comes first, it is followed by a **comma**, and the spoken words start with a capital letter inside the inverted commas. The exclamation mark belongs to the spoken words, so it goes inside too.',"- Without a comma after 'called', the reporting clause runs straight into the speech.",'- The exclamation mark belongs inside the inverted commas, not after them.',"- 'Mum called, Dinner is ready!' has no inverted commas.")},allTo(c,...o));}

{const c='"When you get home," said Dad, "please feed the cat."',o=['"When you get home," said Dad. "please feed the cat."','"When you get home" said Dad, "please feed the cat."','"When you get home," said Dad, please feed the cat."'];
w.add({prompt:'Which sentence with speech is punctuated correctly?',answer:c,wrong:o,rewardGroup:'challenge',
 explanation:explain("This is **one** spoken sentence split by 'said Dad'. A comma goes inside the first set of inverted commas, another comma goes after 'Dad', and the second part carries on with a small letter.","- One option has a full stop after 'Dad', which ends the sentence too early.","- Another is missing the comma after 'home', and another is missing the inverted commas before 'please'.")},allTo(c,...o));}

{const c=`"I've finished," said Kofi. "Can I go out now?"`,o=[`"I've finished," said Kofi, "Can I go out now?"`,`"I've finished." said Kofi. "Can I go out now?"`,`"I've finished," said Kofi. "Can I go out now"?`];
w.add({prompt:'Which sentence with speech is punctuated correctly?',answer:c,wrong:o,rewardGroup:'challenge',
 explanation:explain(`Kofi says two separate sentences. The first ("I've finished,") ends with a comma because the sentence carries on with 'said Kofi'. Then a **full stop** after 'Kofi' ends that sentence, and the new spoken sentence starts with a capital letter.`,"- A comma after 'Kofi' would run two sentences together.","- A full stop after 'finished' is wrong because 'said Kofi' is still part of the same sentence.",'- The question mark belongs inside the inverted commas.')},allTo(c,...o));}

w.add({prompt:'Which of these sentences with speech is punctuated INCORRECTLY?',answer:'"We should leave now." said Hugo.',wrong:['"Watch out for the puddle!" called Amara.','Tilly asked, "Where are my gloves?"','"The bus is late," sighed Mr Jones.'],
 explanation:explain('After "We should leave now" the sentence carries on with \'said Hugo\', so the spoken words should end with a **comma**, not a full stop: "We should leave now," said Hugo.','- The other three sentences are punctuated correctly.')},
 {kind:'fixes',want:'incorrect',fixes:{'"We should leave now." said Hugo.':'"We should leave now," said Hugo.','"Watch out for the puddle!" called Amara.':'"Watch out for the puddle!" called Amara.','Tilly asked, "Where are my gloves?"':'Tilly asked, "Where are my gloves?"','"The bus is late," sighed Mr Jones.':'"The bus is late," sighed Mr Jones.'}});

{const cards=['"Can we stay up late?" asked Mei.','Grandpa smiled and said, "just this once."','"Thank you!" cried Mei.','"Off to bed now," said Grandpa.'];
w.add({prompt:'Which of these sentences with speech is punctuated INCORRECTLY?',...lettered(cards,1,'Four sentences with speech on cards labelled A to D'),rewardGroup:'challenge',
 explanation:explain('In B, the spoken words begin a new sentence, so they must start with a **capital letter**: "Just this once."','- A, C and D are punctuated correctly.')},
 {kind:'fixes',want:'incorrect',cards,fixed:['"Can we stay up late?" asked Mei.','Grandpa smiled and said, "Just this once."','"Thank you!" cried Mei.','"Off to bed now," said Grandpa.']});}

w.add({prompt:'Select the punctuation mark that is **missing** from the text below.',stimulus:'"Has anyone seen my trainers?" asked Sofia',answer:"Full stop after 'Sofia'",wrong:["Comma after 'asked'","Question mark after 'Sofia'","Inverted commas after 'asked'"],
 explanation:explain("The sentence ends after 'asked Sofia', so a **full stop** is missing at the end.",'- The question mark inside the inverted commas already shows that Sofia is asking a question, so another one is not needed.',"- A comma or inverted commas after 'asked' would split the reporting clause.")},
 {kind:'missing',full:'"Has anyone seen my trainers?" asked Sofia.'});

w.add({prompt:'Select the punctuation mark that is **missing** from the text below.',stimulus:'"Put your coats on," said Miss Jones "because the bus is here."',answer:"Comma after 'Jones'",wrong:["Full stop after 'Jones'","Comma after 'Put'","Comma after 'bus'"],rewardGroup:'challenge',
 explanation:explain("The spoken sentence ('Put your coats on because the bus is here') has been split by 'said Miss Jones'. A **comma** is needed after 'Jones' before the speech carries on.","- A full stop would end the sentence, but the speech has not finished: it carries on with a small letter ('because').","- Commas after 'Put' or 'bus' would split the spoken words wrongly.")},
 {kind:'missing',full:'"Put your coats on," said Miss Jones, "because the bus is here."'});

w.add({prompt:'Select the punctuation mark that is **missing** from the text below.',stimulus:'"Watch out! shouted the lifeguard.',answer:"Inverted commas after 'out!'",wrong:["Inverted commas after 'lifeguard.'","Comma after 'out!'","Question mark after 'Watch'"],
 explanation:explain('The spoken words are "Watch out!", so the closing **inverted commas** go straight after the exclamation mark: "Watch out!" shouted the lifeguard.',"- 'shouted the lifeguard' is not spoken, so it must not be inside the inverted commas.")},
 {kind:'missing',full:'"Watch out!" shouted the lifeguard.'});

w.add({prompt:'Select the punctuation mark that is **missing** from the text below.',stimulus:'"We won the match" said Leo proudly.',answer:"Comma after 'match'",wrong:["Comma after 'Leo'","Full stop after 'match'","Comma after 'won'"],
 explanation:explain('The spoken words are followed by \'said Leo proudly\', so they end with a **comma** inside the inverted commas: "We won the match," said Leo proudly.','- A full stop would end the sentence too early.',"- Commas after 'Leo' or 'won' would be in the wrong place.")},
 {kind:'missing',full:'"We won the match," said Leo proudly.'});

w.add({prompt:'Which sentence is written in **reported** speech?',answer:'Dad said that dinner was ready.',wrong:['"Dinner is ready," said Dad.','Dad said, "Dinner is ready."','"Is dinner ready?" asked Dad.'],rewardGroup:'quick',
 explanation:explain("**Reported speech** tells us what someone said without using their exact words, so it has no inverted commas: Dad said **that** dinner was ready.","- The other sentences put Dad's exact words inside inverted commas: they are direct speech.")});

w.add({prompt:'Which sentence is the correct **reported speech** version of the sentence below?',stimulus:'"I am hungry," said Tom.',answer:'Tom said that he was hungry.',wrong:['Tom said that I am hungry.','Tom said, he was hungry.','Tom said that "he was hungry."'],rewardGroup:'challenge',
 explanation:explain('In reported speech, the pronoun changes (I → **he**), the tense usually moves back (am → **was**) and there are no inverted commas: Tom said that he was hungry.',"- 'Tom said that I am hungry' sounds as if the writer is hungry.","- The comma after 'said' and the inverted commas in the other options belong to direct speech, not reported speech.")});

w.add({prompt:'Which sentence shows this as correctly punctuated **direct speech**?',stimulus:'Maya asked if she could borrow a pencil.',answer:'"Can I borrow a pencil?" asked Maya.',wrong:['"Can she borrow a pencil?" asked Maya.','"Can I borrow a pencil" asked Maya?','Maya asked, can I borrow a pencil?'],rewardGroup:'challenge',
 explanation:explain('Direct speech gives Maya\'s exact words, so \'she\' becomes **I**: "Can I borrow a pencil?" The question mark goes inside the inverted commas.',"- Maya would not say 'Can she borrow a pencil?' about herself.",'- One option puts the question mark at the end of the whole sentence instead of inside the inverted commas.',"- 'Maya asked, can I borrow a pencil?' has no inverted commas.")});

w.add({prompt:'When you write a conversation, what should you do each time a **new person** starts speaking?',answer:'Start a new line.',wrong:['Use a semicolon.','Leave out the inverted commas.','Write their name in capital letters.'],rewardGroup:'quick',
 explanation:explain('Each time a new person speaks, start a **new line**. This helps the reader follow who is talking.')});

w.add({prompt:'Which punctuation mark belongs in the gap?',stimulus:'"Where did you find that shell___" asked Rory.',answer:'question mark',wrong:['comma','full stop','semicolon'],rewardGroup:'quick',
 explanation:explain("Rory is asking a question ('asked Rory'), so the spoken words end with a **question mark**, inside the inverted commas.",'- A comma is used when the spoken words are a statement and the sentence carries on.',"- A full stop would end the sentence before 'asked Rory'.")});

w.add({prompt:'Which words did Hugo actually say?',stimulus:'"The next wave is coming," whispered Hugo, "so get ready."',answer:'The next wave is coming, so get ready.',wrong:['whispered Hugo','The next wave is coming, whispered Hugo, so get ready.','so get ready'],rewardGroup:'quick',
 explanation:explain('The words inside the inverted commas are what Hugo actually said: **The next wave is coming, so get ready.**',"- 'whispered Hugo' is the reporting clause: it tells us who spoke and how.","- 'so get ready' is only the second part of what he said.")});

{const correct='"Where is the key?" asked Ellie.';
w.add({prompt:'This sentence contains mistakes. Which card shows it with **all** the mistakes corrected?',stimulus:'where is the key asked ellie',
 ...lettered(['"where is the key?" asked Ellie.','"Where is the key." asked Ellie.',correct,'"Where is the key?" asked ellie.'],2,CARDS),rewardGroup:'challenge',
 explanation:explain("The spoken words need inverted commas, a capital letter at the start and a question mark inside the closing inverted commas. **Ellie** is a name, so it needs a capital letter, and the sentence ends with a full stop.",'Card **C** has all of these. A starts the speech with a small letter, B uses a full stop instead of a question mark, and D has a small e in Ellie.')},{kind:'proof',correct});}

{const c='Nadia asked, "Is it snowing?"',o=['Nadia asked, "Is it snowing"?','Nadia asked? "Is it snowing."','Nadia asked, "Is it snowing."'];
w.add({prompt:'Which sentence shows the question mark in the correct place?',answer:c,wrong:o,
 explanation:explain('The spoken words are the question, so the **question mark** goes inside the closing inverted commas: Nadia asked, "Is it snowing?"',"- The question mark must not go outside the inverted commas or after 'asked'.",'- A full stop cannot end a spoken question.')},allTo(c,...o));}

export const speech=w.done();
