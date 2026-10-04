import type {Question,Subject} from './questions';
// Original Year 2 questions for the island topics already in the Year 6 bank.
// Non-verbal items use the existing text-and-symbol format (● ■ ▲). Picture islands stay on the Year 6 generators.

type Extra={stimulus?:string;passage?:string;rewardGroup?:Question['rewardGroup']};
type Row=[string,string|string[],string[],string,Extra?];

const minus='\u2212';

function pack(topic:string,subject:Subject,rows:Row[]):Question[]{
 return rows.map(([prompt,answer,options,explanation,extra],i)=>{
  const answers=Array.isArray(answer)?answer:[answer];
  return {id:`y2i-${topic}-${String(i+1).padStart(2,'0')}`,subject,topic,difficulty:'Year 2',prompt,answers,options,explanation,rewardGroup:extra?.rewardGroup??'quick',fixedOrder:true,...(answers.length>1?{select:answers.length}:{}),...(extra?.stimulus?{stimulus:extra.stimulus}:{}),...(extra?.passage?{passage:extra.passage}:{})};
 });
}

const nouns=pack('en-nouns','English',[
 ['Which word is a noun in this sentence?','frog',['frog','jumps','The','quickly'],'**Frog** names an animal, so it is a noun. Jumps is a verb, The is a determiner and quickly is an adverb.',{stimulus:'The frog jumps quickly.'}],
 ['Which word names a thing you can touch?','cup',['cup','happy','quickly','and'],'A **cup** is a thing you can hold, so it is a noun. Happy describes, quickly tells how, and and joins words.'],
 ['How many nouns are in this sentence?','1',['1','2','3','4'],'**Bus** is the only noun. Red describes the bus, and stopped is a verb.',{stimulus:'The red bus stopped.'}],
 ['Which word is a proper noun?','Leeds',['Leeds','city','bus','river'],'**Leeds** is the name of a particular city, so it is a proper noun. City, bus and river are common nouns.',{stimulus:'We visited Leeds by bus.'}],
 ['Select the **two** nouns in this sentence.',['Mum','sandwich'],['Mum','packed','sandwich','quickly'],'**Mum** names a person and **sandwich** names a thing. Packed is a verb and quickly is an adverb.',{stimulus:'Mum packed a sandwich quickly.'}],
 ['Which word names a group?','flock',['flock','sheep','white','field'],'A **flock** is a group of sheep. Sheep names the animals, white describes them and field names a place.',{stimulus:'A flock of white sheep crossed the field.'}],
 ['Which word is the noun in this sentence?','kitten',['kitten','small','slept','A'],'**Kitten** names an animal. Small describes it, slept is a verb and A is a determiner.',{stimulus:'A small kitten slept.'}],
 ['Which of these words is a concrete noun?','pebble',['pebble','silence','kindly','because'],'A **pebble** is a thing you can pick up. Silence is an idea, kindly tells how, and because joins ideas.'],
 ['How many nouns are in this sentence?','2',['2','1','3','4'],'The nouns are **cats** and **mat**. Two tells us how many, sat is a verb and on is a preposition.',{stimulus:'Two cats sat on the mat.'}],
 ['Which word names a person?','teacher',['teacher','teach','loud','under'],'A **teacher** is a person, so it is a noun. Teach is an action, loud describes and under tells us where.'],
]);

const verbs=pack('en-verbs','English',[
 ['Which word is the verb in this sentence?','barked',['barked','dog','loud','The'],'**Barked** tells us what the dog did. Dog is a noun and loud describes the bark.',{stimulus:'The loud dog barked.'}],
 ['Select the **two** verbs in this sentence.',['hops','sings'],['Mia','hops','sings','loudly'],'**Hops** and **sings** are actions. Mia is a noun and loudly tells us how.',{stimulus:'Mia hops and sings loudly.'}],
 ['Which word shows an action in the past?','walked',['walked','Yesterday','shop','we'],'**Walked** tells us what already happened. Yesterday tells us when and shop is a noun.',{stimulus:'Yesterday we walked to the shop.'}],
 ['Which word is an action?','jump',['jump','stone','blue','slowly'],'**Jump** is something you do. A stone is a thing, blue is a colour and slowly tells us how.'],
 ['Which word is the verb in this sentence?','is',['is','bird','small','The'],'**Is** tells us about the bird. Bird is a noun and small describes it.',{stimulus:'The bird is small.'}],
 ['Which sentence tells someone what to do?','Shut the gate.',['Shut the gate.','The gate is shut.','Is the gate shut?','A shut gate.'],'**Shut the gate.** gives an instruction. The others describe a gate or ask about it.'],
 ['Which word is the verb in this sentence?','swam',['swam','Ben','pool','in'],'**Swam** tells us what Ben did. Ben and pool are nouns.',{stimulus:'Ben swam in the pool.'}],
 ['Which word is the verb in this sentence?','fall',['fall','leaves','brown','The'],'**Fall** tells us what the leaves do. Leaves is a noun here, and brown describes them.',{stimulus:'The brown leaves fall.'}],
 ['Select the **two** verbs in this sentence.',['splash','quack'],['ducks','splash','quack','pond'],'**Splash** and **quack** are actions. Ducks and pond are nouns.',{stimulus:'The ducks splash and quack by the pond.'}],
 ['Which word is the verb in this sentence?','mix',['mix','paint','I','the'],'**Mix** tells us what I do. Paint is a noun here: it is the thing being mixed.',{stimulus:'I mix the paint.'}],
]);

