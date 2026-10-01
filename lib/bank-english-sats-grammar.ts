import {explain,type Topic} from './bank-kit';
import {writer,untag} from './bank-english-kit';
// SATs practice, grammar: questions in the style of the KS2 grammar, punctuation and spelling test (Paper 1), written from
// scratch. Subject and object, modal verbs, relative clauses, fronted adverbials, expanded noun phrases, clauses and
// conjunctions, tense, standard English, the subjunctive, formal vocabulary, synonyms and antonyms, word classes and
// sentence types. Notes: 'subjectObject', 'nounPhrase' and 'wordClass' carry tagged sentences; 'modal', 'relative',
// 'fronted', 'clause', 'conjType', 'consistent', 'standard', 'subjunctive', 'formal', 'synonym', 'antonym' and 'advType'
// are re-checked against the test's own word lists and rules.

const topic:Topic={id:'en-sats-grammar',subject:'English',strand:'SATs practice',title:'SATs grammar: words and sentences',helpsheet:{
 intro:'The grammar questions in the SATs test ask you to name the parts of a sentence and to spot the job each word is doing. Read the whole sentence first, then look for the clue words in the question.',
 steps:[
  '**Subject and object**: find the verb, then ask who or what does it (the subject) and who or what has it done to them (the object).',
  '**Modal verbs** (can, could, may, might, must, shall, should, will, would) sit before another verb and show how likely, possible or necessary something is.',
  'A **relative clause** starts with who, which, that or whose and adds information about a noun. A **fronted adverbial** comes before the subject and is followed by a comma.',
  'A **main clause** makes sense on its own. A **subordinate clause** starts with a subordinating conjunction (because, although, when, if) and cannot stand alone.',
  "**Standard English** uses the agreed forms: we were, I did, could have. The **subjunctive** uses were after if for imagined situations, and the plain verb after insist or suggest + that ('insists that he be').",
 ],
 example:{title:'Taking a sentence apart',lines:['Before the storm, the farmer, who was worried, locked every gate because the wind might lift them.','- Fronted adverbial: **Before the storm**','- Subject: **the farmer**; object: **every gate**','- Relative clause: **who was worried**','- Subordinate clause: **because the wind might lift them**; modal verb: **might**']},
 tips:["The subject is not always the first word: in 'Yesterday, Leo scored twice', the subject is Leo.",'An expanded noun phrase has no verb of its own: the shiny red bicycle in the shed.',"A sentence can start with How or What and still be a question: 'How old is it?' is a question, 'How old it is!' is an exclamation.",'When a question asks for the formal word, choose purchase rather than buy, request rather than ask for, assist rather than help.'],
}};

const w=writer(topic);
const pick=(tagged:string,cls:string,all=false)=>({kind:'pick',tagged,cls,all});

{const t='The/det youngest/adj.sup hero/noun carried/verb the/det heavy/adj shield/noun across/prep the/det courtyard/noun ./';
w.add({prompt:'Which words are the **subject** of the sentence below?',stimulus:untag(t),answer:'The youngest hero',wrong:['the heavy shield','across the courtyard','carried'],
 explanation:explain("The verb is **carried**. Ask who did the carrying: **the youngest hero**. That is the subject.","- 'the heavy shield' is what was carried, so it is the **object**.","- 'across the courtyard' tells us where, so it is an adverbial.","- 'carried' is the verb itself.")},{kind:'subjectObject',role:'subject',tagged:t});}

{const t='After/prep the/det match/noun ,/ Priya/noun.pr thanked/verb her/det tired/adj teammates/noun ./';
w.add({prompt:'Which words are the **object** of the sentence below?',stimulus:untag(t),answer:'her tired teammates',wrong:['Priya','After the match','thanked'],
 explanation:explain("The verb is **thanked**. Priya did the thanking, so she is the subject. The people who were thanked, **her tired teammates**, are the object.","- 'After the match' is a fronted adverbial telling us when.","- 'thanked' is the verb, not a noun phrase.")},{kind:'subjectObject',role:'object',tagged:t});}

