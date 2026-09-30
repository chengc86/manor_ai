import {explain,type Topic} from './bank-kit';
import {writer,untag} from './bank-english-kit';
// Determiners: articles, demonstratives and quantifiers; a or an; determiner or pronoun. Questions avoid the labels KS2
// sources disagree on (possessives such as my and numbers such as three), so every answer is the same in any textbook.

const topic:Topic={id:'en-determiners',subject:'English',strand:'Grammar',title:'Determiners',helpsheet:{
 intro:'A **determiner** comes before a noun (and before any adjectives) and tells us which one or how many. Examples are the articles (a, an, the), demonstratives (this, that, these, those) and quantifiers (some, every, each, many, no).',
 steps:[
  "Find the noun, then look at the start of its noun phrase: 'those brown eggs'.",
  'Determiners come before any adjectives: in those brown eggs, **those** is a determiner and brown is an adjective.',
  'Use **a** before a consonant sound and **an** before a vowel sound: a cup, an owl, an hour, a uniform.',
  "If the word stands alone without a noun ('Some are broken'), it is a pronoun, not a determiner.",
 ],
 example:{title:'Determiners',lines:['Several children found some gloves in the snow.','- **Several**: quantifier (how many children)','- **some**: quantifier (how many gloves)','- **the**: definite article (which snow)']},
 tips:['Use **this** and **that** with one thing, **these** and **those** with more than one.','Use **fewer** with things you can count (fewer apples) and **less** with things you cannot count (less water).','**The** points to something known; **a** or **an** introduces something new or not particular.'],
}};

const w=writer(topic);
const count=(tagged:string,cls:string)=>({kind:'count',tagged,cls});
const pick=(tagged:string,cls:string,all=false)=>({kind:'pick',tagged,cls,all});

{const t='Several/det ducks/noun waddled/verb across/prep the/det busy/adj road/noun ./';
w.add({prompt:'Which word in the sentence below is a **determiner**?',stimulus:untag(t),answer:'Several',wrong:['ducks','waddled','busy'],rewardGroup:'quick',
 explanation:explain('**Several** comes before the noun ducks and tells us how many, so it is a determiner.','- **the** is a determiner too, but it is not one of the choices.','- **ducks** is a noun, **waddled** is a verb and **busy** is an adjective.')},pick(t,'det'));}

{const t='Those/det boots/noun belong/verb to/prep a/det goalkeeper/noun ./';
w.add({prompt:'Select the **two** determiners in the sentence below.',stimulus:untag(t),answer:['Those','a'],wrong:['boots','belong','to'],
 explanation:explain('**Those** (which boots) and **a** (one goalkeeper, not a particular one) come straight before nouns, so they are determiners.','- **boots** is a noun, **belong** is a verb and **to** is a preposition.')},pick(t,'det',true));}

w.add({prompt:'Which determiner correctly completes the sentence?',stimulus:'Forgetting the map was ___ honest mistake.',answer:'an',wrong:['a','these','many'],
 explanation:explain("'honest' begins with a **vowel sound**: the h is silent, so it sounds like 'onest'. That means we use **an**.",'- **a** is used before a consonant sound.','- **these** and **many** need a plural noun.')});

w.add({prompt:'Which determiner correctly completes the sentence?',stimulus:'A screwdriver is ___ useful tool to keep in the shed.',answer:'a',wrong:['an','these','several'],rewardGroup:'challenge',
 explanation:explain("'useful' begins with a 'y' sound (you-seful), which is a consonant sound, so we use **a**, even though u is a vowel letter.","- **an** is for vowel sounds, as in 'an umbrella'.",'- **these** and **several** need a plural noun.')});

{const t='Every/det morning/noun ,/ the/det twins/noun feed/verb the/det hens/noun and/conj.co some/det ducks/noun ./';
w.add({prompt:'How many determiners are in this sentence?',stimulus:untag(t),answer:'4',wrong:['3','5','6'],
 explanation:explain('The determiners are **Every**, **the** (twice) and **some**: 4. Each comes before a noun and tells us which or how many.',"- 'the' comes twice (the twins, the hens), so it is easy to count it only once.")},count(t,'det'));}

w.add({prompt:'Which determiner in the sentence below tells us **how many**?',stimulus:'The class planted several trees near the pond.',answer:'several',wrong:['The','near','planted'],
 explanation:explain('**several** tells us how many trees were planted: more than two, but not a lot.','- **The** is a determiner too, but it tells us which class, not how many.','- **near** is a preposition and **planted** is a verb.')});