const clauses=pack('en-clauses','English',[
 ['Which of these is a complete sentence?','The bus stopped.',['The bus stopped.','On the bus.','After the bus.','The red bus.'],'**The bus stopped.** has a subject and a verb, so it is a complete sentence. The others are only phrases.'],
 ['Which of these is not a complete sentence?','Under the table.',['Under the table.','The cat slept.','I sat down.','We ate lunch.'],'**Under the table.** has no verb, so it is a fragment. The others each tell us what happened.'],
 ['What type of sentence is this?','command',['command','question','statement','fragment'],'**Sit down.** tells someone what to do, so it is a command.',{stimulus:'Sit down.'}],
 ['What type of sentence is this?','question',['question','command','statement','fragment'],'**Where is the ball?** asks for an answer, so it is a question.',{stimulus:'Where is the ball?'}],
 ['Which sentence joins two ideas that can each stand alone?','The sun shone and the puddles dried.',['The sun shone and the puddles dried.','When the sun shone, the puddles dried.','The sun shone.','After the rain.'],'**The sun shone** and **the puddles dried** can each be their own sentence. And joins them. The others have one main idea, or only a phrase.'],
 ['Which words can stand alone as a sentence?','The bell rang',['The bell rang','After lunch','After the bell','lunch the bell'],'**The bell rang** makes sense on its own. After lunch only tells us when.',{stimulus:'After lunch, the bell rang.'}],
 ['Which sentence is a question?','Can you see the moon?',['Can you see the moon?','The moon is bright.','Look at the moon.','A bright moon.'],'**Can you see the moon?** asks something and ends with a question mark.'],
 ['Which sentence is a statement?','The moon is bright.',['The moon is bright.','Is the moon bright?','Look at the moon.','How bright the moon is!'],'**The moon is bright.** tells us something. It does not ask, command or exclaim.'],
 ['Which words complete this as a sentence?','we lined up.',['we lined up.','before the rain.','and very quiet.','when the door shut.'],'The opening already has a joining word, so it needs a main idea: **we lined up.**',{stimulus:'Before the bell rang, ___'}],
 ['Which sentence has a main idea and an extra idea that cannot stand alone?','We stayed in until the rain stopped.',['We stayed in until the rain stopped.','We stayed in.','Until the rain.','The rain stopped and we went out.'],'**We stayed in** can stand alone. **Until the rain stopped** cannot. The last option is two ideas that can both stand alone.'],
]);

const punct=pack('en-sentence-punctuation','English',[
 ['Which sentence is written correctly?\nA. the hen laid an egg\nB. The hen laid an egg\nC. The hen laid an egg.\nD. The Hen laid an egg.\nE. the hen laid an egg?','C',['A','B','C','D','E'],'A statement starts with a capital letter and ends with a full stop: **The hen laid an egg.** Hen is not a name, so it stays small.'],
 ['Which question is written correctly?\nA. where is my hat\nB. Where is my hat\nC. Where is my hat.\nD. Where is my hat?\nE. where is my hat?','D',['A','B','C','D','E'],'A question starts with a capital letter and ends with a question mark: **Where is my hat?**'],
 ['Which sentence writes the day correctly?\nA. We play on monday.\nB. We play on Monday.\nC. We Play on Monday.\nD. we play on Monday.','B',['A','B','C','D'],'Days start with a capital letter, and the sentence does too: **We play on Monday.** Play is not a name.'],
 ['Which mark is missing after the word cold?','full stop',['full stop','comma','question mark','exclamation mark'],'**It is cold.** is one sentence and **We need coats.** is another, so a full stop belongs after cold.',{stimulus:'It is cold We need coats.'}],
 ['Which sentence uses a capital I?\nA. i lost my glove.\nB. I lost my glove.\nC. I Lost my glove.\nD. i Lost my glove.','B',['A','B','C','D'],'The word **I** is always a capital letter. Lost is not a name, so it stays small.'],
 ['Which mark should end this sentence?','exclamation mark',['exclamation mark','full stop','question mark','comma'],'It begins with **What a** and shows a strong feeling, so it ends with an exclamation mark.',{stimulus:'What a tall tree that was'}],
 ['Which sentence is punctuated incorrectly?\nA. The dog is wet.\nB. Is the dog wet?\nC. What a wet dog that was!\nD. Dry the dog.\nE. Is the dog wet.','E',['A','B','C','D','E'],'**Is the dog wet.** is a question, so it needs a question mark. The others are a statement, a question, an exclamation and a command, each with the right mark.'],
 ['Which sentence writes the name correctly?\nA. my friend is called rafi.\nB. My friend is called rafi.\nC. My friend is called Rafi.\nD. My Friend is called Rafi.','C',['A','B','C','D'],'The sentence starts with a capital, and the name **Rafi** needs one too. Friend is an ordinary word.'],
 ['Which mark is missing after the word set?','full stop',['full stop','comma','question mark','exclamation mark'],'**The jam set.** and **The toast popped.** are two sentences, so a full stop belongs after set.',{stimulus:'The jam set The toast popped.'}],
 ['Which sentence writes the place correctly?\nA. We went to york.\nB. We went to York.\nC. We Went to York.\nD. we went to York.','B',['A','B','C','D'],'**York** is a place, so it needs a capital letter. Went is an ordinary word.'],
]);