{const t='You/pron should/verb.mod bring/verb a/det coat/noun because/conj.sub it/pron might/verb.mod rain/verb later/adv ./';
w.add({prompt:'Select the **two** modal verbs in the sentence below.',stimulus:untag(t),answer:['should','might'],wrong:['bring','rain','later'],
 explanation:explain('Modal verbs come before another verb and change its meaning: **should** bring (advice) and **might** rain (possibility).','- **bring** and **rain** are the main verbs that follow the modals.','- **later** is an adverb telling us when.')},pick(t,'verb.mod',true));}

w.add({prompt:'In which sentence does the modal verb show that something is **possible** but not certain?',answer:'The parcel might arrive before lunch.',wrong:['The parcel will arrive before lunch.','The parcel must arrive before lunch.','The parcel shall arrive before lunch.'],
 explanation:explain('**might** shows possibility: the parcel may or may not arrive before lunch.','- **will** and **shall** show that the writer is certain it will happen.','- **must** shows that it is necessary or certain.')},{kind:'modal',meaning:'possibility'});

w.add({prompt:'Which word in the sentence below is a **relative pronoun**?',stimulus:'The lantern that Amara mended still works perfectly.',answer:'that',wrong:['lantern','still','perfectly'],rewardGroup:'quick',
 explanation:explain("**that** introduces the relative clause 'that Amara mended', which tells us more about the lantern.",'- **lantern** is a noun, and **still** and **perfectly** are adverbs.')},{kind:'relative'});

w.add({prompt:'Which words form the **relative clause** in the sentence below?',stimulus:'Our teacher, who grew up by the sea, taught us to tie sailing knots.',answer:'who grew up by the sea',wrong:['Our teacher','taught us to tie sailing knots','by the sea'],
 explanation:explain("'**who grew up by the sea**' begins with the relative pronoun who and adds information about our teacher. The commas on each side show it is extra information.","- 'Our teacher … taught us to tie sailing knots' is the main clause.","- 'by the sea' is only part of the relative clause.")},{kind:'relative',clause:true});

w.add({prompt:'Which words are the **fronted adverbial** in the sentence below?',stimulus:'Later that afternoon, the choir rehearsed in the great hall.',answer:'Later that afternoon',wrong:['the choir rehearsed','in the great hall','the great hall'],rewardGroup:'quick',
 explanation:explain("A fronted adverbial comes at the start of the sentence, before the subject, and is followed by a comma: '**Later that afternoon**,' tells us when the choir rehearsed.","- 'the choir rehearsed' is the subject and verb of the main clause.","- 'in the great hall' is also an adverbial, but it is at the end of the sentence, not the front.")},{kind:'fronted'});

{const t='The/det heroes/noun crossed/verb the/det rickety/adj wooden/adj bridge/noun over/prep the/det stream/noun ./';
w.add({prompt:'Which words make up the **expanded noun phrase** in the sentence below?',stimulus:untag(t),answer:'the rickety wooden bridge over the stream',wrong:['The heroes crossed','crossed the rickety','over the stream'],rewardGroup:'challenge',
 explanation:explain("The noun is **bridge**. The adjectives rickety and wooden and the phrase 'over the stream' all tell us more about it, so the whole expanded noun phrase is '**the rickety wooden bridge over the stream**'.","- 'The heroes crossed' and 'crossed the rickety' include the verb, so they are not noun phrases.","- 'over the stream' is only the end of the phrase.")},{kind:'nounPhrase',tagged:t});}

w.add({prompt:'Which words are the **main clause** in the sentence below?',stimulus:'Because the ground was frozen, the gardeners waited a week.',answer:'the gardeners waited a week',wrong:['Because the ground was frozen','the ground was frozen','waited a week'],
 explanation:explain("'**the gardeners waited a week**' makes complete sense on its own, so it is the main clause.","- 'Because the ground was frozen' begins with the subordinating conjunction because, so it is a subordinate clause.","- 'the ground was frozen' leaves out because, but it is still part of the subordinate clause.","- 'waited a week' has no subject.")},{kind:'clause',role:'main',sub:'Because the ground was frozen'});

w.add({prompt:'Which words are the **subordinate clause** in the sentence below?',stimulus:'We can bake the bread as soon as the oven is hot.',answer:'as soon as the oven is hot',wrong:['We can bake the bread','the oven is hot','bake the bread as soon as'],rewardGroup:'challenge',
 explanation:explain("'**as soon as the oven is hot**' tells us when we can bake, and it cannot stand alone as a sentence, so it is the subordinate clause.","- 'We can bake the bread' is the main clause.","- 'the oven is hot' is only part of the subordinate clause: the conjunction as soon as belongs to it.","- 'bake the bread as soon as' mixes the two clauses.")},{kind:'clause',role:'subordinate',sub:'as soon as the oven is hot'});

