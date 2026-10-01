import {explain,type Topic} from './bank-kit';
import {writer,lettered} from './bank-english-kit';
// SATs practice, punctuation: questions in the style of the KS2 grammar, punctuation and spelling test (Paper 1), written
// from scratch. Commas for parenthesis, brackets and dashes, semicolons and colons, hyphens, apostrophes, direct speech,
// commas after fronted adverbials and subordinate clauses, commas that change the meaning, bullet points, missing marks and
// sentences punctuated incorrectly. Notes: 'fixes', 'missing', 'hyphen', 'possessive', 'apostropheCount', 'apostropheWord'
// and 'commaCount' are the shared kinds; 'parenthesis' (tagged sentence), 'markRole', 'commaWhy', 'bullets' and
// 'satsContraction' are re-checked by the test with its own rules.

const topic:Topic={id:'en-sats-punctuation',subject:'English',strand:'SATs practice',title:'SATs punctuation',helpsheet:{
 intro:'Punctuation questions in the SATs test ask you to add a missing mark, choose the correctly punctuated sentence, or explain what a mark is doing. Read each sentence aloud in your head: the pauses and the meaning tell you where the marks belong.',
 steps:[
  '**Commas**: after a fronted adverbial or an opening subordinate clause, between items in a list, and in a **pair** around extra information. A comma on its own cannot join two main clauses.',
  '**Brackets** and pairs of **dashes** also mark extra information. Take the extra words out and the sentence must still make sense.',
  '**Semicolons** join two closely linked main clauses. **Colons** introduce a list or an explanation after a complete clause.',
  "**Apostrophes** show missing letters (do not → don't) or possession: one owner adds 's, a plural ending in s adds just the apostrophe (the twins' room).",
  '**Direct speech**: inverted commas around the spoken words only, a comma or ? or ! inside the closing inverted commas when the sentence carries on, and a comma after a reporting clause that comes first.',
 ],
 example:{title:'Marks at work',lines:['Grandma, who loves the garden, grows three things: beans, roses and mint.','- a pair of commas around the extra information','- a colon after a complete clause to introduce the list','- commas between the items','The hose was leaking; the beans still needed water.','- a semicolon between two main clauses that belong together']},
 tips:["A hyphen joins words and has no spaces (a well-built wall); a dash separates parts of a sentence and has a space on each side.","Bullet points must match: either every point starts with a capital and ends with a full stop, or every point starts with a small letter and has no end mark.","'it's' always means it is or it has; 'its' shows belonging and has no apostrophe.","Commas can change the meaning: 'Let's draw, Mei' speaks to Mei, but 'Let's draw Mei' makes her the picture."],
}};

const w=writer(topic);
const fixes=(want:'correct'|'incorrect',map:Record<string,string>)=>({kind:'fixes',want,fixes:map});
const allTo=(correct:string,...others:string[])=>Object.fromEntries([correct,...others].map(o=>[o,correct]));

{const c='Our neighbour, who keeps hens, gave us a dozen eggs.',o=['Our neighbour who keeps hens, gave us a dozen eggs.','Our neighbour, who keeps hens gave us a dozen eggs.','Our neighbour who, keeps hens, gave us a dozen eggs.'];
w.add({prompt:'Which of these sentences uses a **pair of commas** correctly?',answer:c,wrong:o,rewardGroup:'quick',
 explanation:explain("'who keeps hens' is extra information about our neighbour, so it needs a comma on **each side**. Take it out and the sentence still works: 'Our neighbour gave us a dozen eggs.'",'- Two of the options have only one comma of the pair.',"- 'Our neighbour who, keeps hens,' puts the first comma inside the extra information.")},fixes('correct',allTo(c,...o)));}

{const t='The/det lighthouse/noun which/pron.rel was/verb.aux painted/verb last/adj spring/noun can/verb.mod be/verb seen/verb from/prep the/det beach/noun ./';
w.add({prompt:'Which words should be placed inside **brackets** as extra information?',stimulus:'The lighthouse which was painted last spring can be seen from the beach.',answer:'which was painted last spring',wrong:['The lighthouse','can be seen from the beach','painted last spring can be seen'],
 explanation:explain("'which was painted last spring' is extra information about the lighthouse. Put it in brackets and the main sentence still makes sense: 'The lighthouse (which was painted last spring) can be seen from the beach.'","- 'The lighthouse' is the subject and 'can be seen from the beach' is the rest of the main clause, so the sentence needs both.","- 'painted last spring can be seen' cuts across the main clause.")},{kind:'parenthesis',tagged:t});}

