import {explain,type Topic} from './bank-kit';
import {writer,untag} from './bank-english-kit';
// Conjunctions: co-ordinating and subordinating conjunctions, choosing one by meaning, and words that can be other classes.

const topic:Topic={id:'en-conjunctions',subject:'English',strand:'Grammar',title:'Conjunctions',helpsheet:{
 intro:'A **conjunction** joins words, phrases or clauses. **Co-ordinating** conjunctions (for, and, nor, but, or, yet, so) join parts of equal importance. **Subordinating** conjunctions (because, although, when, if, while, unless, until) begin a subordinate clause.',
 steps:[
  'Find the clauses: each one has its own verb.',
  'Look at the joining word. If it is for, and, nor, but, or, yet or so, it is co-ordinating.',
  "If it begins a clause that cannot stand alone ('because it was raining'), it is subordinating.",
  'Choose a conjunction by meaning: reason (because), contrast (but, although, whereas), time (when, until), condition (if, unless) or result (so).',
 ],
 example:{title:'Joining ideas',lines:['We sheltered in the barn until the hail stopped, but the ducks stayed outside.',"- **until**: subordinating (time). 'until the hail stopped' cannot stand alone.",'- **but**: co-ordinating (contrast). It joins two main clauses.']},
 tips:["The same word can do different jobs: 'after tea' (preposition) but 'after we ate' (conjunction).",'Do not join two main clauses with only a comma: use a conjunction or a full stop.',"'unless' means 'if not': we will go unless it rains = we will go if it does not rain."],
}};

const w=writer(topic);
const count=(tagged:string,cls:string)=>({kind:'count',tagged,cls});
const pick=(tagged:string,cls:string,all=false)=>({kind:'pick',tagged,cls,all});

{const t='Hana/noun.pr wanted/verb to/other swim/verb ,/ but/conj.co the/det pool/noun was/verb closed/adj ./';
w.add({prompt:'Which word in the sentence below is a **co-ordinating** conjunction?',stimulus:untag(t),answer:'but',wrong:['wanted','pool','closed'],rewardGroup:'quick',
 explanation:explain("**but** joins two main clauses ('Hana wanted to swim' and 'the pool was closed') and shows a contrast, so it is a co-ordinating conjunction.",'- **wanted** is a verb, **pool** is a noun and **closed** describes the pool.')},pick(t,'conj.co'));}

{const t='Although/conj.sub it/pron was/verb.aux raining/verb ,/ the/det match/noun went/verb ahead/adv ./';
w.add({prompt:'Which word in the sentence below is a **subordinating** conjunction?',stimulus:untag(t),answer:'Although',wrong:['raining','match','ahead'],
 explanation:explain("**Although** begins the subordinate clause 'Although it was raining', which does not make sense on its own. It is a subordinating conjunction showing contrast.",'- **raining** is a verb, **match** is a noun and **ahead** is an adverb.')},pick(t,'conj.sub'));}

{const t='We/pron stayed/verb indoors/adv because/conj.sub it/pron was/verb windy/adj ,/ and/conj.co we/pron played/verb board/noun games/noun ./';
w.add({prompt:'Select the **two** conjunctions in the sentence below.',stimulus:untag(t),answer:['because','and'],wrong:['indoors','windy','games'],
 explanation:explain('**because** gives a reason: it is a subordinating conjunction.','**and** adds another idea: it is a co-ordinating conjunction.','- **indoors** is an adverb, **windy** is an adjective and **games** is a noun.')},pick(t,'conj',true));}

w.add({prompt:'Which conjunction best completes the sentence?',stimulus:'Farah practised every evening ___ she wanted to win the spelling bee.',answer:'because',wrong:['although','unless','or'],
 explanation:explain('The second part gives the **reason** why Farah practised, so **because** fits.',"- **although** suggests a contrast, **unless** means 'if not' and **or** offers a choice: none of these make sense here.")});

w.add({prompt:'Which conjunction best completes the sentence?',stimulus:'The tent was old and patched, ___ it kept us dry all night.',answer:'but',wrong:['so','because','or'],
 explanation:explain('An old, patched tent keeping everyone dry is a surprise, so we need a conjunction that shows **contrast**: **but**.','- **so** shows a result and **because** gives a reason, which do not make sense here.','- **or** offers a choice.')});

w.add({prompt:"In which sentence is 'since' used as a **conjunction**?",answer:'Since you asked so politely, you may have two biscuits.',wrong:['We have been friends since Year 2.','I have not seen Rory since the summer.','The shop has been closed ever since.'],rewardGroup:'challenge',
 explanation:explain("In 'Since **you asked so politely**', since begins a clause with its own verb (asked), so it is a **conjunction**. Here it means 'because'.","- In 'since Year 2' and 'since the summer', a noun phrase follows, so since is a **preposition**.","- In 'ever since', nothing follows, so since is an **adverb**.")});

{const t='When/conj.sub the/det bell/noun rang/verb ,/ Tom/noun.pr and/conj.co Sami/noun.pr grabbed/verb their/det bags/noun because/conj.sub they/pron did/verb.aux not/adv want/verb to/other miss/verb the/det bus/noun ./';
w.add({prompt:'How many conjunctions are in this sentence?',stimulus:untag(t),answer:'3',wrong:['2','4','5'],rewardGroup:'challenge',
 explanation:explain('The conjunctions are **When**, **because** and the **and** that joins Tom and Sami: 3.','- **When** and **because** begin subordinate clauses; **and** is a co-ordinating conjunction.',"- The 'to' before miss is not a conjunction.")},count(t,'conj'));}

