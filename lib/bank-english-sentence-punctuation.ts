import {explain,type Topic} from './bank-kit';
import {writer,lettered} from './bank-english-kit';
// Sentence punctuation: capital letters, full stops, question marks and exclamation marks.
// Notes: 'proof' (the fully corrected sentence), 'fixes' (each option or card with its corrected form), 'missing' (the text
// with the missing mark put back), 'endMark' (the finished sentence) and 'capitals' (the sentence with its capitals corrected).

const topic:Topic={id:'en-sentence-punctuation',subject:'English',strand:'Punctuation',title:'Sentence punctuation',helpsheet:{
 intro:'Every sentence starts with a **capital letter** and ends with a **full stop**, **question mark** or **exclamation mark**. Capital letters are also used for **I** and for proper nouns: the names of people, places, days, months and languages, and titles used with names.',
 steps:[
  'Check that the first word has a capital letter.',
  'Check every name, place, day, month and title used with a name (Mr, Aunt, Dr), and the word I.',
  'Choose the end mark: a question asks (?), an exclamation shows strong feeling (!), and other sentences take a full stop.',
  'If two sentences have been run together, put a full stop between them and start the second with a capital letter.',
 ],
 example:{title:'Fixing a sentence',lines:['Before: on tuesday aunt meg and i baked bread','After: **O**n **T**uesday, **A**unt **M**eg and **I** baked bread**.**']},
 tips:['Seasons (spring, winter) and school subjects (maths, history) do not need capitals, but languages do (Welsh, Spanish).',"An indirect question does not take a question mark: 'She wondered where the key was.'","Use one end mark only: 'What a day!' not 'What a day!!'"],
}};

const w=writer(topic);
const CARDS='Four versions of the sentence on cards labelled A to D';

{const correct='On Friday, Mrs Ahmed took our class to the castle.';
w.add({prompt:'This sentence contains mistakes. Which card shows it with **all** the mistakes corrected?',stimulus:'on friday, mrs ahmed took our class to the castle',
 ...lettered(['On friday, Mrs Ahmed took our class to the castle.','On Friday, mrs Ahmed took our class to the castle.',correct,'On Friday, Mrs Ahmed took our class to the castle'],2,CARDS),
 explanation:explain('The sentence needs:','- a capital letter at the start: **On**','- capitals for the day and the name: **Friday**, **Mrs Ahmed**','- a full stop at the end.',"Card **C** has all of these. A still has 'friday', B still has 'mrs' and D has no full stop.")},{kind:'proof',correct});}

{const correct='Have you seen the new library in Bristol?';
w.add({prompt:'This sentence contains mistakes. Which card shows it with **all** the mistakes corrected?',stimulus:'have you seen the new library in bristol',
 ...lettered([correct,'Have you seen the new library in bristol?','Have You seen the new library in Bristol?','Have you seen the new library in Bristol.'],0,CARDS),
 explanation:explain('It is a question, so it needs a **question mark**. It also needs a capital for **Have** at the start and for **Bristol**, the name of a city.',"Card **A** has all of these.","- B is missing the capital for Bristol.","- C gives 'You' a capital letter, which it does not need in the middle of a sentence.",'- D ends with a full stop instead of a question mark.')},{kind:'proof',correct});}

{const correct='What a wonderful surprise that was!';
w.add({prompt:'This sentence contains mistakes. Which card shows it with **all** the mistakes corrected?',stimulus:'what a wonderful surprise that was',
 ...lettered(['What a wonderful surprise that was.','what a wonderful surprise that was!','What a wonderful surprise that was?',correct],3,CARDS),
 explanation:explain('It is an exclamation: it starts with **What** and needs an **exclamation mark**. It also needs a capital letter at the start.','Card **D** has both.','- A and C end with the wrong mark.','- B does not start with a capital letter.')},{kind:'proof',correct});}

{const correct='Priya packed her torch, map and compass for the trip to Snowdon.';
w.add({prompt:'This sentence contains mistakes. Select the option which has corrected these mistakes.',stimulus:'priya packed her torch map and compass for the trip to snowdon',answer:correct,
 wrong:['Priya packed her torch map, and compass for the trip to Snowdon.','Priya packed her, torch, map and compass for the trip to Snowdon.','Priya packed her torch map and compass for the trip to Snowdon.'],
 explanation:explain('The sentence needs capital letters for **Priya** and **Snowdon** (names), a comma between the first two items in the list (**torch, map and compass**) and a full stop.',"- The other options leave out the list comma, put it in the wrong place, or add a comma after 'her'.")},{kind:'proof',correct});}

