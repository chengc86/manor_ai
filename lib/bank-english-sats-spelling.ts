import {explain,type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
// SATs practice, spelling: questions in the style of the KS2 spelling test (Paper 2), written from scratch. Words from the
// Year 5 and 6 spelling list, endings (-cious, -tial, -ence, -ent, -ible), doubling before a suffix, silent letters,
// i before e, homophones and near-homophones, plurals and adding suffixes. Notes: 'satsSpelling', 'satsEnding',
// 'satsSuffix', 'silent', 'ieRule' and 'plural' are re-checked against the test's own word list and spelling rules;
// 'gap' and 'satsGap' against its homophone sets; 'fixes' for the INCORRECTLY question.

const topic:Topic={id:'en-sats-spelling',subject:'English',strand:'SATs practice',title:'SATs spelling',helpsheet:{
 intro:'In the SATs spelling test, twenty words are read aloud in sentences and you write each one. Here you choose the correct spelling instead, so the same tricks help: say the word slowly, find the word family and remember the patterns.',
 steps:[
  'Say the word in syllables and spell each part: sep-a-rate, en-vi-ron-ment. Listen for the letters that are hard to hear.',
  'Think of a related word that shows the hidden letter: sign gives signature, muscle gives muscular.',
  '**Endings**: -cious when the root ends in -ce (grace → gracious) and -tious when it is linked to -tion (ambition → ambitious); -cial after a vowel letter (social) and -tial after a consonant (essential).',
  '**i before e except after c** when the sound is ee: chief, believe, but ceiling, deceive. Learn the odd ones out: protein, seize, weird.',
  '**Homophones**: choose by meaning, not sound. A noun usually has a c (advice, practice); the verb has an s (advise, practise).',
 ],
 example:{title:'Working out a tricky word',lines:['The word sounds like "cautious".','- It is linked to caution (-tion), so the ending is **-tious**.','- The first part is cau, as in caution.','- Put it together: **cautious**.','The word sounds like "transferred".','- The stress stays on fer when you say it, so the r is doubled: **transferred**.']},
 tips:["necessary: one c and two s's (think 'one collar, two sleeves').",'Double the last letter of -fer words only when the stress stays on fer: referring and transferred, but reference and preference.','A silent letter is often shown by a word in the same family: bomb and bombard, muscle and muscular.',"Plurals: consonant + y becomes -ies (library → libraries), most words ending in f or fe become -ves (leaf → leaves), and words ending in o often add -es (potato → potatoes)."],
}};

const w=writer(topic);
const spell=(word:string)=>({kind:'satsSpelling',word});

w.add({prompt:'Which spelling is correct?',answer:'necessary',wrong:['neccessary','necessery','nesessary'],rewardGroup:'quick',
 explanation:explain('**necessary** has one **c** and a double **s**: ne-ce-ssa-ry.',"- 'neccessary' doubles the c instead of the s.","- 'necessery' and 'nesessary' get the vowels or the c wrong.")},spell('necessary'));

w.add({prompt:'Which spelling correctly completes the sentence?',stimulus:'Chloe will ___ be at the concert on Saturday.',answer:'definitely',wrong:['definately','definitly','defenitely'],
 explanation:explain("**definitely** comes from **finite**, so the middle is -fin-ite-: def-in-ite-ly.","- 'definately' is the most common slip: there is no a in the word.","- 'definitly' is missing the e before -ly, and 'defenitely' has an e where the i should be.")},spell('definitely'));

w.add({prompt:'Which spelling is correct?',answer:'separate',wrong:['seperate','separete','sepparate'],
 explanation:explain("**separate** has an **a** in the middle: sep-a-rate. Remember that there is 'a rat' in sep-a-rat-e.","- 'seperate' uses an e instead of the a, which is the most common mistake.","- 'separete' and 'sepparate' change the ending or double the p.")},spell('separate'));

w.add({prompt:'Which spelling correctly completes the sentence?',stimulus:'Forgetting my lines on stage would ___ me.',answer:'embarrass',wrong:['embarass','embarras','emberrass'],rewardGroup:'challenge',
 explanation:explain('**embarrass** has a double **r** and a double **s**: em-bar-rass.',"- 'embarass' and 'embarras' each drop one of the doubled letters.","- 'emberrass' has an e where the a should be.")},spell('embarrass'));

w.add({prompt:'Which spelling is correct?',answer:'accommodate',wrong:['accomodate','acommodate','accommadate'],rewardGroup:'challenge',
 explanation:explain('**accommodate** has a double **c** and a double **m**: ac-com-mo-date.',"- 'accomodate' and 'acommodate' each drop one of the doubled letters.","- 'accommadate' has an a in place of the o.")},spell('accommodate'));

w.add({prompt:'Which spelling correctly completes the sentence?',stimulus:'The ___ kitten unrolled the whole ball of wool.',answer:'mischievous',wrong:['mischievious','mischevous','mischeivous'],rewardGroup:'challenge',
 explanation:explain('**mischievous** comes from **mischief**, so it keeps the -ie-, and the ending is simply **-ous**: mis-chie-vous.',"- 'mischievious' adds an extra i, which is how many people wrongly say the word.","- 'mischevous' loses the i, and 'mischeivous' swaps the i and e.")},spell('mischievous'));

w.add({prompt:'Which ending correctly completes the word?',stimulus:'The soup Grandad made was absolutely deli___.',answer:'-cious',wrong:['-tious','-shus','-cous'],rewardGroup:'quick',
 explanation:explain("**delicious** ends in **-cious**, like precious, spacious and gracious.","- '-tious' is used when the word is linked to a -tion word (ambition → ambitious), and delicious is not.","- '-shus' and '-cous' are not English spellings of this ending.")},{kind:'satsEnding',stem:'deli',word:'delicious'});

w.add({prompt:'Which ending correctly completes the word?',stimulus:'Warm clothes are essen___ on a winter walk.',answer:'-tial',wrong:['-cial','-shal','-tual'],
 explanation:explain("**essential** ends in **-tial**: it follows a consonant (n), and the related word is essence.","- '-cial' usually follows a vowel letter: special, social, official.","- '-shal' and '-tual' are not spellings of this ending.")},{kind:'satsEnding',stem:'essen',word:'essential'});

w.add({prompt:'Which ending correctly completes the word?',stimulus:'Learning to cook gave Vikram a feeling of independ___.',answer:'-ence',wrong:['-ance','-anse','-ense'],
 explanation:explain('**independence** ends in **-ence**, because the related adjective is independ**ent**.',"- '-ance' goes with words whose adjective ends in -ant (important → importance).","- '-anse' and '-ense' are not spellings of this ending.")},{kind:'satsEnding',stem:'independ',word:'independence'});

w.add({prompt:'Which ending correctly completes the word?',stimulus:'The puppy is friendly, but it is not very obedi___ yet.',answer:'-ent',wrong:['-ant','-unt','-int'],rewardGroup:'challenge',
 explanation:explain('**obedient** ends in **-ent**, and so does the related noun obedience (-ence).',"- '-ant' is the ending for words such as hesitant and tolerant.","- '-unt' and '-int' are not spellings of this ending.")},{kind:'satsEnding',stem:'obedi',word:'obedient'});

w.add({prompt:'Which ending correctly completes the word?',stimulus:'What a horr___ noise the monster made!',answer:'-ible',wrong:['-able','-eble','-abel'],
 explanation:explain("**horrible** ends in **-ible**: 'horr' is not a complete word on its own, and -ible often follows a root like this (terrible, possible, visible).","- '-able' usually follows a complete word: enjoy → enjoyable, comfort → comfortable.","- '-eble' and '-abel' are not spellings of this ending.")},{kind:'satsEnding',stem:'horr',word:'horrible'});

w.add({prompt:"What is 'prefer' + 'ed'?",answer:'preferred',wrong:['prefered','preferrd','prefferred'],rewardGroup:'challenge',
 explanation:explain("In pre**fer**, the stress stays on 'fer' when you say preferred, so the **r is doubled**: **preferred**.","- 'prefered' does not double the r.","- 'preferrd' leaves out the e of -ed, and 'prefferred' doubles the f as well.")},{kind:'satsSuffix',root:'prefer',suffix:'ed',rule:'double'});

w.add({prompt:'Which spelling is correct?',answer:'knowledge',wrong:['nowledge','knowlege','knowladge'],rewardGroup:'quick',
 explanation:explain('**knowledge** starts with a silent **k**, like know and knee, and the middle is -ledge, as in ledge.',"- 'nowledge' leaves out the silent k.","- 'knowlege' is missing the d, and 'knowladge' has an a in place of the e.")},{kind:'silent',word:'knowledge',letter:'k'});

w.add({prompt:'Which spelling correctly completes the sentence?',stimulus:'The crowd fell silent during the ___ ceremony.',answer:'solemn',wrong:['solem','sollemn','solemm'],rewardGroup:'challenge',
 explanation:explain("**solemn** ends with a silent **n**. You can hear it in the related word solem**n**ity.","- 'solem' leaves out the silent n.","- 'sollemn' doubles the l, and 'solemm' doubles the wrong letter.")},{kind:'silent',word:'solemn',letter:'n'});

w.add({prompt:'Which spelling correctly completes the sentence?',stimulus:'Did you ___ the letter from the museum?',answer:'receive',wrong:['recieve','receve','reseive'],
 explanation:explain("**receive** follows the rule 'i before e except after **c**': the ee sound comes straight after c, so it is -cei-.","- 'recieve' puts the i first, which is the most common slip.","- 'receve' is missing a letter, and 'reseive' uses s instead of c.")},{kind:'ieRule',word:'receive'});

w.add({prompt:'Which spelling is correct?',answer:'achieve',wrong:['acheive','acheeve','achive'],
 explanation:explain("**achieve** follows the rule 'i before e except after c': there is no c before the ee sound, so it is -ie-.","- 'acheive' swaps the i and the e.","- 'acheeve' and 'achive' are not spellings of the word.")},{kind:'ieRule',word:'achieve'});

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Netball ___ is on Tuesday after school.',answer:'practice',wrong:['practise','practis','practece'],
 explanation:explain('Here the word names a thing (the netball session), so it is the noun **practice**, with a **c**.','- **practise** with an s is the verb: we practise every Tuesday.',"- 'practis' and 'practece' are misspellings.")},{kind:'gap',full:'Netball practice is on Tuesday after school.'});

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'The traffic stayed ___ for an hour because of the roadworks.',answer:'stationary',wrong:['stationery','stationry','stationairy'],rewardGroup:'challenge',
 explanation:explain('**stationary** with an **a** means not moving, which is what the traffic was doing.','- **stationery** with an e means pens, paper and envelopes.',"- 'stationry' and 'stationairy' are misspellings.")},{kind:'gap',full:'The traffic stayed stationary for an hour because of the roadworks.'});

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Honesty is the most important ___ in our class charter.',answer:'principle',wrong:['principal','princeple','prinsiple'],rewardGroup:'challenge',
 explanation:explain('A **principle** is a rule or belief about how to behave, which is what a class charter lists.','- **principal** means main or most important, or the head of a college.',"- 'princeple' and 'prinsiple' are misspellings.")},{kind:'satsGap',full:'Honesty is the most important principle in our class charter.'});

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'For ___ we had apple crumble and custard.',answer:'dessert',wrong:['desert','dezert','dessurt'],
 explanation:explain('**dessert** with a double **s** is the sweet course at the end of a meal.','- **desert** with one s is a dry, sandy place.',"- 'dezert' and 'dessurt' are misspellings.")},{kind:'satsGap',full:'For dessert we had apple crumble and custard.'});

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'The bus ___ the manor gates without stopping.',answer:'passed',wrong:['past','parsed','pased'],
 explanation:explain("The sentence needs a verb to say what the bus did: it **passed** the gates (the past tense of pass).","- **past** is not a verb: you could say 'went past the gates', but not 'the bus past the gates'.","- 'parsed' is a different word, and 'pased' is a misspelling.")},{kind:'gap',full:'The bus passed the manor gates without stopping.'});

