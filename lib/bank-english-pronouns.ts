import {explain,type Topic} from './bank-kit';
import {writer,untag} from './bank-english-kit';
// Pronouns: personal (subject and object), possessive, reflexive and relative pronouns; clear reference; pronoun or determiner.

const topic:Topic={id:'en-pronouns',subject:'English',strand:'Grammar',title:'Pronouns',helpsheet:{
 intro:"A **pronoun** stands in for a noun so we do not have to repeat it: 'Sami found **it**.' There are personal pronouns (I, you, she, we, them), possessive pronouns (mine, yours, hers, ours, theirs), reflexive pronouns (myself, themselves) and relative pronouns (who, which, that, whose).",
 steps:[
  "Check whether the word **replaces** a noun or noun phrase: in 'The book is mine', mine replaces 'my book'.",
  'Use **I, he, she, we, they** for the subject (who does the action) and **me, him, her, us, them** for the object.',
  "Test a pair by taking away the other person: 'Mum and I went' → 'I went', not 'me went'.",
  'Relative pronouns begin a clause that tells us more about a noun: the girl **who** won.',
 ],
 example:{title:'Pronouns in action',lines:['Leo lent Uma a torch because hers had broken.',"- **hers** is a possessive pronoun: it stands for 'Uma's torch', so we do not have to repeat those words."]},
 tips:['Possessive pronouns never have an apostrophe: hers, ours, yours, theirs.',"Make sure the reader can tell who a pronoun means. If 'he' could be two different people, use a name.","Words such as these and some are pronouns when they stand alone ('These are yours') but determiners when a noun follows ('these gloves')."],
}};

const w=writer(topic);
const count=(tagged:string,cls:string)=>({kind:'count',tagged,cls});
const pick=(tagged:string,cls:string,all=false)=>({kind:'pick',tagged,cls,all});

{const t='She/pron gave/verb it/pron to/prep them/pron before/conj.sub we/pron arrived/verb ./';
w.add({prompt:'How many pronouns are in this sentence?',stimulus:untag(t),answer:'4',wrong:['3','5','6'],
 explanation:explain('The pronouns are **She**, **it**, **them** and **we**: 4. Each one stands in for a person, a group or a thing.','- gave and arrived are verbs; to is a preposition and before is a conjunction.')},count(t,'pron'));}

{const t='Is/verb this/det umbrella/noun yours/pron.pos ,/ or/conj.co does/verb.aux it/pron belong/verb to/prep him/pron ?/';
w.add({prompt:'How many pronouns are in this sentence?',stimulus:untag(t),answer:'3',wrong:['2','4','5'],rewardGroup:'challenge',
 explanation:explain('The pronouns are **yours**, **it** and **him**: 3.','- **this** comes straight before the noun umbrella, so here it is a determiner, not a pronoun.','- does is an auxiliary verb and belong is the main verb.')},count(t,'pron'));}

w.add({prompt:"Which pronoun could replace the words 'Grandma and I' in the sentence below?",stimulus:'Grandma and I planted the tulip bulbs.',answer:'We',wrong:['Us','They','She'],
 explanation:explain("'Grandma and I' did the planting, so they are the **subject**. The subject pronoun for a group that includes the speaker is **We**.",'- **Us** is used as an object: Grandma helped us.','- **They** would leave the speaker out, and **She** means only one person.')});

w.add({prompt:"Which pronoun could replace the words 'Jaya and Leo' in the sentence below?",stimulus:'Mr Okafor thanked Jaya and Leo for tidying the library.',answer:'them',wrong:['they','their','theirs'],
 explanation:explain('Jaya and Leo are being thanked, so they are the **object** of the verb. The object pronoun is **them**: Mr Okafor thanked them.','- **they** is a subject pronoun.',"- **their** needs a noun after it (their books), and **theirs** means 'belonging to them'.")});

{const t='That/det kite/noun is/verb ours/pron.pos ,/ but/conj.co the/det red/adj one/pron is/verb theirs/pron.pos ./';
w.add({prompt:'Select the **two** possessive pronouns in the sentence below.',stimulus:untag(t),answer:['ours','theirs'],wrong:['That','kite','red'],
 explanation:explain('**ours** and **theirs** show who something belongs to and stand in place of a noun (our kite, their kite), so they are possessive pronouns.','- **That** comes straight before the noun kite, so here it is a determiner.','- **kite** is a noun and **red** is an adjective.')},pick(t,'pron.pos',true));}

w.add({prompt:'Which word correctly completes the second sentence?',stimulus:'This scarf belongs to Aisha. It is ___.',answer:'hers',wrong:["her's",'her','she'],
 explanation:explain("**hers** is the possessive pronoun meaning 'belonging to her'.","- Possessive pronouns never have an apostrophe, so **her's** is wrong.",'- **her** would need a noun after it (her scarf), and **she** is a subject pronoun.')});

{const t='The/det boy/noun who/pron.rel found/verb the/det key/noun handed/verb it/pron to/prep the/det caretaker/noun ./';
w.add({prompt:'Which word in the sentence below is a **relative pronoun**?',stimulus:untag(t),answer:'who',wrong:['it','found','key'],
 explanation:explain("**who** begins the relative clause 'who found the key', which tells us more about the boy. It is a relative pronoun.",'- **it** is a pronoun too, but it is a personal pronoun standing for the key.','- **found** is a verb and **key** is a noun.')},pick(t,'pron.rel'));}