w.add({prompt:'Which word in the sentence below is a **subordinating** conjunction?',stimulus:'Tom wanted to swim, but the pool was closed until the lifeguard arrived.',answer:'until',wrong:['but','to','was'],
 explanation:explain("**until** introduces the subordinate clause 'until the lifeguard arrived', which cannot stand alone.","- **but** is a co-ordinating conjunction: it joins two main clauses of equal weight.","- **to** goes with the verb swim, and **was** is a verb.")},{kind:'conjType',type:'sub'});

w.add({prompt:'Which sentence is written in the **present perfect** tense?',answer:'Zara has written three poems this term.',wrong:['Zara wrote three poems last term.','Zara is writing a poem about autumn.','Zara had written three poems by June.'],
 explanation:explain('The present perfect is **has** or **have** + a past participle: **has written**. It links the past with now: the poems were written and the term is still going.',"- 'wrote' is the simple past.","- 'is writing' is the present progressive.","- 'had written' is the past perfect.")},
 {kind:'tenseOptions',target:'present perfect',phrases:{'Zara has written three poems this term.':'has written','Zara wrote three poems last term.':'wrote','Zara is writing a poem about autumn.':'is writing','Zara had written three poems by June.':'had written'}});

w.add({prompt:'In which sentence is the tense used **consistently**?',answer:'The bell rang and the pupils hurried into the hall.',wrong:['The bell rang and the pupils hurry into the hall.','The bell rings and the pupils hurried into the hall.','The bell is ringing and the pupils hurried into the hall.'],rewardGroup:'challenge',
 explanation:explain('Both verbs are in the simple past: **rang** and **hurried**. The tense stays the same all the way through.',"- 'rang … hurry' and 'rings … hurried' mix past and present.","- 'is ringing … hurried' mixes the present progressive with the past.")},
 {kind:'consistent',phrases:{'The bell rang and the pupils hurried into the hall.':['rang','hurried'],'The bell rang and the pupils hurry into the hall.':['rang','hurry'],'The bell rings and the pupils hurried into the hall.':['rings','hurried'],'The bell is ringing and the pupils hurried into the hall.':['is ringing','hurried']}});

w.add({prompt:'Which of these sentences is written in **standard English**?',answer:'We were the first to finish the obstacle course.',wrong:['We was the first to finish the obstacle course.','We done the obstacle course first.','We seen the finish line first.'],
 explanation:explain('In standard English the verb agrees with its subject: **we were**.',"- 'We was' uses the wrong form of the verb for we.","- 'done' and 'seen' are past participles: they need have or had in front of them (we have done, we had seen). On their own, the past tense forms are did and saw.")},{kind:'standard'});

w.add({prompt:'Which word completes the sentence in **standard English**?',stimulus:'Oscar ___ his best in the spelling test on Friday.',answer:'did',wrong:['done','doed','have did'],rewardGroup:'quick',
 explanation:explain("The simple past of do is **did**: 'Oscar did his best'.","- 'done' needs has, have or had before it: 'Oscar has done his best'.","- 'doed' is not a word, and 'have did' mixes two forms.")},{kind:'standard',full:'Oscar did his best in the spelling test on Friday.'});

w.add({prompt:'Which verb form completes the sentence in the **subjunctive**?',stimulus:'The head teacher insists that every bag ___ left outside the hall.',answer:'be',wrong:['is','was','are'],rewardGroup:'challenge',
 explanation:explain("After 'insists that', the subjunctive uses the plain verb **be**: 'that every bag **be** left outside'.","- 'is' and 'are' are ordinary present tense forms.","- 'was' is the ordinary past tense.")},{kind:'subjunctive',full:'The head teacher insists that every bag be left outside the hall.'});

w.add({prompt:'Which of these sentences uses the **subjunctive** form?',answer:'If I were taller, I would reach the top shelf.',wrong:['If I was taller, I could reach the top shelf.','When I am taller, I will reach the top shelf.','I wish I had reached the top shelf.'],rewardGroup:'challenge',
 explanation:explain("For an imagined situation after **if**, the subjunctive uses **were** with every subject: 'If I **were** taller'.","- 'If I was taller' is common in speech, but it is not the subjunctive.","- 'When I am taller' treats growing taller as something that will really happen.","- 'I wish I had reached' is the past perfect, not the subjunctive.")},{kind:'subjunctive'});