w.add({prompt:'Which of these sentences is punctuated INCORRECTLY?',answer:'Have you seen my scarf.',wrong:['Where are my wellies?','What a muddy walk that was!','Please wipe your boots on the mat.'],
 explanation:explain("'Have you seen my scarf' is a question, so it should end with a **question mark**, not a full stop.",'- The others are correct: a question with a question mark, an exclamation with an exclamation mark and a command with a full stop.')},
 {kind:'fixes',want:'incorrect',fixes:{'Have you seen my scarf.':'Have you seen my scarf?','Where are my wellies?':'Where are my wellies?','What a muddy walk that was!':'What a muddy walk that was!','Please wipe your boots on the mat.':'Please wipe your boots on the mat.'}});

w.add({prompt:'Which of these sentences is punctuated INCORRECTLY?',answer:'Next Summer, we will go camping.',wrong:['My aunt lives in Edinburgh.','We are visiting her in August.','Her dog is called Pepper.'],
 explanation:explain('Seasons are not proper nouns, so **summer** should not have a capital letter.','- Edinburgh, August and Pepper are the names of a place, a month and a pet, so they need capitals.')},
 {kind:'fixes',want:'incorrect',fixes:{'Next Summer, we will go camping.':'Next summer, we will go camping.','My aunt lives in Edinburgh.':'My aunt lives in Edinburgh.','We are visiting her in August.':'We are visiting her in August.','Her dog is called Pepper.':'Her dog is called Pepper.'}});

{const cards=['Is it time for lunch yet?','Mum asked if it was time for lunch?','It is nearly time for lunch.','What a delicious lunch that was!',"Is lunch at twelve o'clock?"];
w.add({prompt:'Which of these sentences is punctuated INCORRECTLY?',...lettered(cards,1,'Five sentences about lunch on cards labelled A to E'),
 explanation:explain("B reports a question without asking it directly: 'Mum asked if it was time for lunch.' This is an **indirect question**, so it ends with a full stop, not a question mark.",'- A and E are direct questions, C is a statement and D is an exclamation. All four are punctuated correctly.')},
 {kind:'fixes',want:'incorrect',cards,fixed:['Is it time for lunch yet?','Mum asked if it was time for lunch.','It is nearly time for lunch.','What a delicious lunch that was!',"Is lunch at twelve o'clock?"]});}

w.add({prompt:'Select the punctuation mark that is **missing** from the text below.',stimulus:'The heroes guarded the gate all night Nobody slept.',answer:"Full stop after 'night'",wrong:["Comma after 'night'","Comma after 'heroes'","Full stop after 'gate'"],
 explanation:explain("'The heroes guarded the gate all night' and 'Nobody slept' are two separate sentences. The second already starts with a capital letter, so a **full stop** is missing after 'night'.",'- A comma is not strong enough to separate two sentences.',"- A comma after 'heroes' or a full stop after 'gate' would split the sentence in the wrong place.")},
 {kind:'missing',full:'The heroes guarded the gate all night. Nobody slept.'});

w.add({prompt:'Select the punctuation mark that is **missing** from the text below.',stimulus:'Did you remember to feed the fish I forgot to do it this morning.',answer:"Question mark after 'fish'",wrong:["Full stop after 'fish'","Exclamation mark after 'fish'","Comma after 'remember'"],
 explanation:explain("'Did you remember to feed the fish' is a question, so it needs a **question mark** after 'fish'. 'I forgot…' is a new sentence.",'- A full stop or an exclamation mark would not show that it is a question.')},
 {kind:'missing',full:'Did you remember to feed the fish? I forgot to do it this morning.'});

w.add({prompt:'Select the punctuation mark that is **missing** from the text below.',stimulus:'What a fantastic surprise this is',answer:"Exclamation mark after 'is'",wrong:["Question mark after 'is'","Comma after 'What'","Full stop after 'surprise'"],
 explanation:explain('The sentence starts with **What** and is an exclamation, so it needs an **exclamation mark** at the end.','- It does not ask for an answer, so a question mark is wrong.')},
 {kind:'missing',full:'What a fantastic surprise this is!'});