w.add({prompt:"In which sentence is 'this' used as a **determiner**?",answer:'This apple is ripe.',wrong:['Is this yours?','I made this myself.','This is the best seat.'],rewardGroup:'challenge',
 explanation:explain("In 'This **apple**', this comes straight before a noun, so it is a **determiner**.",'- In the other sentences, this stands on its own in place of a noun, so it is a **pronoun**.')});

w.add({prompt:'Which determiner correctly completes the sentence?',stimulus:'___ shoes are too small for me now.',answer:'These',wrong:['This','That','A'],rewardGroup:'quick',
 explanation:explain('**shoes** is plural, so we need a plural determiner: **These**.','- **This**, **That** and **A** go with one thing: this shoe.')});

w.add({prompt:'Which determiner correctly completes the sentence?',stimulus:"There isn't ___ milk left in the fridge.",answer:'much',wrong:['many','few','several'],
 explanation:explain('Milk cannot be counted one by one, so we use **much**.','- **many**, **few** and **several** go with things you can count: many bottles, few eggs.')});

w.add({prompt:'Which word is correct in **standard English**?',stimulus:'There were ___ people at the fete this year than last year.',answer:'fewer',wrong:['less','little','much'],rewardGroup:'challenge',
 explanation:explain('People can be counted, so standard English uses **fewer**: fewer people, fewer cakes.','- **less** is for things you cannot count: less rain.','- **little** and **much** do not go with a plural noun such as people.')});

w.add({prompt:"Why does the second sentence say 'The fox' rather than 'A fox'?",stimulus:'A fox visited our garden last night. The fox ate the bird seed.',answer:'The fox has already been mentioned, so we know which fox it is.',wrong:["'fox' begins with a consonant.",'There were several foxes.',"'The' must always start a sentence."],
 explanation:explain("**The** is used for something the reader already knows about. The first sentence introduces 'a fox', so the second can say 'The fox': the same one.",'- **A** or **an** introduces something new.','- Nothing suggests there were several foxes, and a sentence can start with many different words.')});

{const t='Each/det child/noun brought/verb some/det balloons/noun ./';
w.add({prompt:'Select the **two** determiners in the sentence below.',stimulus:untag(t),answer:['Each','some'],wrong:['child','brought','balloons'],
 explanation:explain('**Each** (every child, one at a time) and **some** (how many balloons) come straight before nouns, so they are determiners.','- **child** and **balloons** are nouns, and **brought** is a verb.')},pick(t,'det',true));}

w.add({prompt:"In which sentence is 'any' used as a **pronoun**?",answer:"I looked for biscuits, but there weren't any.",wrong:['Have you got any glue?','Any child can join the choir.','Is there any milk left?'],rewardGroup:'challenge',
 explanation:explain("In 'there weren't **any**', any stands on its own in place of a noun (any biscuits), so it is a **pronoun**.",'- In the other sentences, any comes straight before a noun (glue, child, milk), so it is a **determiner**.')});

w.add({prompt:'Which of these words is **not** a determiner?',answer:'they',wrong:['every','several','those','no'],rewardGroup:'quick',
 explanation:explain('**they** is a pronoun: it stands on its own in place of a noun.','- every, several, those and no can all go before a noun (every day, several eggs, those trees, no milk), so they are determiners.')});

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'The dragon stretched ___ enormous wings.',answer:'its',wrong:["it's","its'",'it'],
 explanation:explain('The wings belong to the dragon, so we need **its**, which shows belonging and has no apostrophe.',"- **it's** means 'it is' or 'it has'.","- **its'** is not a word, and **it** does not show belonging.")});

w.add({prompt:'Which determiner correctly completes the sentence?',stimulus:'___ pupil in the class received a certificate.',answer:'Every',wrong:['All','Many','Both'],
 explanation:explain('**pupil** is singular, so we need a determiner that goes with one: **Every**.','- **All**, **Many** and **Both** need a plural noun: all pupils, many pupils, both pupils.')});

{const t='There/other is/verb no/det sugar/noun in/prep this/det tea/noun ./';
w.add({prompt:'Select the **two** determiners in the sentence below.',stimulus:untag(t),answer:['no','this'],wrong:['There','is','sugar'],
 explanation:explain('**no** (how much sugar) and **this** (which tea) come straight before nouns, so they are determiners.','- **There** and **is** begin the sentence, and **sugar** is a noun.')},pick(t,'det',true));}

w.add({prompt:'Which determiner shows that the speaker means one **particular** bike that the listener already knows about?',stimulus:'Can I borrow ___ bike from the shed this afternoon?',answer:'the',wrong:['a','any','another'],rewardGroup:'quick',
 explanation:explain('**the** points to one particular bike that the listener already knows about.','- **a**, **any** and **another** would mean a bike that has not been picked out yet.')});

export const determiners=w.done();