const mitten='Nora walked to the duck pond with one blue mitten on. The other mitten was missing. She looked under the bench and beside the reeds. A mallard had the red mitten in its beak. Nora held out a crust of bread. The duck dropped the mitten and took the bread. Nora laughed and pulled the mitten back on.';
const beans='Class Two put three beans on wet cotton wool in a jar. They set the jar on the sunny window ledge. After four days a white root poked out. Miss Adeyemi asked the class not to touch it. By the next Monday a green shoot had grown towards the light. Rafi drew the jar in his book.';
const fiction=pack('en-fiction','English',[
 ['Where did Nora walk?','the duck pond',['the duck pond','the shop','the beach','the school'],'The passage says Nora walked **to the duck pond**.',{passage:mitten}],
 ['What colour was the mitten in the duck\'s beak?','red',['red','blue','green','yellow'],'Nora was wearing a blue mitten. The mallard had **the red mitten**.',{passage:mitten}],
 ['Where did Nora look first?','under the bench',['under the bench','beside the reeds','in the shop','up a tree'],'The passage says she looked **under the bench** and then beside the reeds.',{passage:mitten}],
 ['What did Nora give the duck?','a crust of bread',['a crust of bread','the blue mitten','a fish','a jar'],'Nora **held out a crust of bread**, and the duck took it.',{passage:mitten}],
 ['How does Nora feel at the end?','pleased',['pleased','cross','sleepy','frightened'],'Nora **laughed** and put the mitten back on, so she is pleased.',{passage:mitten,rewardGroup:'standard'}],
 ['How many beans did the class use?','three',['three','two','four','one'],'The passage says they put **three beans** in the jar.',{passage:beans}],
 ['Where did they put the jar?','on the sunny window ledge',['on the sunny window ledge','in a cupboard','under the bench','by the pond'],'They set the jar **on the sunny window ledge**.',{passage:beans}],
 ['What appeared after four days?','a white root',['a white root','a green shoot','a red flower','a yellow leaf'],'After four days **a white root** poked out. The green shoot came later.',{passage:beans}],
 ['What did Miss Adeyemi ask the class to do?','not to touch the root',['not to touch the root','to eat the beans','to hide the jar','to draw the duck'],'She **asked the class not to touch it**.',{passage:beans}],
 ['Who drew the jar?','Rafi',['Rafi','Nora','Miss Adeyemi','the mallard'],'The passage says **Rafi** drew the jar in his book.',{passage:beans}],
]);

type PairSource=[string,string,string[],string[],string,Extra?];
function fixPair(row:PairSource):Row{
 return [row[0],row[2],row[3],row[4],row[5]];
}
function pairRows(rows:PairSource[]){return rows.map(fixPair);}

const synonyms=pack('vr-synonyms','Verbal reasoning',pairRows([
 ['Select the **two** words, one from each group, that are closest in meaning.','',['big','huge'],['big','red','slow','huge','green','hop'],'**Big** and **huge** both mean large. None of the other words across the groups mean the same.',{stimulus:'big, red, slow | huge, green, hop'}],
 ['Select the **two** words, one from each group, that are closest in meaning.','',['start','begin'],['start','apple','chair','begin','bread','cloud'],'**Start** and **begin** both mean to get going.',{stimulus:'start, apple, chair | begin, bread, cloud'}],
 ['Select the **two** words, one from each group, that are closest in meaning.','',['happy','glad'],['happy','stone','pencil','glad','river','spoon'],'**Happy** and **glad** both mean pleased.',{stimulus:'happy, stone, pencil | glad, river, spoon'}],
 ['Select the **two** words, one from each group, that are closest in meaning.','',['small','tiny'],['small','shout','wet','tiny','sing','rain'],'**Small** and **tiny** both mean little.',{stimulus:'small, shout, wet | tiny, sing, rain'}],
 ['Select the **two** words, one from each group, that are closest in meaning.','',['look','see'],['look','cake','shoe','see','plate','hat'],'**Look** and **see** both mean to use your eyes.',{stimulus:'look, cake, shoe | see, plate, hat'}],
 ['Select the **two** words, one from each group, that are closest in meaning.','',['fast','quick'],['fast','blue','cup','quick','yellow','bowl'],'**Fast** and **quick** both mean speedy.',{stimulus:'fast, blue, cup | quick, yellow, bowl'}],
 ['Select the **two** words, one from each group, that are closest in meaning.','',['sad','unhappy'],['sad','tree','book','unhappy','leaf','page'],'**Sad** and **unhappy** both mean not cheerful. A leaf is part of a tree, but the words do not mean the same.',{stimulus:'sad, tree, book | unhappy, leaf, page'}],
 ['Select the **two** words, one from each group, that are closest in meaning.','',['close','shut'],['close','open','jump','shut','wide','run'],'**Close** and **shut** both mean to make something not open.',{stimulus:'close, open, jump | shut, wide, run'}],
 ['Select the **two** words, one from each group, that are closest in meaning.','',['tidy','neat'],['tidy','loud','cold','neat','quiet','hot'],'**Tidy** and **neat** both mean in good order. Loud and quiet are opposites, and so are cold and hot.',{stimulus:'tidy, loud, cold | neat, quiet, hot'}],
 ['Select the **two** words, one from each group, that are closest in meaning.','',['gift','present'],['gift','road','laugh','present','river','sleep'],'A **gift** and a **present** are both something you give.',{stimulus:'gift, road, laugh | present, river, sleep'}],
]));

const antonyms=pack('vr-antonyms','Verbal reasoning',pairRows([
 ['Select the **two** words, one from each group, that are opposites.','',['hot','cold'],['hot','red','up','cold','blue','over'],'**Hot** and **cold** are opposites. Up and over are not.',{stimulus:'hot, red, up | cold, blue, over'}],
 ['Select the **two** words, one from each group, that are opposites.','',['big','small'],['big','day','sit','small','sun','run'],'**Big** and **small** are opposites.',{stimulus:'big, day, sit | small, sun, run'}],
 ['Select the **two** words, one from each group, that are opposites.','',['open','shut'],['open','soft','early','shut','loud','soon'],'**Open** and **shut** are opposites.',{stimulus:'open, soft, early | shut, loud, soon'}],
 ['Select the **two** words, one from each group, that are opposites.','',['full','empty'],['full','happy','high','empty','kind','wide'],'**Full** and **empty** are opposites.',{stimulus:'full, happy, high | empty, kind, wide'}],
 ['Select the **two** words, one from each group, that are opposites.','',['fast','slow'],['fast','light','new','slow','lamp','young'],'**Fast** and **slow** are opposites. A lamp gives light, but the words are not opposites.',{stimulus:'fast, light, new | slow, lamp, young'}],
 ['Select the **two** words, one from each group, that are opposites.','',['up','down'],['up','noisy','sweet','down','music','sour'],'**Up** and **down** are opposites.',{stimulus:'up, noisy, sweet | down, music, sour'}],
 ['Select the **two** words, one from each group, that are opposites.','',['in','out'],['in','rough','add','out','rocky','plus'],'**In** and **out** are opposites.',{stimulus:'in, rough, add | out, rocky, plus'}],
 ['Select the **two** words, one from each group, that are opposites.','',['awake','asleep'],['awake','thick','push','asleep','wide','drop'],'**Awake** and **asleep** are opposites.',{stimulus:'awake, thick, push | asleep, wide, drop'}],
 ['Select the **two** words, one from each group, that are opposites.','',['above','below'],['above','brave','arrive','below','strong','stay'],'**Above** and **below** are opposites.',{stimulus:'above, brave, arrive | below, strong, stay'}],
 ['Select the **two** words, one from each group, that are opposites.','',['many','few'],['many','clean','begin','few','shiny','start'],'**Many** and **few** are opposites. Begin and start mean the same, so they are not the opposite pair.',{stimulus:'many, clean, begin | few, shiny, start'}],
]));