w.add({prompt:"What is the plural of 'shelf'?",answer:'shelves',wrong:['shelfs','shelfes','shelve'],rewardGroup:'quick',
 explanation:explain('Most words ending in **f** change the f to **v** and add -es: shelf → **shelves** (also leaf → leaves, wolf → wolves).',"- 'shelfs' and 'shelfes' keep the f.","- 'shelve' is a verb meaning to put something on a shelf, not the plural.")},{kind:'plural',singular:'shelf'});

w.add({prompt:"What is 'argue' + 'ment'?",answer:'argument',wrong:['arguement','argumant','arguemant'],rewardGroup:'challenge',
 explanation:explain("**argument** is an exception: the **e** of argue is dropped before -ment, even though -ment begins with a consonant.","- 'arguement' keeps the e, which is the common slip.","- 'argumant' and 'arguemant' spell the ending wrongly.")},{kind:'satsSuffix',root:'argue',suffix:'ment',rule:'drop-e'});

w.add({prompt:'Which of these words is spelt INCORRECTLY?',answer:'sincerly',wrong:['vegetable','parliament','privilege'],
 explanation:explain("The correct spelling is **sincerely**: sincere + ly, keeping the e.","- vegetable, parliament and privilege are all spelt correctly.")},
 {kind:'fixes',want:'incorrect',fixes:{sincerly:'sincerely',vegetable:'vegetable',parliament:'parliament',privilege:'privilege'}});

export const satsSpelling=w.done();
