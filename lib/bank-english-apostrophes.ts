import {explain,type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
// Apostrophes for possession (singular, plural, irregular plural) and for contraction; its and it's; plurals need none.
// Notes: 'possessive' names the owner (as written, singular or plural) so the test can build the form with its own rule;
// 'contraction' names the full words; 'apostropheCount' and 'apostropheWord' give the corrected sentence.

const topic:Topic={id:'en-apostrophes',subject:'English',strand:'Punctuation',title:'Apostrophes',helpsheet:{
 intro:"An **apostrophe** does two jobs. It shows **possession** (something belongs to someone: the cat's bowl), and it shows where letters are missing in a **contraction** (do not → don't).",
 steps:[
  "One owner: add **'s** (the girl's bag, James's scarf).",
  "More than one owner, and the plural ends in s: add just an apostrophe after the s (the girls' bags).",
  "A plural that does not end in s (men, children, geese): add **'s** (the geese's pond).",
  "Contractions: put the apostrophe exactly where the letters were left out (could not → couldn't, I will → I'll).",
 ],
 example:{title:'Which job is it doing?',lines:["The owl's feathers are soft. → possession (the feathers belong to the owl)","The owl's hooting again. → contraction (the owl is hooting)"]},
 tips:["Plain plurals never need an apostrophe: 'two bananas', not 'two banana's'.","**its** (belonging to it) has no apostrophe; **it's** always means 'it is' or 'it has'.","Possessive pronouns (hers, ours, yours, theirs) never have an apostrophe."],
}};

const w=writer(topic);
const own=(owner:string,plural:boolean,thing:string)=>({kind:'possessive',owner,plural,thing});
const short=(full:string)=>({kind:'contraction',full});
const allTo=(correct:string,...others:string[])=>({kind:'fixes',want:'correct',fixes:Object.fromEntries([correct,...others].map(o=>[o,correct]))});

w.add({prompt:"Which is the correct way to write 'the tail belonging to the dog'?",answer:"the dog's tail",wrong:['the dogs tail',"the dogs' tail","the dogs's tail"],rewardGroup:'quick',
 explanation:explain("There is **one** dog, so add an **apostrophe + s** to dog: the dog's tail.","- 'the dogs tail' has no apostrophe to show that the tail belongs to the dog.","- 'the dogs' tail' would mean more than one dog.","- 'dogs's' is not correct.")},own('dog',false,'tail'));

w.add({prompt:"Which is the correct way to write 'the kennels belonging to the dogs'?",answer:"the dogs' kennels",wrong:["the dog's kennels","the dogs's kennels",'the dogs kennels'],
 explanation:explain("**dogs** is a plural that already ends in s, so just add an **apostrophe after the s**: the dogs' kennels.","- 'the dog's kennels' would mean one dog.","- 'dogs's' adds an extra s, and 'dogs kennels' has no apostrophe.")},own('dogs',true,'kennels'));

w.add({prompt:"Which is the correct way to write 'the coats belonging to the children'?",answer:"the children's coats",wrong:["the childrens' coats",'the childrens coats',"the children' coats"],rewardGroup:'challenge',
 explanation:explain("**children** is plural but does not end in s, so add an **apostrophe + s**: the children's coats.","- 'the childrens' coats' treats childrens as a word, but it is not one.",'- The other two options are missing the apostrophe or the s.')},own('children',true,'coats'));

w.add({prompt:"Which is the correct contraction of 'they are'?",answer:"they're",wrong:['their','there',"theyr'e"],rewardGroup:'quick',
 explanation:explain("In **they're**, the apostrophe takes the place of the missing letter **a** from 'are'.","- 'their' (belonging to them) and 'there' (a place) are different words that sound the same.",'- The apostrophe must go exactly where the letter is missing.')},short('they are'));

w.add({prompt:"Which is the correct contraction of 'would not'?",answer:"wouldn't",wrong:["would'nt",'wouldnt',"wo'uldnt"],rewardGroup:'quick',
 explanation:explain("The apostrophe goes where a letter is missing: the **o** of 'not'. So would not → **wouldn't**.","- 'would'nt' puts the apostrophe in the wrong place, and 'wouldnt' has none.")},short('would not'));

w.add({prompt:"Which is the correct contraction of 'shall not'?",answer:"shan't",wrong:["shalln't","sha'nt","shall'nt"],rewardGroup:'challenge',
 explanation:explain("**shan't** is an unusual contraction: letters are left out of both words (shall not → shan't), and the apostrophe marks where the o of 'not' was.",'- The other options are not correct spellings.')},short('shall not'));

w.add({prompt:"Which is the correct contraction of 'will not'?",answer:"won't",wrong:["willn't","wo'nt","will'nt"],
 explanation:explain("**won't** is the unusual contraction of will not. The apostrophe marks the missing o of 'not'.","- 'willn't' and 'will'nt' are not words, and 'wo'nt' puts the apostrophe in the wrong place.")},short('will not'));

{const c="It's raining, so the dog is in its kennel.",o=["Its raining, so the dog is in its kennel.","It's raining, so the dog is in it's kennel.","Its raining, so the dog is in it's kennel."];
w.add({prompt:"Which sentence uses **its** and **it's** correctly?",answer:c,wrong:o,rewardGroup:'challenge',
 explanation:explain("**It's** means 'it is': it's raining. **its** shows belonging and has no apostrophe: its kennel.",'- The other options mix these up at least once.')},allTo(c,...o));}

w.add({prompt:'Which sentence uses an apostrophe **incorrectly**?',answer:"Fresh apple's for sale at the gate!",wrong:["The apple's skin was shiny and red.","We're selling apples at the fete.","The farmer's apples are ready to pick."],
 explanation:explain("Here 'apples' is simply a plural: more than one apple. Plurals do not need an apostrophe, so it should be 'Fresh apples for sale'.","- 'The apple's skin' (the skin of one apple), 'We're' (we are) and 'The farmer's apples' (apples belonging to the farmer) are all correct.")},
 {kind:'fixes',want:'incorrect',fixes:{"Fresh apple's for sale at the gate!":'Fresh apples for sale at the gate!',"The apple's skin was shiny and red.":"The apple's skin was shiny and red.","We're selling apples at the fete.":"We're selling apples at the fete.","The farmer's apples are ready to pick.":"The farmer's apples are ready to pick."}});

w.add({prompt:'How many apostrophes are missing from this sentence?',stimulus:'Were going to Ellas house because shes having a party.',answer:'3',wrong:['1','2','4'],rewardGroup:'challenge',
 explanation:explain('Three apostrophes are missing:',"- **We're** (we are)","- **Ella's** (the house belongs to Ella)","- **she's** (she is)")},
 {kind:'apostropheCount',corrected:"We're going to Ella's house because she's having a party."});

w.add({prompt:"Why does 'Leo's' have an apostrophe in the sentence below?",stimulus:"Leo's going to the match on Saturday.",answer:"It is short for 'Leo is'.",wrong:['It shows that something belongs to Leo.','It shows that there is more than one Leo.','It shows the start of speech.'],rewardGroup:'challenge',
 explanation:explain("'**Leo's going** to the match' means '**Leo is** going to the match', so the apostrophe shows that the letter i of 'is' has been left out.","- Nothing belongs to Leo here. Compare 'Leo's scarf', which does show possession.",'- An apostrophe is not used to make a word plural.')});

w.add({prompt:'Which word in the sentence below needs an apostrophe?',stimulus:'The foxs den was hidden under the hedges near the farm.',answer:'foxs',wrong:['hedges','den','farm'],
 explanation:explain("The den belongs to one fox, so **foxs** needs an apostrophe: **fox's** den.",'- **hedges** is just a plural (more than one hedge), so it does not need an apostrophe.','- **den** and **farm** are ordinary nouns.')},
 {kind:'apostropheWord',corrected:"The fox's den was hidden under the hedges near the farm."});

w.add({prompt:'Which sentence shows that the sweets belong to **one** sister?',answer:"My sister's sweets are in the tin.",wrong:["My sisters' sweets are in the tin.",'My sisters sweets are in the tin.',"My sisters's sweets are in the tin."],
 explanation:explain("For **one** sister, add an apostrophe + s: my **sister's** sweets.","- 'My sisters' sweets' would mean more than one sister.","- 'sisters' with no apostrophe is just a plural, and 'sisters's' is not correct.")},own('sister',false,'sweets'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'___ coming to the fete tomorrow?',answer:"Who's",wrong:['Whose','Whos',"Who'se"],
 explanation:explain("The sentence means '**Who is** coming to the fete?', so we need the contraction **Who's**.","- **Whose** asks who something belongs to: 'Whose bag is this?'","- 'Whos' is missing the apostrophe, and 'Who'se' is not a word.")},short('who is'));

w.add({prompt:'Which sentence uses an apostrophe correctly?',answer:"The women's team won the cup.",wrong:["The womens' team won the cup.",'The womens team won the cup.',"The women's' team won the cup."],rewardGroup:'challenge',
 explanation:explain("**women** is plural and does not end in s, so we add an apostrophe + s: the women's team.","- 'The womens' team' and 'The womens team' treat womens as a word, but it is not one.","- 'The women's' team' has an extra apostrophe at the end.")},own('women',true,'team'));

w.add({prompt:'Which word in the sentence below is a **contraction**?',stimulus:"The dog's bowl is empty, so it's barking loudly.",answer:"it's",wrong:["dog's",'empty','barking'],rewardGroup:'challenge',
 explanation:explain("**it's** is short for 'it is': the apostrophe shows the missing letter i.","- **dog's** also has an apostrophe, but it shows that the bowl belongs to the dog, not that letters are missing.")});

{const c="Freya's brother can't swim yet.",o=["Freyas brother can't swim yet.","Freya's brother cant swim yet.","Freyas' brother can't swim yet."];
w.add({prompt:'Which sentence uses apostrophes correctly?',answer:c,wrong:o,
 explanation:explain("**Freya's** needs an apostrophe to show whose brother it is (one person, Freya), and **can't** needs one because it is short for cannot.",'- The other options leave out one of these apostrophes or put it after the s.')},allTo(c,...o));}

w.add({prompt:"What does 'I'd' mean in the sentence below?",stimulus:"If I had more time, I'd build a treehouse.",answer:'I would',wrong:['I had','I did','I could'],rewardGroup:'challenge',
 explanation:explain("'I'd' is short for 'I would' or 'I had'. Here it comes before the plain verb **build**, so it means **I would**: 'I would build a treehouse'.","- 'I had build' does not make sense.","- I'd is never short for 'I did' or 'I could'.")});

export const apostrophes=w.done();