{const t='Mrs/noun.pr Patel/noun.pr our/det head/noun teacher/noun opened/verb the/det new/adj library/noun on/prep Friday/noun.pr ./';
w.add({prompt:'Which words should go between a **pair of dashes**?',stimulus:'Mrs Patel our head teacher opened the new library on Friday.',answer:'our head teacher',wrong:['Mrs Patel','opened the new library','on Friday'],rewardGroup:'challenge',
 explanation:explain("'our head teacher' tells us who Mrs Patel is. It is extra information, so a pair of dashes goes around it: 'Mrs Patel – our head teacher – opened the new library on Friday.'","- 'Mrs Patel' is the subject and 'opened the new library' is the verb and object: the sentence needs them.","- 'on Friday' tells us when and is at the end, so a pair of dashes cannot go around it.")},{kind:'parenthesis',tagged:t});}

w.add({prompt:'Which of these sentences uses a semicolon INCORRECTLY?',answer:'When the rain stopped; the match began.',wrong:['The rain stopped; the match began.','Jaya plays the violin; her brother plays the drums.','It was late; we went home.'],
 explanation:explain("'When the rain stopped' is a subordinate clause: it cannot stand alone, so a semicolon cannot follow it. It needs a comma: 'When the rain stopped, the match began.'",'- In the other sentences, both sides of the semicolon are main clauses that could be sentences on their own.')},
 fixes('incorrect',{'When the rain stopped; the match began.':'When the rain stopped, the match began.','The rain stopped; the match began.':'The rain stopped; the match began.','Jaya plays the violin; her brother plays the drums.':'Jaya plays the violin; her brother plays the drums.','It was late; we went home.':'It was late; we went home.'}));

w.add({prompt:'Select the punctuation mark that is **missing** from the sentence below.',stimulus:'Pack these items for the trip a torch, a towel and a packed lunch.',answer:"Colon after 'trip'",wrong:["Colon after 'items'","Semicolon after 'trip'","Comma after 'trip'"],
 explanation:explain("'Pack these items for the trip' is a complete clause, and a list follows, so a **colon** goes after 'trip'.","- A colon after 'items' would come before the clause is complete.",'- A semicolon joins two main clauses; it does not introduce a list.','- A comma would not show that the list is about to start.')},
 {kind:'missing',full:'Pack these items for the trip: a torch, a towel and a packed lunch.'});

w.add({prompt:'What is the function of the **colon** in this sentence?',stimulus:'Noah was late for school: his bike had a flat tyre.',answer:'to introduce an explanation of the first part',wrong:['to introduce a list of items','to join two unrelated sentences','to show that letters are missing'],
 explanation:explain("The words after the colon explain **why** Noah was late. A colon can introduce an explanation after a complete clause.",'- There is no list here.','- The two parts are closely linked, not unrelated.','- Missing letters are shown by an apostrophe.')},{kind:'markRole',mark:':'});

w.add({prompt:'What is the function of the **dashes** in this sentence?',stimulus:'The puppy – a bundle of wet fur – shook itself all over the kitchen.',answer:'to mark off extra information',wrong:['to join two words into one','to introduce a list of items','to separate two main clauses'],rewardGroup:'quick',
 explanation:explain("'a bundle of wet fur' is extra information about the puppy. The pair of dashes marks it off, and the sentence still makes sense without it.",'- A hyphen, not a dash, joins words into one.','- There is no list, and the words between the dashes are not a main clause.')},{kind:'markRole',mark:'–'});

w.add({prompt:'What does the hyphen tell you in the sentence below?',stimulus:'We watched a man-eating lion at the safari park.',answer:'The lion eats people.',wrong:['A man was eating a lion.','A man and a lion were eating together.','The lion was eating next to a man.'],rewardGroup:'challenge',
 explanation:explain("The hyphen joins **man** and **eating** into one adjective describing the lion: a lion that eats people.","- Without the hyphen, 'a man eating lion' could be read as a man who is eating lion meat.")});

w.add({prompt:'Where is a **hyphen** needed in the sentence below?',stimulus:'The twins built a snow covered fort in the garden.',answer:"between 'snow' and 'covered'",wrong:["between 'built' and 'a'","between 'fort' and 'in'","between 'the' and 'garden'"],
 explanation:explain("**snow** and **covered** work together as one adjective describing the fort, so they are joined with a hyphen: a **snow-covered** fort.",'- The other pairs of words do not join together to describe a noun.')},{kind:'hyphen',full:'The twins built a snow-covered fort in the garden.'});

