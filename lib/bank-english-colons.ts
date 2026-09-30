import {explain,type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
// Colons, semicolons, dashes, brackets and hyphens. Dashes are spaced en dashes ( – ), as in British print.

const topic:Topic={id:'en-colons-semicolons',subject:'English',strand:'Punctuation',title:'Colons, semicolons, dashes, brackets and hyphens',helpsheet:{
 intro:'These marks organise ideas in a sentence. A **colon** (:) introduces a list or an explanation. A **semicolon** (;) joins two closely linked main clauses, or separates list items that already contain commas. **Dashes** ( – ) and **brackets** ( ) add extra information. A **hyphen** (-) joins words to make one idea.',
 steps:[
  "**Colon**: the words before it must make a complete sentence: 'We need three things: a map, a torch and a whistle.'",
  "**Semicolon**: both parts must be able to stand alone as sentences: 'The sun was hot; the sand burned our feet.'",
  '**Brackets** or a pair of **dashes** go around extra information. The sentence must still make sense without it.',
  '**Hyphens** join words that work together, especially before a noun (a well-behaved puppy, a four-day trip), and some prefixes (co-operate).',
 ],
 example:{title:'Four marks at work',lines:['Our class trip (the first one this year) had one rule: stay together.','The coach left at nine; we arrived by ten.','Our guide – a very friendly woman – told us a long-forgotten legend.']},
 tips:['A hyphen joins words with no spaces (mother-in-law); a dash separates parts of a sentence and has a space on each side.',"Do not put a colon straight after a verb: 'You will need: a coat' is wrong. Write 'You will need two things: a coat and boots.'",'Brackets, dashes and commas can all mark extra information. Always use them in pairs.'],
}};

const w=writer(topic);

w.add({prompt:'Which sentence uses a colon correctly?',answer:'Bring three things: a torch, a map and a whistle.',wrong:['Bring: a torch, a map and a whistle.','Bring three things, a torch: a map and a whistle.','Bring three: things a torch, a map and a whistle.'],
 explanation:explain("A colon introduces a list after a **complete** opening clause. 'Bring three things' makes sense on its own, so the colon can follow it.","- 'Bring:' puts the colon straight after the verb, before the clause is complete.",'- The other two options put the colon inside the list or inside the clause.')},
 {kind:'fixes',want:'correct',fixes:{'Bring three things: a torch, a map and a whistle.':'Bring three things: a torch, a map and a whistle.','Bring: a torch, a map and a whistle.':'Bring a torch, a map and a whistle.','Bring three things, a torch: a map and a whistle.':'Bring three things: a torch, a map and a whistle.','Bring three: things a torch, a map and a whistle.':'Bring three things: a torch, a map and a whistle.'}});

w.add({prompt:'Which sentence uses a colon to introduce an **explanation**?',answer:'The match was cancelled: the pitch was flooded.',wrong:['The match was: cancelled because the pitch was flooded.','The match: was cancelled, the pitch was flooded.','The match was cancelled, the pitch: was flooded.'],
 explanation:explain("The second part explains **why** the match was cancelled, so a colon between the two complete clauses works: 'The match was cancelled: the pitch was flooded.'",'- In the other options, the colon splits a clause in the middle, where it does not belong.')});

w.add({prompt:'Which sentence uses a semicolon correctly?',answer:'The wind howled; the shutters banged all night.',wrong:['The wind; howled and the shutters banged all night.','The wind howled and; the shutters banged all night.','The wind howled; all night long.'],
 explanation:explain("A semicolon joins two closely linked main clauses. 'The wind howled' and 'the shutters banged all night' can each stand alone, so the semicolon is correct.",'- In the other options, one side of the semicolon is not a complete clause.')});

w.add({prompt:'Which sentence uses semicolons correctly in a list?',answer:'On our tour we visited Bath, in Somerset; Chester, in Cheshire; and York, in Yorkshire.',wrong:['On our tour we visited Bath; in Somerset, Chester; in Cheshire, and York; in Yorkshire.','On our tour we visited; Bath, in Somerset, Chester, in Cheshire and York, in Yorkshire.','On our tour; we visited Bath, in Somerset, Chester, in Cheshire, and York, in Yorkshire.'],rewardGroup:'challenge',
 explanation:explain('Each item in this list already contains a comma (Bath, in Somerset), so **semicolons** go between the items to keep them clear.',"- Putting semicolons straight after Bath, Chester and York splits each item in two instead of separating the items.","- A single semicolon after 'visited' or 'tour' is in the wrong place and leaves the items hard to tell apart.")});

w.add({prompt:'Which sentence uses dashes correctly to add extra information?',answer:'My aunt – who is a pilot – flew to Canada last week.',wrong:['My aunt who – is a pilot – flew to Canada last week.','My aunt – who is a pilot flew – to Canada last week.','My – aunt who is a pilot – flew to Canada last week.'],
 explanation:explain("The extra information is 'who is a pilot', so the pair of dashes goes around exactly those words. Take them out and the sentence still makes sense: 'My aunt flew to Canada last week.'",'- The other options put a dash inside the extra information or around the wrong words.')});

w.add({prompt:'Which words should go inside **brackets**?',stimulus:'The old hall which was built in 1620 is open to visitors.',answer:'which was built in 1620',wrong:['The old hall','is open to visitors','built in 1620 is open'],
 explanation:explain("'which was built in 1620' is extra information about the hall. Put it in brackets and the sentence still makes sense without it: 'The old hall is open to visitors.'",'- The other groups of words are needed for the main sentence, or cut across it.')});

w.add({prompt:"What does the hyphen show in the phrase 'a small-animal hospital'?",answer:'The hospital treats small animals.',wrong:['The hospital building is small.','The hospital treats animals of every size.','The animals are kept in a small room.'],rewardGroup:'challenge',
 explanation:explain('The hyphen joins **small** and **animal** into one describing idea, so the hospital treats **small animals**, such as rabbits and hamsters.',"- Without the hyphen, 'a small animal hospital' could mean a small hospital for any animals.")});

w.add({prompt:'Which phrase is hyphenated correctly?',answer:'a well-known author',wrong:['a well known-author','a-well known author','a well-known-author'],
 explanation:explain('**well** and **known** work together to describe the author, so a hyphen joins them: a well-known author.',"- The hyphen should not join 'known' to 'author', or 'a' to 'well'.")});

{const c='My great-grandmother is ninety-two.',o=['My great grandmother is ninety two.','My great-grand-mother is ninety-two.','My great-grandmother is ninety two.'];
w.add({prompt:'Which sentence uses hyphens correctly?',answer:c,wrong:o,
 explanation:explain('**great-grandmother** is written with a hyphen, and so are numbers between twenty-one and ninety-nine that are written in words: **ninety-two**.','- One option leaves out both hyphens, and another leaves out the hyphen in ninety-two.',"- 'great-grand-mother' adds a hyphen inside the word grandmother.")},
 {kind:'fixes',want:'correct',fixes:Object.fromEntries([c,...o].map(x=>[x,c]))});}

w.add({prompt:'Select the punctuation mark that is **missing** from the sentence below.',stimulus:'The recipe needs three things eggs, flour and milk.',answer:"Colon after 'things'",wrong:["Semicolon after 'things'","Colon after 'needs'","Dash after 'recipe'"],rewardGroup:'challenge',
 explanation:explain("'The recipe needs three things' is a complete clause and a list follows, so a **colon** is missing after 'things'.",'- A semicolon does not introduce a list.',"- A colon after 'needs' would come before the clause is complete.")},
 {kind:'missing',full:'The recipe needs three things: eggs, flour and milk.'});

w.add({prompt:'Which punctuation could replace the brackets without changing the meaning?',stimulus:'Our cat (a very lazy tabby) sleeps all day.',answer:'a pair of dashes',wrong:['a pair of semicolons','a single colon','a pair of hyphens'],rewardGroup:'challenge',
 explanation:explain("Brackets and a **pair of dashes** can both mark extra information: 'Our cat – a very lazy tabby – sleeps all day.'",'- Semicolons join clauses, and a colon introduces a list or an explanation.','- Hyphens join words together; they do not mark extra information.')});

w.add({prompt:'Which sentence uses a single dash correctly?',answer:'We waited for hours – and then the rain finally stopped.',wrong:['We – waited for hours and then the rain finally stopped.','We waited for – hours and then the rain finally stopped.','We waited for hours and then the – rain finally stopped.'],
 explanation:explain("A single dash can come before a final surprise or afterthought: '– and then the rain finally stopped.'",'- In the other options, the dash breaks up a phrase where there should be no pause.')});

w.add({prompt:'Which sentence contains a **hyphen**?',answer:'My sister-in-law bakes bread.',wrong:['My sister – who loves baking – makes bread.','My sister bakes three things: bread, rolls and cakes.','My sister (a baker) makes bread.'],rewardGroup:'quick',
 explanation:explain('**sister-in-law** uses hyphens to join three words into one noun.',"- The sentence about the sister who loves baking uses dashes, which have spaces around them and separate extra information.",'- The others use a colon and brackets.')});

w.add({prompt:"Why does 're-enter' have a hyphen?",answer:"to stop two e's coming together",wrong:['because it is a compound noun','to show that a letter is missing','because it begins a sentence'],rewardGroup:'challenge',
 explanation:explain("Without the hyphen, the prefix **re-** and the word **enter** would put two e's side by side (reenter), which is hard to read. The hyphen keeps them apart: re-enter.",'- Missing letters are shown by an apostrophe, and re-enter is a verb, not a compound noun.')});

w.add({prompt:'Which sentence uses a semicolon INCORRECTLY?',answer:'Although it was late; we kept reading.',wrong:['I love autumn; the leaves are beautiful.','The shop was shut; we went home.','Tilly plays the drums; Sami plays the flute.'],
 explanation:explain("'Although it was late' is a subordinate clause. It cannot stand alone, so a semicolon cannot follow it: it needs a comma instead.",'- In the other sentences, both sides of the semicolon are main clauses.')},
 {kind:'fixes',want:'incorrect',fixes:{'Although it was late; we kept reading.':'Although it was late, we kept reading.','I love autumn; the leaves are beautiful.':'I love autumn; the leaves are beautiful.','The shop was shut; we went home.':'The shop was shut; we went home.','Tilly plays the drums; Sami plays the flute.':'Tilly plays the drums; Sami plays the flute.'}});

w.add({prompt:'Select the punctuation mark that is **missing** from the sentence below.',stimulus:'The first team wore red the second team wore blue.',answer:"Semicolon after 'red'",wrong:["Comma after 'red'","Colon after 'first'","Semicolon after 'second'"],
 explanation:explain("'The first team wore red' and 'the second team wore blue' are two closely linked main clauses, so a **semicolon** joins them.",'- A comma on its own cannot join two main clauses.',"- A colon after 'first' or a semicolon after 'second' would split a clause in the middle.")},
 {kind:'missing',full:'The first team wore red; the second team wore blue.'});

w.add({prompt:'Which sentence uses brackets correctly?',answer:'The castle (built over 800 years ago) stands on a hill.',wrong:['The castle (built over 800 years) ago stands on a hill.','The (castle built over 800 years ago) stands on a hill.','The castle built (over 800 years ago stands) on a hill.'],
 explanation:explain("The extra information is 'built over 800 years ago'. The brackets go around exactly those words, and without them the sentence still makes sense: 'The castle stands on a hill.'",'- The other options put the brackets around the wrong words.')});

w.add({prompt:'Where is a **hyphen** needed in the sentence below?',stimulus:'We set off on a two hour journey to the coast.',answer:"between 'two' and 'hour'",wrong:["between 'set' and 'off'","between 'to' and 'the'","between 'the' and 'coast'"],
 explanation:explain('**two** and **hour** work together to describe the journey, so they are joined with a hyphen: a **two-hour** journey.','- The other pairs of words do not work together to describe a noun, so they do not need a hyphen.')},
 {kind:'hyphen',full:'We set off on a two-hour journey to the coast.'});

export const colons=w.done();