const definitions=pack('vr-definitions','Verbal reasoning',[
 ['What does **tiny** mean in this sentence?','very small',['very small','very loud','very old','very wet','very fast'],'A **tiny** ant is a **very small** one.',{stimulus:'The tiny ant crawled under the leaf.'}],
 ['What does **damp** mean in this sentence?','a little wet',['a little wet','very dry','torn','blue','heavy'],'A **damp** towel is still **a little wet**.',{stimulus:'The towel was still damp.'}],
 ['What does **grin** mean in this sentence?','a big smile',['a big smile','a frown','a whisper','a jump','a hat'],'A wide **grin** is **a big smile**.',{stimulus:'She gave a wide grin.'}],
 ['What does **rush** mean in this sentence?','hurry',['hurry','walk slowly','sit','hide','sleep'],'If you **rush**, you **hurry**.',{stimulus:'We had to rush to the gate.'}],
 ['What does **chilly** mean in this sentence?','a bit cold',['a bit cold','very hot','dark','noisy','late'],'A **chilly** morning is **a bit cold**.',{stimulus:'The morning was chilly.'}],
 ['What does **mend** mean in this sentence?','fix',['fix','fly','lose','buy','hide'],'To **mend** the kite is to **fix** it.',{stimulus:'Dad will mend the broken kite.'}],
 ['What does **peek** mean in this sentence?','look quickly',['look quickly','wrap','shake','drop','eat'],'To **peek** is to **look quickly**, when you should not.',{stimulus:'Do not peek at the present.'}],
 ['What does **soggy** mean in this sentence?','wet and soft',['wet and soft','dry and hard','burnt','sweet','tiny'],'**Soggy** bread is **wet and soft**.',{stimulus:'The bread went soggy in the rain.'}],
 ['What does **silent** mean in this sentence?','without any sound',['without any sound','full of noise','very bright','crowded','cold'],'A **silent** hall is **without any sound**.',{stimulus:'The hall was silent.'}],
 ['What does **gentle** mean in this sentence?','kind and careful',['kind and careful','rough','loud','fast','angry'],'To be **gentle** is to be **kind and careful**.',{stimulus:'Be gentle with the puppy.'}],
]);

const homographs=pack('vr-double-meanings','Verbal reasoning',[
 ['Which word can mean both a flying animal and a stick used in rounders?','bat',['bat','ball','nest','wing','glove'],'A **bat** flies at night, and a **bat** is also the stick you hit a ball with.'],
 ['Which word can mean both to leave a car and a place with grass and paths?','park',['park','road','garage','garden','street'],'You can **park** a car, and a **park** is a green place to play.'],
 ['Which word can mean both a movement of the hand and water rolling in the sea?','wave',['wave','hand','sea','flag','splash'],'You **wave** goodbye, and a **wave** is water moving towards the shore.'],
 ['Which word can mean both a metal pin and the hard tip of a finger?','nail',['nail','hammer','screw','thumb','wood'],'You hammer a **nail**, and you also have a **nail** on each finger.'],
 ['Which word can mean both not heavy and not dark?','light',['light','lamp','heavy','dark','bright'],'A bag can be **light** to carry, and a room can be **light** rather than dark.'],
 ['Which word can mean both a circle of metal you wear and the sound of a bell?','ring',['ring','bell','watch','circle','phone'],'A **ring** goes on a finger, and a bell can **ring**.'],
 ['Which word can mean both a game and a small stick that makes a flame?','match',['match','game','stick','fire','team'],'A football **match** is a game, and a **match** can light a candle.'],
 ['Which word can mean both the side of a river and a place that looks after money?','bank',['bank','river','shop','money','hill'],'Ducks sit on the river **bank**, and a **bank** also keeps money safe.'],
 ['Which word can mean both a fruit spread and a line of stuck traffic?','jam',['jam','honey','traffic','bread','car'],'You can eat strawberry **jam**, and cars can be stuck in a traffic **jam**.'],
 ['Which word can mean both healthy and a deep hole that holds water?','well',['well','ill','tap','bucket','pond'],'If you are **well**, you are healthy. A **well** is also a hole dug for water.'],
]);

const oddWords=pack('vr-odd-ones-out','Verbal reasoning',[
 ['Which word does not belong?','bus',['apple','banana','grape','bus'],'Apple, banana and grape are fruit. A **bus** is a way to travel.'],
 ['Which word does not belong?','spoon',['cat','dog','rabbit','spoon'],'Cat, dog and rabbit are animals. A **spoon** is a tool for eating.'],
 ['Which word does not belong?','seven',['red','blue','green','seven'],'Red, blue and green are colours. **Seven** is a number.'],
 ['Which word does not belong?','pencil',['sock','hat','coat','pencil'],'A sock, a hat and a coat are clothes. A **pencil** is for writing.'],
 ['Select the **two** words that do not belong.',['cake','bread'],['car','train','bus','cake','bread'],'Car, train and bus are ways to travel. **Cake** and **bread** are foods.'],
 ['Which word does not belong?','Monday',['circle','square','triangle','Monday'],'Circle, square and triangle are shapes. **Monday** is a day.'],
 ['Which word does not belong?','rose',['kick','throw','catch','rose'],'Kick, throw and catch are actions in a ball game. A **rose** is a flower.'],
 ['Select the **two** words that do not belong.',['chair','table'],['cat','dog','cow','chair','table'],'Cat, dog and cow are animals. A **chair** and a **table** are furniture.'],
 ['Which word does not belong?','bread',['rain','snow','wind','bread'],'Rain, snow and wind are kinds of weather. **Bread** is food.'],
 ['Select the **two** words that do not belong.',['book','pen'],['puppy','kitten','calf','book','pen'],'A puppy, a kitten and a calf are young animals. A **book** and a **pen** are for reading and writing.'],
]);