w.add({prompt:'Which of these conjunctions shows **time**?',answer:'until',wrong:['because','although','unless'],rewardGroup:'quick',
 explanation:explain("**until** tells us when something stops happening, so it shows time: 'Wait until the bell rings.'",'- because gives a reason, although shows contrast and unless sets a condition.')});

w.add({prompt:'Which is the best way to join these two sentences using a **subordinating** conjunction?',stimulus:'The river flooded. It had rained for a week.',answer:'The river flooded because it had rained for a week.',wrong:['The river flooded, it had rained for a week.','The river flooded and it had rained for a week.','The river flooded although it had rained for a week.'],rewardGroup:'challenge',
 explanation:explain('The rain explains why the river flooded, so **because** joins the sentences and gives the reason.','- Joining two main clauses with only a comma is not correct.','- **and** is a co-ordinating conjunction, and it does not show that the rain caused the flood.','- **although** shows contrast, which does not make sense here.')});

w.add({prompt:'Which conjunction correctly completes the sentence?',stimulus:'You can have either an apple ___ a pear from the fruit bowl.',answer:'or',wrong:['nor','and','but'],rewardGroup:'quick',
 explanation:explain('**either** goes with **or**: either an apple or a pear.','- **nor** goes with neither: neither an apple nor a pear.','- Neither **and** nor **but** pairs with either.')});

w.add({prompt:'Which conjunction best completes the sentence?',stimulus:'I will lend you my umbrella ___ you promise to bring it back.',answer:'if',wrong:['unless','so','although'],
 explanation:explain('Lending the umbrella depends on the promise, so we need a conjunction that sets a **condition**: **if**.',"- **unless** means 'if not', which gives the opposite meaning.",'- **so** shows a result and **although** shows contrast.')});

w.add({prompt:'Which conjunction best completes the sentence?',stimulus:'Kofi loves playing chess, ___ his twin prefers painting.',answer:'whereas',wrong:['because','so','until'],
 explanation:explain('The sentence compares two different likes, so we need a conjunction of **contrast**: **whereas**.','- **because** gives a reason, **so** shows a result and **until** shows time.')});

w.add({prompt:"In which sentence is 'so' used as a **conjunction**?",answer:'It was getting dark, so we headed home.',wrong:['The soup was so hot that I waited.','I think so.','The puppy is so tiny!'],rewardGroup:'challenge',
 explanation:explain("In 'It was getting dark, **so** we headed home', so joins two main clauses and shows a result, so it is a co-ordinating conjunction.","- In 'so hot' and 'so tiny', so tells us how hot or how tiny: it is an adverb.","- In 'I think so', so stands for an idea already mentioned; it is not joining anything.")});

w.add({prompt:'Which conjunction completes the sentence to show a **result**?',stimulus:'The ice was thin, ___ nobody walked across the pond.',answer:'so',wrong:['because','although','unless'],
 explanation:explain('Nobody walked across **as a result** of the thin ice, so **so** fits.',"- **because** would need the reason after it: 'nobody walked across because the ice was thin'.",'- **although** shows contrast and **unless** sets a condition.')});

w.add({prompt:'Which conjunction best completes the sentence?',stimulus:'___ the sun set, the bats flew out of the barn.',answer:'When',wrong:['Although','Unless','Whereas'],
 explanation:explain('The bats flew out at the time the sun set, so we need a conjunction that shows **time**: **When**.','- **Although** and **Whereas** show contrast and **Unless** sets a condition: none of them make sense here.')});

w.add({prompt:'Which sentence begins with a **subordinating** conjunction?',answer:'If you see Rory, tell him the good news.',wrong:['Rory will be pleased if you tell him.','Tell Rory the good news.','And then Rory smiled.'],rewardGroup:'challenge',
 explanation:explain("**If** begins the subordinate clause 'If you see Rory', which comes first in the sentence.","- 'Rory will be pleased if you tell him.' uses if too, but not at the beginning.","- 'And then Rory smiled.' begins with **And**, a co-ordinating conjunction.","- 'Tell Rory the good news.' begins with a verb.")});

w.add({prompt:'Which of these is **not** a co-ordinating conjunction?',answer:'when',wrong:['and','but','or','so'],rewardGroup:'quick',
 explanation:explain('The co-ordinating conjunctions are for, and, nor, but, or, yet and so.',"- **when** begins a subordinate clause ('when the bell rings'), so it is a subordinating conjunction.")});

w.add({prompt:'Which sentence uses a **subordinating** conjunction?',answer:'I went to bed early because I was tired.',wrong:['I was tired, so I went to bed early.','I was tired and I went to bed early.','I was tired, but I stayed up to read.'],
 explanation:explain("**because** begins the subordinate clause 'because I was tired', which cannot stand alone, so it is a subordinating conjunction.",'- The other sentences use **so**, **and** or **but**, which are co-ordinating conjunctions: they join two main clauses.')});

export const conjunctions=w.done();
