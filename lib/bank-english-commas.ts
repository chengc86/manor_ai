import {explain,type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
// Commas: lists, fronted adverbials, subordinate clauses at the start, extra information, direct address and comma splices.

const topic:Topic={id:'en-commas',subject:'English',strand:'Punctuation',title:'Commas',helpsheet:{
 intro:'**Commas** help the reader by separating parts of a sentence. Use them in lists, after fronted adverbials and opening subordinate clauses, around extra information, and to mark off the name of someone you are talking to.',
 steps:[
  "**Lists**: put a comma between the items, usually with no comma before the final 'and' or 'or': eggs, flour and milk.",
  "**Fronted adverbials** and **subordinate clauses at the start**: put a comma after them: 'Before sunrise, the birds began to sing.'",
  "**Extra information** needs a pair of commas, one on each side: 'My uncle, who lives in Leeds, is a chef.'",
  "**Direct address**: separate the name of the person being spoken to: 'Are you ready, Freya?'",
 ],
 example:{title:'Commas at work',lines:['After the concert, Mrs Evans, our music teacher, thanked the choir, the band and the parents.',"- after the fronted adverbial 'After the concert'","- a pair around the extra information 'our music teacher'",'- between the items in the list']},
 tips:["Do not join two sentences with only a comma: 'It rained, we stayed in' needs a full stop, a semicolon or a conjunction.","A comma can change the meaning: 'Can you call, Mum?' asks Mum to make a phone call, but 'Can you call Mum?' asks someone else to phone her.",'Commas around a relative clause show it is extra information; without them, the clause tells us which one.'],
}};

const w=writer(topic);
const fixes=(want:'correct'|'incorrect',map:Record<string,string>)=>({kind:'fixes',want,fixes:map});
const allTo=(correct:string,...others:string[])=>Object.fromEntries([correct,...others].map(o=>[o,correct]));

{const c='We packed sandwiches, apples, crisps and juice.',o=['We packed, sandwiches, apples, crisps and juice.','We packed sandwiches apples crisps and juice.','We packed sandwiches, apples crisps, and juice.'];
w.add({prompt:'Which sentence uses commas correctly in a list?',answer:c,wrong:o,rewardGroup:'quick',
 explanation:explain("In a list, commas go **between the items**: sandwiches, apples, crisps and juice. There is usually no comma before the final 'and'.","- 'We packed, sandwiches' puts a comma before the list has started.","- 'We packed sandwiches apples crisps and juice.' has no commas at all.","- 'We packed sandwiches, apples crisps, and juice.' is missing the comma after 'apples'.")},fixes('correct',allTo(c,...o)));}

w.add({prompt:'Select the punctuation mark that is **missing** from the sentence below.',stimulus:'As the sun rose over the hills the heroes prepared for the next wave.',answer:"Comma after 'hills'",wrong:["Comma after 'sun'","Comma after 'rose'","Comma after 'heroes'"],
 explanation:explain("'As the sun rose over the hills' is a subordinate clause at the start of the sentence, so a **comma** goes after it, before the main clause 'the heroes prepared for the next wave'.","- A comma after 'sun', 'rose' or 'heroes' would split a clause in two.")},
 {kind:'missing',full:'As the sun rose over the hills, the heroes prepared for the next wave.'});

w.add({prompt:'Which sentence shows that Ravi is the person being **asked** to help?',answer:'Can you help, Ravi?',wrong:['Can you help Ravi?','Can you, help Ravi?','Can, you help Ravi?'],
 explanation:explain("The comma before **Ravi** shows that Ravi is the person being spoken to: 'Can you help, Ravi?'","- Without the comma, 'Can you help Ravi?' asks someone else to help Ravi.",'- The other commas split the sentence in places that make no sense.')});

{const c='My grandad, who lives in Wales, keeps bees.',o=['My grandad who lives in Wales, keeps bees.','My grandad, who lives in Wales keeps bees.','My grandad who, lives in Wales, keeps bees.'];
w.add({prompt:'Which sentence uses commas correctly?',answer:c,wrong:o,
 explanation:explain("'who lives in Wales' is extra information about Grandad, so it needs a **pair** of commas, one on each side.",'- Two of the options have only one comma of the pair.',"- 'My grandad who, lives in Wales, keeps bees.' puts the first comma inside the relative clause.")},fixes('correct',allTo(c,...o)));}

{const c='When the bell rang, the pupils lined up.',o=['When the bell rang the pupils, lined up.','When, the bell rang the pupils lined up.','When the bell, rang the pupils lined up.'];
w.add({prompt:'Which sentence is punctuated correctly?',answer:c,wrong:o,rewardGroup:'quick',
 explanation:explain("The comma goes at the end of the subordinate clause 'When the bell rang', before the main clause 'the pupils lined up'.",'- In the other options, the comma splits a clause in the wrong place.')},fixes('correct',allTo(c,...o)));}

w.add({prompt:'Which sentence uses a comma **incorrectly**?',answer:'The rain stopped, the sun came out.',wrong:['The rain stopped, and the sun came out.','After the rain stopped, the sun came out.','The rain, which had lasted all day, stopped at last.'],rewardGroup:'challenge',
 explanation:explain("'The rain stopped' and 'the sun came out' are two main clauses. A comma on its own cannot join them (this mistake is called a **comma splice**): use a full stop, a semicolon or a conjunction.",'- The other sentences use commas correctly: before a conjunction joining two clauses, after an opening subordinate clause and around a relative clause.')},
 fixes('incorrect',{'The rain stopped, the sun came out.':'The rain stopped; the sun came out.','The rain stopped, and the sun came out.':'The rain stopped, and the sun came out.','After the rain stopped, the sun came out.':'After the rain stopped, the sun came out.','The rain, which had lasted all day, stopped at last.':'The rain, which had lasted all day, stopped at last.'}));

w.add({prompt:'Select the punctuation mark that is **missing** from the sentence below.',stimulus:'Mum bought eggs flour and sugar for the cake.',answer:"Comma after 'eggs'",wrong:["Comma after 'bought'","Comma after 'sugar'","Full stop after 'eggs'"],rewardGroup:'quick',
 explanation:explain('Eggs, flour and sugar is a list of three items, so a **comma** is needed between the first two: eggs, flour.',"- A comma after 'bought' would come before the list starts.","- A comma after 'sugar' would cut the list off from the rest of the sentence, and a full stop after 'eggs' would end the sentence too soon.")},
 {kind:'missing',full:'Mum bought eggs, flour and sugar for the cake.'});

{const c='Before breakfast, Tom fed the chickens.',o=['Before, breakfast Tom fed the chickens.','Before breakfast Tom, fed the chickens.','Before breakfast Tom fed, the chickens.'];
w.add({prompt:'Which sentence has a comma in the correct place?',answer:c,wrong:o,rewardGroup:'quick',
 explanation:explain("'Before breakfast' is a fronted adverbial, so the comma goes straight after it.",'- The other commas split up the phrase or the main clause.')},fixes('correct',allTo(c,...o)));}

w.add({prompt:'Which sentence means that only **some** of the pupils went outside?',answer:'The pupils who had finished their work went outside.',wrong:['The pupils, who had finished their work, went outside.','The pupils had finished their work, so they went outside.','The pupils, who had finished their work went outside.'],rewardGroup:'challenge',
 explanation:explain("Without commas, 'who had finished their work' tells us **which** pupils went outside: only the ones who had finished.",'- With a pair of commas, the clause becomes extra information about all the pupils, so they all went outside.',"- 'The pupils had finished their work, so they went outside' is about all the pupils too.","- 'The pupils, who had finished their work went outside.' has only one comma of the pair, so it is not punctuated correctly.")});

w.add({prompt:'Select the punctuation mark that is **missing** from the sentence below.',stimulus:'However the bridge was too narrow for the cart.',answer:"Comma after 'However'",wrong:["Comma after 'bridge'","Comma after 'narrow'","Comma after 'was'"],
 explanation:explain("**However** at the start of a sentence links it to the one before, and it is followed by a comma: 'However, the bridge…'.",'- The other commas would split the main clause.')},
 {kind:'missing',full:'However, the bridge was too narrow for the cart.'});

w.add({prompt:'Why is a comma used in this sentence?',stimulus:'Hana, please close the door.',answer:'to separate the name of the person being spoken to',wrong:['to separate items in a list','to mark the end of a fronted adverbial','to show that letters are missing'],rewardGroup:'quick',
 explanation:explain('The comma separates **Hana**, the person being spoken to, from the rest of the command.','- There is no list or fronted adverbial here, and missing letters are shown by an apostrophe, not a comma.')});

w.add({prompt:'Why is a comma used in this sentence?',stimulus:'Although the water was cold, we swam across the lake.',answer:'to separate a subordinate clause at the start from the main clause',wrong:['to separate items in a list','to show who is being spoken to','to join two main clauses'],
 explanation:explain("'Although the water was cold' is a subordinate clause at the start of the sentence. The comma separates it from the main clause 'we swam across the lake'.",'- There is no list and no one is being spoken to.','- A comma should not be used on its own to join two main clauses.')});

w.add({prompt:'Select the punctuation mark that is **missing** from the sentence below.',stimulus:'Mr Hill, our football coach showed us a new drill.',answer:"Comma after 'coach'",wrong:["Comma after 'football'","Comma after 'showed'","Comma after 'us'"],
 explanation:explain("'our football coach' is extra information about Mr Hill, so it needs a **pair** of commas. The first comma is after 'Hill', so the second goes after 'coach'.",'- A comma anywhere else would cut the extra information off in the wrong place.')},
 {kind:'missing',full:'Mr Hill, our football coach, showed us a new drill.'});

{const c='On the beach, we found shells, pebbles and a crab.',o=['On the beach, we found, shells, pebbles and a crab.','On the beach, we found shells pebbles and a crab.','On, the beach we found shells, pebbles and a crab.'];
w.add({prompt:'Which sentence uses **all** its commas correctly?',answer:c,wrong:o,
 explanation:explain("One comma follows the fronted adverbial 'On the beach', and another separates the first two items in the list: shells, pebbles and a crab.","- The other options add a comma after 'found', leave out the list comma, or put the first comma after 'On'.")},fixes('correct',allTo(c,...o)));}

{const c='Yes, I would love to come to the party.',o=['Yes I would, love to come to the party.','Yes I would love, to come to the party.','Yes I would love to come, to the party.'];
w.add({prompt:'Which reply is punctuated correctly?',answer:c,wrong:o,rewardGroup:'quick',
 explanation:explain('A comma goes after **Yes** when it begins a reply, to separate it from the rest of the sentence.',"- The other options put a comma in the middle of 'I would love to come to the party', where it does not belong.")},fixes('correct',allTo(c,...o)));}

w.add({prompt:'Select the punctuation mark that is **missing** from the sentence below.',stimulus:'Our tent, which was bright orange was easy to spot.',answer:"Comma after 'orange'",wrong:["Comma after 'which'","Comma after 'bright'","Comma after 'easy'"],
 explanation:explain("'which was bright orange' is extra information about the tent, so it needs a comma on **both** sides. The first comma is there, so the one after 'orange' is missing.",'- The other commas would split the relative clause or the main clause.')},
 {kind:'missing',full:'Our tent, which was bright orange, was easy to spot.'});

{const c='While Dad was painting, the fence fell over.',o=['While Dad was painting the fence fell over.','While Dad, was painting the fence fell over.','While Dad was painting the fence, fell over.'];
w.add({prompt:'Which sentence uses a comma to make the meaning clear?',answer:c,wrong:o,rewardGroup:'challenge',
 explanation:explain("The comma after **painting** shows where the subordinate clause ends, so we read 'the fence fell over' as the main clause.",'- Without the comma, a reader first thinks Dad was painting the fence.','- The other commas break the sentence up in the wrong places.')},fixes('correct',allTo(c,...o)));}

w.add({prompt:'How many commas does this sentence need?',stimulus:'Callum who is the tallest in our class can reach the top shelf.',answer:'2',wrong:['1','3','4'],rewardGroup:'challenge',
 explanation:explain("'who is the tallest in our class' is extra information about Callum, so it needs a comma on each side: **2** commas.","- 'Callum, who is the tallest in our class, can reach the top shelf.'")},
 {kind:'commaCount',full:'Callum, who is the tallest in our class, can reach the top shelf.'});

export const commas=w.done();