const place=pack('ma-place-value','Maths',[
 ['How many tens are in 47?','4',['4','7','40','47','3'],'47 is **4** tens and 7 ones. The digit 4 is worth 40, but there are 4 tens.'],
 ['63 is 6 tens and how many ones?','3',['3','6','9','60','30'],'63 is 6 tens and **3** ones.'],
 ['What is the value of the digit 5 in 58?','50',['5','8','50','80','58'],'The 5 is in the tens place, so it is worth **50**.'],
 ['Which number is 3 tens and 6 ones?','36',['6','30','36','63','306'],'3 tens are 30, and 6 ones make **36**.'],
 ['How many tens make 80?','8',['0','8','10','18','80'],'80 is **8** tens. The digit 8 tells us how many tens.'],
 ['Which number has 4 in the tens place and 2 in the ones place?','42',['2','24','40','42','44'],'4 tens and 2 ones make **42**. 24 has the digits the other way round.'],
 ['What is 10 more than 46?','56',['36','47','50','56','66'],'10 more adds one ten: 46 becomes **56**.'],
 ['What is 1 less than 30?','29',['20','29','30','31','39'],'One less than 30 is **29**.'],
 ['How many ones are in 15?','5',['1','5','10','15','50'],'15 is 1 ten and **5** ones.'],
 ['Which number is 2 tens and 0 ones?','20',['2','10','12','20','200'],'2 tens are 20, and no extra ones still leaves **20**.'],
]);

const order=pack('ma-order-compare','Maths',[
 ['Which number is greater?','82',['28','80','82'],'**82** has 8 tens. 28 has only 2 tens, so 82 is greater.',{stimulus:'28 or 82'}],
 ['Which number is the smallest?','11',['11','14','40','41','44'],'**11** has 1 ten. The others have 4 tens, so 11 is smallest.'],
 ['Which statement is true?','35 < 53',['35 < 53','35 > 53','35 = 53','53 < 35'],'35 has 3 tens and 53 has 5 tens, so **35 < 53**.'],
 ['Which number comes between 28 and 30?','29',['27','28','29','30','31'],'28, **29**, 30. 29 is the number in the gap.'],
 ['Which number is the greatest?','76',['60','66','67','70','76'],'**76** has 7 tens and 6 ones, which is more than 70, 67, 66 and 60.'],
 ['Choose the words that make this true: 50 is ___ 49.','greater than',['greater than','less than','equal to','half of'],'50 is one more than 49, so 50 is **greater than** 49.'],
 ['Which of these numbers is less than 40?','39',['39','40','41','44','50'],'**39** is just below 40. The others are 40 or more.'],
 ['These numbers are ordered from smallest to greatest: 12, 18, 21. Which one is in the middle?','18',['10','12','18','20','21'],'12, **18**, 21. The middle number is 18.'],
 ['Which number comes just after 59?','60',['50','58','59','60','61'],'After 59 comes **60**.'],
 ['16 is greater than which of these numbers?','9',['9','16','17','20','60'],'Only **9** is smaller than 16. The others are 16 or more.'],
]);

const rounding=pack('ma-rounding','Maths',[
 ['Round 24 to the nearest 10.','20',['10','20','24','30','40'],'24 is closer to **20** than to 30.'],
 ['Round 37 to the nearest 10.','40',['30','35','37','40','50'],'37 is closer to **40** than to 30.'],
 ['Round 45 to the nearest 10.','50',['40','45','46','50','60'],'A 5 in the ones place rounds up, so 45 rounds to **50**.'],
 ['Round 62 to the nearest 10.','60',['50','60','62','70','80'],'62 is closer to **60** than to 70.'],
 ['Round 8 to the nearest 10.','10',['0','8','10','18','20'],'8 is closer to **10** than to 0.'],
 ['Round 91 to the nearest 10.','90',['80','90','91','100','10'],'91 is closer to **90** than to 100.'],
 ['Round 55 to the nearest 10.','60',['50','55','56','60','65'],'A 5 in the ones place rounds up, so 55 rounds to **60**.'],
 ['Round 19 to the nearest 10.','20',['10','15','19','20','30'],'19 is closer to **20** than to 10.'],
 ['Round 74 to the nearest 10.','70',['60','70','74','75','80'],'74 is closer to **70** than to 80.'],
 ['Round 16 to the nearest 10.','20',['6','10','16','20','26'],'16 is closer to **20** than to 10.'],
]);