w.add({prompt:"Which is the correct way to write 'the kit belonging to the players'?",answer:"the players' kit",wrong:["the player's kit","the players's kit",'the players kit'],
 explanation:explain("**players** is a plural that already ends in s, so add just an apostrophe after the s: the players' kit.","- 'the player's kit' would mean one player.","- 'players's' adds an extra s, and 'the players kit' has no apostrophe to show belonging.")},{kind:'possessive',owner:'players',plural:true,thing:'kit'});

w.add({prompt:"Which is the correct contraction of 'could not'?",answer:"couldn't",wrong:["could'nt",'couldnt',"coul'dnt"],rewardGroup:'quick',
 explanation:explain("The apostrophe goes exactly where the letter is missing: the **o** of 'not'. So could not → **couldn't**.","- 'could'nt' and 'coul'dnt' put the apostrophe in the wrong place, and 'couldnt' has none.")},{kind:'satsContraction',full:'could not'});

w.add({prompt:'How many apostrophes are missing from this sentence?',stimulus:'Its nearly time for the heroes supper, so lets wash our hands.',answer:'3',wrong:['1','2','4'],rewardGroup:'challenge',
 explanation:explain('Three apostrophes are missing:',"- **It's** (it is)","- **heroes'** (the supper belongs to the heroes: a plural ending in s takes an apostrophe after the s)","- **let's** (let us)")},
 {kind:'apostropheCount',corrected:"It's nearly time for the heroes' supper, so let's wash our hands."});

w.add({prompt:'Which word in the sentence below needs an apostrophe?',stimulus:'Kofis kite got stuck in the branches of the oak tree.',answer:'Kofis',wrong:['branches','kite','tree'],rewardGroup:'quick',
 explanation:explain("The kite belongs to Kofi, so **Kofis** needs an apostrophe: **Kofi's** kite.",'- **branches** is just a plural (more than one branch), so it does not need an apostrophe.','- **kite** and **tree** are ordinary nouns.')},{kind:'apostropheWord',corrected:"Kofi's kite got stuck in the branches of the oak tree."});

{const c='"Can we start the race now?" asked Tilly.',o=['"Can we start the race now," asked Tilly.','"Can we start the race now"? asked Tilly.','Can we start the race now? "asked Tilly."'];
w.add({prompt:'Which of these sentences with **direct speech** is punctuated correctly?',answer:c,wrong:o,
 explanation:explain('The spoken words are a question, so the **question mark** goes inside the closing inverted commas: "Can we start the race now?" asked Tilly.','- A comma cannot end a spoken question.','- The question mark must not go outside the inverted commas.',"- 'asked Tilly' is not spoken, so it must not be inside the inverted commas.")},fixes('correct',allTo(c,...o)));}

w.add({prompt:'Select the punctuation mark that is **missing** from the sentence below.',stimulus:'Mr Ahmed said "Everyone needs a partner for this task."',answer:"Comma after 'said'",wrong:["Full stop after 'said'","Comma after 'Everyone'","Comma after 'partner'"],
 explanation:explain("When the reporting clause comes first, a **comma** separates it from the speech: Mr Ahmed said, \"Everyone needs a partner for this task.\"","- A full stop would end the sentence before the speech.","- Commas after 'Everyone' or 'partner' would split the spoken words wrongly.")},
 {kind:'missing',full:'Mr Ahmed said, "Everyone needs a partner for this task."'});

w.add({prompt:'Select the punctuation mark that is **missing** from the sentence below.',stimulus:'"Mind the step, warned the guide as we entered the cave.',answer:"Inverted commas after 'step,'",wrong:["Comma after 'guide'","Inverted commas after 'cave.'","Full stop after 'step'"],
 explanation:explain('The spoken words are "Mind the step," so the closing **inverted commas** go straight after the comma: "Mind the step," warned the guide as we entered the cave.',"- 'warned the guide as we entered the cave' is not spoken, so it must stay outside the inverted commas.","- A full stop after 'step' would end the sentence too early.")},
 {kind:'missing',full:'"Mind the step," warned the guide as we entered the cave.'});

w.add({prompt:'Select the punctuation mark that is **missing** from the sentence below.',stimulus:'In the middle of the night the owls began to hoot.',answer:"Comma after 'night'",wrong:["Comma after 'middle'","Comma after 'owls'","Comma after 'began'"],rewardGroup:'quick',
 explanation:explain("'In the middle of the night' is a fronted adverbial, so a **comma** goes after it, before the main clause 'the owls began to hoot'.",'- A comma anywhere else would split the adverbial or the main clause.')},
 {kind:'missing',full:'In the middle of the night, the owls began to hoot.'});

