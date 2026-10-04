import {explain,type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
// Clauses and sentence types: main, subordinate and relative clauses; statements, questions, commands and exclamations.

const topic:Topic={id:'en-clauses',subject:'English',strand:'Grammar',title:'Clauses and sentence types',helpsheet:{
 intro:'A **clause** is a group of words with a verb and its subject. A **main clause** makes sense on its own. A **subordinate clause** adds information but cannot stand alone. A **relative clause** is a subordinate clause that tells us more about a noun; it begins with who, which, that or whose.',
 steps:[
  'Find each verb: every clause has its own verb.',
  'Cover the part that begins with a subordinating conjunction (because, when, if, although …) or a relative pronoun (who, which …). What is left should make sense: that is the main clause.',
  'Decide the sentence type: a **statement** tells, a **question** asks, a **command** gives an instruction (often starting with a verb) and an **exclamation** starts with What or How and ends with !',
  "A group of words with no verb ('after the long walk') is a **phrase**, not a clause.",
 ],
 example:{title:'Clauses in a sentence',lines:['While the kettle boiled, Mum, who was humming, buttered the toast.','- Main clause: **Mum buttered the toast**','- Subordinate clause: **While the kettle boiled**','- Relative clause: **who was humming** (it tells us more about Mum)']},
 tips:["'Watch out!' ends with an exclamation mark, but it is a command. A grammatical exclamation starts with What or How: 'What a view that is!'","A subordinate clause on its own is not a complete sentence.",'A relative clause that adds extra information is marked off with commas.'],
}};

const w=writer(topic);

w.add({prompt:'Which words are the **main clause** in the sentence below?',stimulus:'Although the path was muddy, we reached the top of the hill.',answer:'we reached the top of the hill',wrong:['Although the path was muddy','Although the path','the top of the hill'],
 explanation:explain("'**we reached the top of the hill**' makes sense on its own, so it is the main clause.","- 'Although the path was muddy' begins with the subordinating conjunction although, so it is a subordinate clause.","- 'Although the path' is only part of that subordinate clause, and 'the top of the hill' is a phrase with no verb.")});

w.add({prompt:'Which words are the **subordinate clause** in the sentence below?',stimulus:'The crowd cheered loudly when the heroes returned to the manor.',answer:'when the heroes returned to the manor',wrong:['The crowd cheered loudly','cheered loudly when the heroes','to the manor'],
 explanation:explain("'**when the heroes returned to the manor**' begins with the subordinating conjunction when. It tells us when the crowd cheered, but it cannot stand alone.","- 'The crowd cheered loudly' is the main clause.","- 'cheered loudly when the heroes' mixes part of the main clause with part of the subordinate clause.","- 'to the manor' is a phrase with no verb.")});

w.add({prompt:'Which words form the **relative clause** in the sentence below?',stimulus:'The painting, which hung above the fireplace, was two hundred years old.',answer:'which hung above the fireplace',wrong:['The painting','was two hundred years old','above the fireplace'],
 explanation:explain("'**which hung above the fireplace**' begins with the relative pronoun which and tells us more about the painting, so it is the relative clause.","- 'above the fireplace' is only part of it.","- 'The painting … was two hundred years old' is the main clause.")});

w.add({prompt:'What type of sentence is this?',stimulus:'What a brilliant goal that was!',answer:'exclamation',wrong:['command','question','statement'],rewardGroup:'quick',
 explanation:explain('It starts with **What**, includes a verb (was) and ends with an exclamation mark, so it is an **exclamation**.','- It does not ask for an answer, so it is not a question, and it does not tell anyone to do anything, so it is not a command.')},{kind:'sentenceType'});

w.add({prompt:'What type of sentence is this?',stimulus:'Tidy your room before dinner, please.',answer:'command',wrong:['statement','question','exclamation'],rewardGroup:'quick',
 explanation:explain('The sentence tells someone to do something and begins with the imperative verb **Tidy**, so it is a **command**.',"- Adding 'please' makes it polite, but it is still a command.")},{kind:'sentenceType'});

w.add({prompt:'What type of sentence is this?',stimulus:'How did the fox get into the henhouse?',answer:'question',wrong:['exclamation','statement','command'],rewardGroup:'quick',
 explanation:explain('It asks for information and ends with a question mark, so it is a **question**.',"- Some exclamations also start with How, but they do not ask anything: 'How clever that fox was!'")},{kind:'sentenceType'});

w.add({prompt:'Which word begins the **subordinate clause** in the sentence below?',stimulus:'The ducks waddled back to the pond after the rain had stopped.',answer:'after',wrong:['back','to','had'],
 explanation:explain("'**after** the rain had stopped' is a subordinate clause: it has its own verb (had stopped) and cannot stand alone. It begins with the subordinating conjunction **after**.",'- **back** is an adverb, **to** is a preposition and **had** is part of the verb.')});

w.add({prompt:'Which sentence is a **command**?',answer:'Please close the gate behind you.',wrong:['Did you close the gate?','The gate is closed.','What a heavy gate that is!'],rewardGroup:'quick',
 explanation:explain("'Please close the gate behind you.' tells someone to do something, using the imperative verb **close**.",'- The others are a question, a statement and an exclamation.')},{kind:'sentenceTypeOptions',target:'command'});

w.add({prompt:'How many clauses are in this sentence?',stimulus:'When the wind dropped, we launched the kite and it soared above the trees.',answer:'3',wrong:['1','2','4'],rewardGroup:'challenge',
 explanation:explain('Each clause has its own verb: **dropped**, **launched** and **soared**. So there are 3 clauses:',"- 'When the wind dropped' (subordinate clause)","- 'we launched the kite' (main clause)","- 'it soared above the trees' (main clause, joined by and)")},
 {kind:'clauses',clauses:['When the wind dropped','we launched the kite','it soared above the trees']});

w.add({prompt:'Which sentence contains a **subordinate clause**?',answer:'We waited at the gate until the bell rang.',wrong:['We waited at the gate and the bell rang.','We waited quietly at the gate.','At the gate, we waited for the bell.'],rewardGroup:'challenge',
 explanation:explain("'**until the bell rang**' has its own verb (rang) and begins with a subordinating conjunction, so it is a subordinate clause.","- 'and the bell rang' is a second main clause, joined by a co-ordinating conjunction.","- 'At the gate' and 'for the bell' are phrases: they have no verb.")});

w.add({prompt:'Which sentence contains a **relative clause**?',answer:'The dog that chased the ball belongs to Ellie.',wrong:['The dog chased the ball because it was bored.','After chasing the ball, the dog slept.','The dog chased the ball and caught it.'],
 explanation:explain("'**that chased the ball**' tells us which dog, and it begins with the relative pronoun that, so it is a relative clause.","- 'because it was bored' is a subordinate clause giving a reason, not a relative clause.",'- The other sentences have no relative clause.')});

w.add({prompt:'Which of these is **not** a complete sentence?',answer:'Because the train was late.',wrong:['The train was late.','The train was late, so we waited.','We waited because the train was late.'],rewardGroup:'challenge',
 explanation:explain("'Because the train was late.' is a subordinate clause on its own. It has no main clause, so it does not make complete sense.","- The other three each contain a main clause ('The train was late' or 'we waited').")});

w.add({prompt:'Which words complete the sentence with a **main clause**?',stimulus:'If it snows tomorrow, ___',answer:'we will build a snowman.',wrong:['because we love snow.','and very cold.','when the snow falls.'],
 explanation:explain("The sentence starts with a subordinate clause, so it needs a **main clause** to make sense: '**we will build a snowman**' can stand on its own.","- 'because we love snow' and 'when the snow falls' are more subordinate clauses.","- 'and very cold' has no verb.")});

w.add({prompt:'Which of these is a **clause**?',answer:'the rain fell',wrong:['under a grey sky','after the heavy rain','a very rainy day'],rewardGroup:'quick',
 explanation:explain("A clause contains a verb and its subject: '**the rain fell**' has the subject 'the rain' and the verb 'fell'.",'- The other three are phrases: they have no verb.')});

w.add({prompt:'Select the **two** relative clauses in the sentence below.',stimulus:'The teacher who runs the chess club lent Ben a book that he loved.',answer:['who runs the chess club','that he loved'],wrong:['The teacher','lent Ben a book','the chess club'],rewardGroup:'challenge',
 explanation:explain("'**who runs the chess club**' tells us which teacher, and '**that he loved**' tells us about the book. Both begin with a relative pronoun, so they are relative clauses.","- 'The teacher … lent Ben a book' is the main clause, and 'the chess club' is a noun phrase.")});

w.add({prompt:'What type of sentence is this?',stimulus:'How quickly the snow melted!',answer:'exclamation',wrong:['question','command','statement'],rewardGroup:'challenge',
 explanation:explain('It begins with **How**, contains a verb (melted) and ends with an exclamation mark, so it is an **exclamation**.',"- It starts with How, but it does not ask anything. The question would be: 'How quickly did the snow melt?'")},{kind:'sentenceType'});

w.add({prompt:'Which sentence has **two main clauses**?',answer:'The sun rose and the birds began to sing.',wrong:['When the sun rose, the birds began to sing.','The birds, which lived in the hedge, began to sing.','The birds began to sing at sunrise.'],rewardGroup:'challenge',
 explanation:explain("'The sun rose' and 'the birds began to sing' can each stand alone, and the conjunction **and** joins them: two main clauses.","- 'When the sun rose' is a subordinate clause, and 'which lived in the hedge' is a relative clause.","- 'The birds began to sing at sunrise' has only one clause.")});

w.add({prompt:'Which question is formed correctly from the statement below?',stimulus:'Kofi has fed the rabbits.',answer:'Has Kofi fed the rabbits?',wrong:['Has Kofi feed the rabbits?','Did Kofi has fed the rabbits?','Fed Kofi has the rabbits?'],
 explanation:explain("To turn this statement into a question, move the auxiliary verb **has** to the front: 'Has Kofi fed the rabbits?'","- **feed** is the wrong form of the verb after has.","- 'Did … has fed' uses two auxiliary verbs.","- 'Fed Kofi has…' puts the words in the wrong order.")});

w.add({prompt:'Which words are the **main clause** in the sentence below?',stimulus:'Before the ferry docked, Priya waved to her cousin.',answer:'Priya waved to her cousin',wrong:['Before the ferry docked','Before the ferry','to her cousin'],
 explanation:explain("'**Priya waved to her cousin**' makes sense on its own, so it is the main clause.","- 'Before the ferry docked' begins with the subordinating conjunction before, so it is a subordinate clause.","- 'Before the ferry' and 'to her cousin' have no verb of their own, so they are phrases.")});

w.add({prompt:'Which words are the **main clause** in the sentence below?',stimulus:'The lantern glowed although the wind was strong.',answer:'The lantern glowed',wrong:['although the wind was strong','although the wind','was strong'],
 explanation:explain("'**The lantern glowed**' can stand alone, so it is the main clause.","- 'although the wind was strong' is a subordinate clause: it adds information but cannot stand alone.","- 'was strong' is only the end of that subordinate clause.")});

w.add({prompt:'Which of these is **not** a complete sentence?',answer:'While the kettle boiled.',wrong:['The kettle boiled.','The kettle boiled and the toast burned.','We waited while the kettle boiled.'],
 explanation:explain("'While the kettle boiled.' is a subordinate clause on its own. It needs a main clause, such as 'We waited', before it is a complete sentence.","- The other three each contain a main clause.")});

w.add({prompt:'Which words complete the sentence with a **main clause**?',stimulus:'After the match ended, ___',answer:'the team shook hands.',wrong:['because the rain started.','and very muddy.','when the whistle blew.'],
 explanation:explain("The sentence opens with a subordinate clause, so it needs a **main clause**: '**the team shook hands**' makes sense on its own.","- 'because the rain started' and 'when the whistle blew' are more subordinate clauses.","- 'and very muddy' has no verb.")});

w.add({prompt:'What type of sentence is this?',stimulus:'Bring a coat for the river walk.',answer:'command',wrong:['statement','question','exclamation'],rewardGroup:'quick',
 explanation:explain('It tells someone what to do and begins with the imperative verb **Bring**, so it is a **command**.','- It does not ask a question or begin with What or How.')},{kind:'sentenceType'});

w.add({prompt:'What type of sentence is this?',stimulus:'What a steep path that was!',answer:'exclamation',wrong:['question','command','statement'],
 explanation:explain('It begins with **What**, contains a verb (was) and ends with an exclamation mark, so it is an **exclamation**.','- It does not ask for an answer.')},{kind:'sentenceType'});

w.add({prompt:'Which sentence has **two main clauses**?',answer:'The owl hooted and the fox trotted away.',wrong:['When the owl hooted, the fox trotted away.','The fox, which lived in the wood, trotted away.','The fox trotted away at dusk.'],
 explanation:explain("'The owl hooted' and 'the fox trotted away' can each stand alone. The conjunction **and** joins two main clauses.","- 'When the owl hooted' is a subordinate clause.","- 'which lived in the wood' is a relative clause.","- 'The fox trotted away at dusk' has only one clause.")});

w.add({prompt:'How many clauses are in this sentence?',stimulus:'After the curtain closed, the crowd clapped and the band played.',answer:'3',wrong:['1','2','4'],rewardGroup:'challenge',
 explanation:explain('Each clause has its own verb: **closed**, **clapped** and **played**. So there are 3 clauses:',"- 'After the curtain closed' (subordinate clause)","- 'the crowd clapped' (main clause)","- 'the band played' (main clause, joined by and)")},
 {kind:'clauses',clauses:['After the curtain closed','the crowd clapped','the band played']});

{const correct='When the bell rang, the pupils lined up. They walked to the hall.';
w.add({prompt:'This passage contains mistakes. Select the option which has corrected these mistakes.',stimulus:'when the bell rang the pupils lined up they walked to the hall',answer:correct,
 wrong:['When the bell rang the pupils lined up. They walked to the hall.','When the bell rang, the pupils lined up they walked to the hall.','When the bell rang, the pupils lined up. They walked. To the hall.'],
 explanation:explain("'When the bell rang' is a subordinate clause, so a comma follows **rang**. Then there are two main clauses, and each needs its own sentence.",'- Missing the comma after rang leaves the opening clause unmarked.','- Missing the full stop runs the two main clauses together.','- A full stop before "To the hall" leaves a fragment with no verb.')},{kind:'proof',correct});}

w.add({prompt:'Which sentence contains a **subordinate clause**?',answer:'We stayed indoors until the thunder stopped.',wrong:['We stayed indoors and the thunder stopped.','We stayed indoors during the thunder.','Indoors, we stayed until late.'],
 explanation:explain("'**until the thunder stopped**' has its own verb and begins with a subordinating conjunction, so it is a subordinate clause.","- 'and the thunder stopped' is a second main clause.","- 'during the thunder' and 'until late' are phrases: they have no verb.")});

export const clauses=w.done();