const neg=(n:number)=>n<0?minus+String(-n):String(n);
const negatives=pack('ma-negative-numbers','Maths',[
 [`What is 3 ${minus} 5?`,neg(-2),[neg(-2),'2',neg(-8),'8','0'],`Count back 5 from 3: 2, 1, 0, ${minus}1, **${minus}2**.`],
 [`The temperature is ${minus}1${'\u00b0'}C. It falls by 2 degrees. What is it now?`,`${minus}3${'\u00b0'}C`,[`${minus}3${'\u00b0'}C`,`${minus}1${'\u00b0'}C`,'1\u00b0C','2\u00b0C','3\u00b0C'],`Falling means counting back. From ${minus}1, two steps back land on **${minus}3${'\u00b0'}C**.`],
 [`Which temperature is colder?`,`${minus}4${'\u00b0'}C`,[`${minus}4${'\u00b0'}C`,'1\u00b0C','4\u00b0C','0\u00b0C'],`${minus}4 is below 0 and 1 is above 0, so **${minus}4${'\u00b0'}C** is colder.`,{stimulus:`${minus}4${'\u00b0'}C or 1${'\u00b0'}C`}],
 [`What is ${minus}2 + 5?`,'3',['3',neg(-3),neg(-7),'7','2'],`Start at ${minus}2 and count on 5: ${minus}1, 0, 1, 2, **3**.`],
 ['Start at 1 and count back 4. Where do you land?',neg(-3),[neg(-3),'3',neg(-4),'5','0'],`1, 0, ${minus}1, ${minus}2, **${minus}3**.`],
 ['Which number is less than 0?',neg(-1),[neg(-1),'0','1','2','4'],`**${minus}1** is below 0. Zero is not less than itself.`],
 [`What is ${minus}3 + 3?`,'0',['0',neg(-6),'6',neg(-3),'3'],`Adding 3 undoes a start at ${minus}3, so you land on **0**.`],
 [`Which of these comes first if you order them from smallest to greatest?`,neg(-2),[neg(-2),neg(-1),'0','1','2'],`${minus}2 is the smallest. On a number line it sits furthest left.`,{stimulus:`${minus}2, 0 and 2`}],
 [`What is 0 ${minus} 4?`,neg(-4),[neg(-4),'4','0',neg(-1),'5'],`Counting back 4 from 0 lands on **${minus}4**.`],
 [`A lift is on floor ${minus}1. It goes down 1 floor. Which floor is it on now?`,neg(-2),[neg(-2),'0',neg(-1),'1','2'],`Down from ${minus}1 is **${minus}2**. Going up would reach 0.`],
]);

const romans=pack('ma-roman-numerals','Maths',[
 ['What number is the Roman numeral V?','5',['1','4','5','6','10'],'**V** stands for 5.'],
 ['What number is the Roman numeral X?','10',['1','5','10','15','20'],'**X** stands for 10.'],
 ['What number is the Roman numeral IV?','4',['4','5','6','9','15'],'I before V means 1 less than 5, so **IV** is 4.'],
 ['What number is the Roman numeral IX?','9',['1','4','9','10','11'],'I before X means 1 less than 10, so **IX** is 9.'],
 ['What number is the Roman numeral VI?','6',['4','5','6','11','16'],'V then I means 5 plus 1, so **VI** is 6.'],
 ['How is 7 written in Roman numerals?','VII',['III','IV','V','VII','IX'],'7 is 5 plus 2, so it is **VII**.'],
 ['How is 3 written in Roman numerals?','III',['II','III','IV','V','VI'],'3 is three ones: **III**.'],
 ['Which Roman numeral is worth more?','X',['I','IV','V','VI','X'],'**X** is 10. V is 5, so X is worth more.',{stimulus:'V or X'}],
 ['What is II + III? Give your answer as an ordinary number.','5',['4','5','6','8','23'],'II is 2 and III is 3. 2 + 3 = **5**.'],
 ['What is X − I? Give your answer as an ordinary number.','9',['4','8','9','10','11'],'X is 10 and I is 1. 10 − 1 = **9**.'],
]);

const mental=pack('ma-mental-add-sub','Maths',[
 ['What is 8 + 7?','15',['13','14','15','16','17'],'8 + 2 = 10, and 5 more makes **15**.'],
 ['What is 20 − 6?','14',['12','14','16','26','4'],'Take 6 away from 20 to leave **14**.'],
 ['What is 15 + 5?','20',['10','15','19','20','25'],'5 more than 15 makes a ten: **20**.'],
 ['What is 40 + 30?','70',['10','60','70','80','43'],'4 tens plus 3 tens is 7 tens: **70**.'],
 ['What is 50 − 20?','30',['20','30','40','70','25'],'5 tens take away 2 tens leaves **30**.'],
 ['What is 9 + 8?','17',['15','16','17','18','19'],'9 + 1 = 10, and 7 more makes **17**.'],
 ['What is 36 + 10?','46',['26','35','46','47','56'],'Add one ten to 36 to make **46**.'],
 ['What is 25 − 4?','21',['19','20','21','24','29'],'25 take away 4 is **21**.'],
 ['What is 12 + 13?','25',['15','23','24','25','35'],'12 + 10 = 22, and 3 more makes **25**.'],
 ['Use a near ten to help: 31 − 19.','12',['10','11','12','18','22'],'31 − 20 = 11, then add 1 back because you took away one too many: **12**.'],
]);

const science=pack('sc-classification','Science',[
 ['Which of these is a living thing?','robin',['robin','rock','spoon','cloud','shoe'],'A **robin** grows, breathes and can have young. Rocks, spoons, clouds and shoes do not.'],
 ['Which of these is a plant?','sunflower',['sunflower','goldfish','dog','pebble','jumper'],'A **sunflower** is a plant: it has a stem and leaves and makes its own food. A goldfish and a dog are animals.'],
 ['Select the **two** animals.',['cat','bee'],['cat','bee','oak tree','stone','rain'],'A **cat** and a **bee** are animals. An oak tree is a plant. A stone and rain are not alive.'],
 ['Which animal has a backbone?','dog',['dog','worm','snail','jellyfish'],'A **dog** is a vertebrate: you can feel the bones along its back. A worm, a snail and a jellyfish have no backbone.'],
 ['Which animal has no backbone?','worm',['dog','robin','worm','goldfish'],'A **worm** is an invertebrate. A dog, a robin and a goldfish all have a backbone.'],
 ['Which group does a robin belong to?','birds',['birds','fish','insects','plants'],'A robin has feathers and a beak, so it belongs with the **birds**.'],
 ['Select the **two** plants.',['grass','daisy'],['grass','daisy','cat','cloud','coin'],'**Grass** and a **daisy** are plants. A cat is an animal. A cloud and a coin are not living.'],
 ['Which of these is not living?','brick',['cat','moss','brick','bee'],'A **brick** was made by people and does not grow. A cat and a bee are animals, and moss is a plant.'],
 ['Which of these is a fish?','goldfish',['goldfish','robin','cat','worm'],'A **goldfish** has fins and lives in water. A robin is a bird, a cat is a mammal and a worm has no backbone.'],
 ['Which question is best for sorting a pile of animals?','Does it have legs?',['Does it have legs?','Is it nice?','Is it pretty?','Is it my favourite?'],'**Does it have legs?** can be answered yes or no by looking. Nice, pretty and favourite are opinions, so people would not sort the animals in the same way.'],
]);