w.add({prompt:'Why is a comma used in this sentence?',stimulus:'After a long climb, the heroes rested on the summit.',answer:'to separate a fronted adverbial from the main clause',wrong:['to separate items in a list','to show who is being spoken to','to mark off extra information'],
 explanation:explain("'After a long climb' is a fronted adverbial: it tells us when, and it comes before the subject. The comma separates it from the main clause 'the heroes rested on the summit'.",'- There is no list, no one is being spoken to, and nothing is extra information.')},{kind:'commaWhy',reason:'fronted',adverbial:'After a long climb'});

w.add({prompt:'Why are commas used in this sentence?',stimulus:'Bea grew carrots, beans and sunflowers in her patch.',answer:'to separate items in a list',wrong:['to separate a fronted adverbial from the main clause','to mark the end of a subordinate clause','to mark off extra information'],rewardGroup:'quick',
 explanation:explain('Carrots, beans and sunflowers is a list of three things, so a comma separates the first two items.','- The sentence has no fronted adverbial, no subordinate clause and no extra information.')},{kind:'commaWhy',reason:'list',items:['carrots','beans','sunflowers']});

w.add({prompt:'Which sentence asks Ruby whether she would like to paint?',answer:'Shall we paint, Ruby?',wrong:['Shall we paint Ruby?','Shall, we paint Ruby?','Shall we, paint Ruby?'],rewardGroup:'challenge',
 explanation:explain("The comma before **Ruby** shows that Ruby is the person being spoken to: 'Shall we paint, Ruby?'","- Without the comma, 'Shall we paint Ruby?' asks whether we should paint a picture of Ruby.",'- The other commas split the sentence in places that make no sense.')});

w.add({prompt:'How many commas does this sentence need?',stimulus:'If you finish early you may read quietly draw a picture or help a friend.',answer:'2',wrong:['1','3','4'],rewardGroup:'challenge',
 explanation:explain("One comma goes after the opening subordinate clause 'If you finish early'. Another separates the first two items in the list: read quietly, draw a picture or help a friend. That makes **2** commas.","- 'If you finish early, you may read quietly, draw a picture or help a friend.'")},
 {kind:'commaCount',full:'If you finish early, you may read quietly, draw a picture or help a friend.'});

w.add({prompt:'Which list uses bullet points **consistently**?',stimulus:'To enter the baking contest you will need:',answer:'• a clean apron • a tin for your cake • a label with your name',wrong:['• A clean apron • a tin for your cake. • A label with your name','• a clean apron. • A tin for your cake • a label with your name.','• A clean apron. • A tin for your cake • A label with your name'],
 explanation:explain('In a consistent list, every bullet point is written the same way. Here each point starts with a small letter and has no full stop, because each one just finishes the sentence that comes before the list.','- In the other lists, some points start with a capital letter and some do not, or some end with a full stop and some do not.')},{kind:'bullets'});

{const cards=['What a muddy pitch this is!','Have you brought your boots?','Hurry up, or we will miss the kick-off.','Where is the referee.'];
w.add({prompt:'Which of these sentences is punctuated INCORRECTLY?',...lettered(cards,3,'Four sentences about a football match on cards labelled A to D'),
 explanation:explain("'Where is the referee' asks a question, so it must end with a **question mark**: 'Where is the referee?'",'Card **D** is the one with the mistake.','- A is an exclamation with an exclamation mark, B is a question with a question mark and C is a command with a comma before the conjunction and a full stop at the end.')},
 {kind:'fixes',want:'incorrect',cards,fixed:['What a muddy pitch this is!','Have you brought your boots?','Hurry up, or we will miss the kick-off.','Where is the referee?']});}

{const c='Sami needs three things for the recipe: butter, sugar and flour.',o=['Sami needs: three things for the recipe, butter, sugar and flour.','Sami needs three things for the recipe; butter, sugar and flour.','Sami needs three things for the recipe, butter: sugar and flour.'];
w.add({prompt:'Which of these sentences uses a **colon** correctly?',answer:c,wrong:o,
 explanation:explain("'Sami needs three things for the recipe' is a complete clause, so a colon can follow it to introduce the list: butter, sugar and flour.","- 'Sami needs:' puts the colon straight after the verb, before the clause is complete.",'- A semicolon does not introduce a list.','- A colon in the middle of the list is in the wrong place.')},fixes('correct',allTo(c,...o)));}

export const satsPunctuation=w.done();