w.add({prompt:'Which punctuation mark should end this sentence?',stimulus:'Ben asked me where the nearest bus stop was',answer:'full stop',wrong:['question mark','exclamation mark','comma'],rewardGroup:'challenge',
 explanation:explain("This sentence reports what Ben asked; it does not ask the question itself. A reported question ends with a **full stop**.","- Ben's direct question would be: 'Where is the nearest bus stop?'")},
 {kind:'endMark',full:'Ben asked me where the nearest bus stop was.'});

w.add({prompt:'Which punctuation mark should end this sentence?',stimulus:'How many eggs do we need for the pancakes',answer:'question mark',wrong:['full stop','exclamation mark','comma'],rewardGroup:'quick',
 explanation:explain('It asks for information, so it needs a **question mark**.')},
 {kind:'endMark',full:'How many eggs do we need for the pancakes?'});

w.add({prompt:'Which punctuation mark should end this sentence?',stimulus:'How beautiful the garden looks in spring',answer:'exclamation mark',wrong:['question mark','semicolon','comma'],rewardGroup:'challenge',
 explanation:explain('It starts with **How**, but it does not ask anything: it shows strong feeling, so it is an exclamation and needs an **exclamation mark**.',"- A question would be: 'How does the garden look in spring?'")},
 {kind:'endMark',full:'How beautiful the garden looks in spring!'});

w.add({prompt:'How many capital letters are missing from this sentence?',stimulus:'on saturday, zara and i visited ruth in cardiff.',answer:'6',wrong:['4','5','7'],rewardGroup:'challenge',
 explanation:explain('Six capital letters are missing:','- **On** (the start of the sentence)','- **Saturday** (a day)','- **Zara** and **Ruth** (names)','- **I** (always a capital)','- **Cardiff** (a place)')},
 {kind:'capitals',corrected:'On Saturday, Zara and I visited Ruth in Cardiff.'});

w.add({prompt:'Which word in the sentence below should **not** have a capital letter?',stimulus:'Last Winter, we visited Edinburgh Castle in Scotland.',answer:'Winter',wrong:['Last','Edinburgh','Scotland'],
 explanation:explain('Seasons are not proper nouns, so **winter** should not have a capital letter.','- **Last** starts the sentence, and **Edinburgh** (Castle) and **Scotland** are names of places, so they need capitals.')},
 {kind:'capitals',corrected:'Last winter, we visited Edinburgh Castle in Scotland.'});

{const correct='My brother and I are learning French.';
w.add({prompt:'Which card shows the sentence with capital letters used correctly?',
 ...lettered(['My brother and i are learning French.','My brother and I are learning french.','My Brother and I are learning French.',correct],3,CARDS),
 explanation:explain("**I** is always a capital letter, and the names of languages such as **French** need capitals. 'brother' is a common noun, so it does not.",'Card **D** is correct.','- A has a small i, B has a small f in French and C gives brother a capital letter.')},{kind:'proof',correct});}

w.add({prompt:'Which of these is a correctly punctuated **question**?',answer:'Where did you put the map?',wrong:['I asked where you had put the map?','Did you put the map in the drawer.','When will the new map arrive.'],
 explanation:explain("'Where did you put the map?' asks a question directly and ends with a question mark.","- 'I asked where you had put the map' reports a question, so it needs a full stop.",'- The other two are direct questions, so they should end with question marks.')},
 {kind:'fixes',want:'correct',fixes:{'Where did you put the map?':'Where did you put the map?','I asked where you had put the map?':'I asked where you had put the map.','Did you put the map in the drawer.':'Did you put the map in the drawer?','When will the new map arrive.':'When will the new map arrive?'}});

{const correct='The fox crept closer. The hens began to squawk.';
w.add({prompt:'This text contains mistakes. Select the option which has corrected these mistakes.',stimulus:'the fox crept closer the hens began to squawk',answer:correct,
 wrong:['The fox crept closer, the hens began to squawk.','The fox crept. Closer the hens began to squawk.','The fox crept closer the hens. Began to squawk.'],
 explanation:explain("There are two sentences: 'The fox crept closer' and 'The hens began to squawk'. Each needs a capital letter at the start and a full stop at the end.",'- A comma cannot join two sentences like this.','- The other two options split the words in the wrong place, so the sentences do not make sense.')},{kind:'proof',correct});}

export const sentencePunctuation=w.done();