const oddShapes=pack('nv-odd-one-out','Non-verbal reasoning',[
 ['Which row is the odd one out?\nA. ● ● ●\nB. ● ● ●\nC. ■ ■ ■\nD. ● ● ●\nE. ● ● ●','C',['A','B','C','D','E'],'A, B, D and E are three circles. **C** is three squares.'],
 ['Which row is the odd one out?\nA. ▲ ▲\nB. ▲ ▲ ▲\nC. ▲ ▲\nD. ▲ ▲\nE. ▲ ▲','B',['A','B','C','D','E'],'The other rows have two triangles. **B** has three.'],
 ['Which row is the odd one out?\nA. ●\nB. ○\nC. ●\nD. ●\nE. ●','B',['A','B','C','D','E'],'The other shapes are filled circles. **B** is an empty circle.'],
 ['Which row is the odd one out?\nA. ● ●\nB. ★ ★\nC. ● ●\nD. ● ●\nE. ● ●','B',['A','B','C','D','E'],'The other rows are circles. **B** is stars.'],
 ['Which row is the odd one out?\nA. ▲\nB. ▲\nC. ▼\nD. ▲\nE. ▲','C',['A','B','C','D','E'],'The other triangles point up. **C** points down.'],
 ['Which row is the odd one out?\nA. ■ ●\nB. ■ ●\nC. ■ ●\nD. ■ ▲\nE. ■ ●','D',['A','B','C','D','E'],'The other rows are a square then a circle. **D** is a square then a triangle.'],
 ['Which row is the odd one out?\nA. small ●\nB. small ●\nC. big ●\nD. small ●\nE. small ●','C',['A','B','C','D','E'],'The other circles are small. **C** is a big circle.'],
 ['Which row is the odd one out?\nA. ◆ ◆\nB. ◆ ◆\nC. ◆ ◆\nD. ● ●\nE. ◆ ◆','D',['A','B','C','D','E'],'The other rows are diamonds. **D** is circles.'],
 ['Which row is the odd one out?\nA. ● ■\nB. ● ■\nC. ■ ●\nD. ● ■\nE. ● ■','C',['A','B','C','D','E'],'The other rows start with a circle. **C** starts with a square.'],
 ['Which row is the odd one out?\nA. ★ ★ ★\nB. ★ ★\nC. ★ ★ ★\nD. ★ ★ ★\nE. ★ ★ ★','B',['A','B','C','D','E'],'The other rows have three stars. **B** has two.'],
]);

const groups=pack('nv-match-group','Non-verbal reasoning',[
 ['The group is ▲▲, ■■ and ●●. Which set could join the group?','★ ★',['★ ★','▲ ■','●','★ ▲','■ ● ●'],'Every set in the group is **two copies of the same shape**. ★ ★ follows that rule.'],
 ['The group is ▲, ▲▲ and ▲▲▲. Which set could join the group?','▲▲▲▲',['▲▲▲▲','●','■','▼','★'],'The group is only upward triangles, growing by one. **▲▲▲▲** is the next set of the same shape.'],
 ['The group is ○, □ and △. Which shape could join the group?','◇',['◇','●','■','▲','★'],'The group is empty outlines. **◇** is an empty diamond. The others are filled.'],
 ['The group is ●●●, ■■■ and ▲▲▲. Which set could join the group?','★★★',['★★★','★','●●','■■','▲ ■ ●'],'Each set in the group is **three of the same shape**. ★★★ matches.'],
 ['The group is ▲▼, ●○ and ■□. Which set could join the group?','★☆',['★☆','★★','▲▲','●●','■▲'],'Each pair is a filled shape and then the same shape as an outline. **★☆** follows that rule.'],
 ['The group is one small shape in each box: ●, ■ and ▲. Which could join the group?','★',['★','●●','■■','▲▲','●■'],'Each box holds **one shape**. A single star can join. The others are pairs.'],
 ['The group is ●■, ●▲ and ●★. Which set could join the group?','●◆',['●◆','■●','▲●','★★','●'],'Every set **starts with a circle** and then a different shape. ●◆ matches.'],
 ['The group is ▲, ■ and ●, each one big. Which could join the group?','a big ★',['a big ★','a small ★','two stars','a small ●','an empty ○'],'The group is **one big shape**. A big star follows the rule.'],
 ['The group is ○○, □□ and △△. Which set could join the group?','◇◇',['◇◇','●●','■■','▲▲','◇'],'The group is **two empty copies** of a shape. ◇◇ matches. A single diamond is only one.'],
 ['The group points down: ▼, ▼▼ and ▼▼▼. Which set could join the group?','▼▼▼▼',['▼▼▼▼','▲','▲▲','●','★★'],'The group is downward triangles. **▼▼▼▼** is more of the same. Upward triangles do not match.'],
]);