w.add({prompt:'Which relative pronoun correctly completes the sentence?',stimulus:'The bike ___ I borrowed from my cousin has a bell.',answer:'which',wrong:['who','whose','where'],
 explanation:explain('The relative clause tells us more about **the bike**, a thing, so we use **which** (or that).','- **who** is used for people.','- **whose** shows belonging (the girl whose bike…).','- **where** is used for places.')});

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'The girl ___ painting won first prize was delighted.',answer:'whose',wrong:["who's",'who','which'],
 explanation:explain('The painting belongs to the girl, so we need **whose**, which shows belonging.',"- **who's** is short for 'who is' or 'who has', which makes no sense here.",'- **who** and **which** do not show belonging.')});

w.add({prompt:'In which sentence is it **unclear** who the pronoun refers to?',answer:'Ben told Hugo that he had left his coat on the bus.',wrong:['Nadia told her dad that she was hungry.','The dogs barked when they heard the doorbell.','Chloe dropped her gloves, so she went back for them.'],rewardGroup:'challenge',
 explanation:explain("In 'Ben told Hugo that he had left his coat on the bus', **he** could mean Ben or Hugo, so we cannot tell who left the coat.",'- In the others, only one person or group fits the pronoun: she must be Nadia, they must be the dogs, and she must be Chloe.')});

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'The twins taught ___ to juggle.',answer:'themselves',wrong:['theirselves','themself','them'],
 explanation:explain("The twins did the teaching and the learning, so we need the **reflexive** pronoun for 'they': **themselves**.",'- **theirselves** is not standard English, and **themself** does not fit two people.',"- 'taught them' would mean they taught some other people.")});

w.add({prompt:'Which sentence uses a pronoun **incorrectly** in standard English?',answer:'Zara and me went to the library.',wrong:['Zara and I went to the library.','Mum drove Zara and me to the library.','The librarian helped Zara and me.'],rewardGroup:'challenge',
 explanation:explain("In 'Zara and **me** went', the pronoun is part of the **subject** (who went), so it should be **I**. Take away 'Zara and': you would say 'I went', not 'me went'.","- The other sentences are correct: 'Zara and I' is a subject, and 'Zara and me' is the object after drove and helped.")});

w.add({prompt:"Who does the pronoun 'them' refer to in the sentence below?",stimulus:'The girls thanked their coach because he had driven them to the match.',answer:'the girls',wrong:['the coach','the match','everyone at the match'],
 explanation:explain("The coach drove somebody to the match: the **girls**. 'them' stands in for the girls so that the sentence does not repeat them.",'- **he** is the pronoun for the coach, and the match is where they went, not who was driven.')});

w.add({prompt:'Which of these pronouns is in the **first person**?',answer:'we',wrong:['they','you','she'],rewardGroup:'quick',
 explanation:explain('The **first person** means the speaker or writer: I, me, we and us. So **we** is first person.','- **you** is second person: the person being spoken to.','- **they** and **she** are third person: other people.')});

w.add({prompt:"In which sentence is 'That' used as a **pronoun**?",answer:'That is my coat on the hook.',wrong:['That coat on the hook is mine.','That hook is too high for me.','That peg belongs to Yusuf.'],rewardGroup:'challenge',
 explanation:explain("In 'That is my coat', That stands on its own in place of a noun, so it is a **pronoun**.",'- In the other sentences, That comes straight before a noun (coat, hook, peg), so it is a **determiner**.')});

w.add({prompt:'Which relative pronoun correctly completes the sentence?',stimulus:'The girl ___ won the poetry prize is in my class.',answer:'who',wrong:['which','whose','when'],
 explanation:explain('The relative clause tells us more about **the girl**, a person, so we use **who** (or that).','- **which** is used for things and animals, not people.','- **whose** shows belonging (the girl whose poem won…).','- **when** is used for times.')});

{const t='Everyone/pron cheered/verb when/conj.sub she/pron scored/verb the/det winning/adj goal/noun ./';
w.add({prompt:'Select the **two** pronouns in the sentence below.',stimulus:untag(t),answer:['Everyone','she'],wrong:['cheered','winning','goal'],
 explanation:explain('**Everyone** and **she** stand in for nouns, so they are pronouns. Everyone is an indefinite pronoun: it does not name particular people.','- cheered and scored are verbs; winning describes the goal.')},pick(t,'pron',true));}

{const t='Hugo/noun.pr lent/verb us/pron a/det torch/noun during/prep the/det power/noun cut/noun ./';
w.add({prompt:'Which word in the sentence below is a **pronoun**?',stimulus:untag(t),answer:'us',wrong:['Hugo','lent','torch'],rewardGroup:'quick',
 explanation:explain('**us** stands in for the people Hugo helped, so it is a pronoun.','- **Hugo** and **torch** are nouns, and **lent** is a verb.')},pick(t,'pron'));}

export const pronouns=w.done();