w.add({prompt:"Which word is the most **formal** way to say 'buy' in the sentence below?",stimulus:'Visitors can buy tickets at the gate.',answer:'purchase',wrong:['grab','get','pick up'],rewardGroup:'quick',
 explanation:explain("**purchase** is the formal word for buy: 'Visitors can purchase tickets at the gate.'","- grab, get and pick up are everyday, informal words.")},{kind:'formal',informal:'buy'});

w.add({prompt:"Which word is a **synonym** (a word with a similar meaning) of 'enormous' in the sentence below?",stimulus:'The dragon guarded an enormous pile of gold.',answer:'huge',wrong:['tiny','heavy','shiny'],rewardGroup:'quick',
 explanation:explain('**enormous** means very big, so **huge** is a synonym.','- **tiny** means the opposite: very small.','- **heavy** and **shiny** describe other things about the pile, not its size.')},{kind:'synonym',word:'enormous'});

w.add({prompt:"Which word is an **antonym** (a word with the opposite meaning) of 'ancient' in the sentence below?",stimulus:'An ancient oak stands beside the manor gate.',answer:'modern',wrong:['old','tall','wooden'],
 explanation:explain('**ancient** means very old, so its opposite is **modern** (new, of the present day).','- **old** means almost the same as ancient, so it is a synonym, not an antonym.','- **tall** and **wooden** describe the oak in other ways.')},{kind:'antonym',word:'ancient'});

{const t='Several/det heroes/noun waited/verb quietly/adv beside/prep the/det gate/noun ./';
w.add({prompt:'Select the **two** determiners in the sentence below.',stimulus:untag(t),answer:['Several','the'],wrong:['heroes','quietly','beside'],
 explanation:explain('A determiner comes before a noun and tells us which one or how many: **Several** heroes, **the** gate.','- **heroes** is a noun, **quietly** is an adverb and **beside** is a preposition.')},pick(t,'det',true));}

w.add({prompt:'Which word in the sentence below is an adverb of **manner** (it tells us how)?',stimulus:'The heroes will soon march bravely across the muddy field.',answer:'bravely',wrong:['soon','across','muddy'],
 explanation:explain('**bravely** tells us **how** the heroes will march, so it is an adverb of manner.','- **soon** is also an adverb, but it tells us **when**.','- **across** is a preposition and **muddy** is an adjective.')},{kind:'advType',type:'manner'});

w.add({prompt:"In which sentence is the word 'cook' used as a **noun**?",answer:'The cook stirred the soup slowly.',wrong:['Please cook the rice until it is soft.','We cook pancakes every Sunday.','Dad will cook for us.'],
 explanation:explain("In 'The **cook** stirred the soup', cook names a person: it follows 'The' and is the one doing the stirring, so it is a **noun**.",'- In the other sentences, cook is something people do (cook the rice, we cook, will cook), so it is a **verb**.')},
 {kind:'wordClass',word:'cook',cls:'noun',tagged:{'The cook stirred the soup slowly.':'The/det cook/noun stirred/verb the/det soup/noun slowly/adv ./','Please cook the rice until it is soft.':'Please/other cook/verb the/det rice/noun until/conj.sub it/pron is/verb soft/adj ./','We cook pancakes every Sunday.':'We/pron cook/verb pancakes/noun every/det Sunday/noun.pr ./','Dad will cook for us.':'Dad/noun will/verb.mod cook/verb for/prep us/pron ./'}});

w.add({prompt:'Which of these sentences is a **command**?',answer:'Please wait by the door.',wrong:['Will you wait by the door?','What a long wait that was!','We waited by the door.'],rewardGroup:'quick',
 explanation:explain("'Please wait by the door.' tells someone what to do, using the imperative verb **wait**, so it is a command.","- 'Will you wait by the door?' asks a question.","- 'What a long wait that was!' is an exclamation.","- 'We waited by the door.' is a statement.")},{kind:'sentenceTypeOptions',target:'command'});

export const satsGrammar=w.done();