const pairs=pack('nv-match-pair','Non-verbal reasoning',[
 ['The pair is ●● and ■■. Which shape belongs with that pair?','▲▲',['▲▲','▲■','●','★■','▲'],'Both shapes in the pair are **two matching copies**. ▲▲ is another pair like that.'],
 ['The pair is ▲ and ▼. Which shape belongs with that pair?','a star turned upside down',['a star turned upside down','another ▲','a filled ■','two circles','an empty □'],'The pair is the same triangle **turned to point the other way**. A star turned upside down follows that change.'],
 ['The pair is a big ● and a small ●. Which shape belongs with that pair?','a big ■ and a small ■',['a big ■ and a small ■','two big ■','a small ▲ only','three ●','a big ★ and a small ●'],'The pair keeps the shape and **makes it smaller**. A big square with a small square matches.'],
 ['The pair is ○ and □. Which shape belongs with that pair?','△',['△','●','■','▲','★'],'Both shapes in the pair are **empty outlines**. An empty triangle belongs with them.'],
 ['The pair is ●■● and ▲■▲. Which shape belongs with that pair?','★■★',['★■★','■■■','●●●','▲▲▲','■★■'],'Each shape has the **same end shapes** and a square in the middle. ★■★ matches.'],
 ['The pair is one ★ and one ●. Which shape belongs with that pair?','one ■',['one ■','★★','●●','▲■','three stars'],'Each shape in the pair is **a single shape**. One square belongs with them.'],
 ['The pair is ▲▲▲ and ●●. Which count comes next in the same pair of ideas: a set of three, then a set of two?','■■',['■■','■■■','■','▲▲','●●●'],'The pair goes from three shapes to **two shapes**. ■■ is a set of two.'],
 ['The pair is a black ● and a white ○. Which shape belongs with that pair?','a black ■ and a white □',['a black ■ and a white □','two black ■','a white ○ only','a black ▲ and a black ■','three stars'],'The pair shows a shape and then the **same shape in outline**. A black square and a white square do that.'],
 ['The pair is ↑ and →. Which arrow belongs with a pair that turns once to the right?','↓',['↓','↑','a circle','a square','two arrows pointing up'],'The arrows turn a quarter turn clockwise: up, then right, then **down**.'],
 ['The pair is ● and ●●●. Which shape belongs with that pair?','■ and ■■■',['■ and ■■■','▲ and ●','one star','■■','●●'],'The pair is one shape, then **three of that same shape**. One square and three squares match.'],
]);

const analogies=pack('nv-analogies','Non-verbal reasoning',[
 ['▲ becomes ▲▲. What does ■ become?','■■',['■■','■','▲▲','●●','▲'],'The change makes **two** of the same shape. A square becomes two squares.'],
 ['● becomes ○. What does ■ become?','□',['□','■','○','●','▲'],'A filled shape becomes the **same shape as an outline**. A filled square becomes an empty square.'],
 ['▲ becomes ▼. What does ★ become?','a star pointing down',['a star pointing down','another ★ pointing up','a circle','a square','two stars'],'The shape is **turned upside down**. The star points the other way.'],
 ['A big ● becomes a small ●. What does a big ■ become?','a small ■',['a small ■','a big ■','a small ●','a big ▲','two squares'],'The shape stays the same and **gets smaller**.'],
 ['●■ becomes ■●. What does ▲★ become?','★▲',['★▲','▲★','●■','★★','▲▲'],'The two shapes **swap places**. Triangle then star becomes star then triangle.'],
 ['▲ becomes ▲▲▲. What does ● become?','●●●',['●●●','●','●●','■■■','▲▲▲'],'One shape becomes **three** of the same shape.'],
 ['○○ becomes ●●. What does □□ become?','■■',['■■','□□','○○','●●','▲▲'],'Empty shapes become **filled** shapes of the same kind.'],
 ['■● becomes ●. What does ▲★ become?','★',['★','▲','▲★','●','■■'],'The **second shape is kept** and the first is dropped.'],
 ['Three small ● become one big ●. What do three small ■ become?','one big ■',['one big ■','three big ■','one small ■','one big ●','three small ▲'],'Several small copies become **one big copy** of the same shape.'],
 ['↑ becomes →. What does → become?','↓',['↓','←','↑','→','a circle'],'The arrow turns **one quarter turn clockwise**. Right turns to down.'],
]);

const sequences=pack('nv-sequences','Non-verbal reasoning',[
 ['What comes next?\n● ■ ● ■ ● ___','■',['■','●','▲','★','○'],'The shapes **take turns**: circle, square, circle, square. A square comes next.'],
 ['What comes next?\n▲  ▲▲  ▲▲▲  ___','▲▲▲▲',['▲▲▲▲','▲▲','▲','■■■■','●●●●'],'One more triangle is added each time, so next is **four triangles**.'],
 ['What comes next?\n●● ■ ●● ■ ●● ___','■',['■','●●','●','▲','★'],'Two circles and a square **repeat**. After two circles comes a square.'],
 ['What comes next?\n▲ ▼ ▲ ▼ ___','▲',['▲','▼','■','●','★'],'The triangle **points up, then down**, and then repeats. Next it points up.'],
 ['What comes next?\n● ●● ●●● ___','●●●●',['●●●●','●●●','●●','■■■■','▲'],'One more circle is added each time, so next is **four circles**.'],
 ['What comes next?\n■ ▲ ● ■ ▲ ___','●',['●','■','▲','★','○'],'Square, triangle, circle, then the same three again. Next is a **circle**.'],
 ['What comes next?\n★ ★★ ★ ★★ ★ ___','★★',['★★','★','★★★','●','▲▲'],'One star, then two stars, and that pair repeats. Next is **two stars**.'],
 ['What comes next?\n○ ● ○ ● ___','○',['○','●','□','■','★'],'Empty circle, filled circle, and then it repeats. Next is an **empty circle**.'],
 ['What comes next?\n▲ ■ ▲▲ ■■ ___','▲▲▲',['▲▲▲','■■■','▲▲','■','●●●'],'The triangle count grows, and so does the square count, taking turns. After two squares come **three triangles**.'],
 ['What comes next?\n→ ↓ ← ___','↑',['↑','→','↓','←','●'],'The arrow turns **one quarter turn clockwise** each time: right, down, left, then up.'],
]);

export const islandYear2Questions:Question[]=[...nouns,...verbs,...clauses,...punct,...fiction,...synonyms,...antonyms,...definitions,...homographs,...oddWords,...place,...order,...rounding,...negatives,...romans,...mental,...science,...oddShapes,...groups,...pairs,...analogies,...sequences];
