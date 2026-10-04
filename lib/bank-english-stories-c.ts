import {explain} from './bank-kit';
import {ask,type Writer,type Reading} from './bank-english-kit';
// Fiction extract 5 (en-fiction): 'The Middle Start Line'. An original story written for Manor Quest.

const BY='An original story written for Manor Quest';

const run:Reading={id:'en-read-fun-run',title:'The Middle Start Line',byline:BY,pages:[
`Arun waited at the edge of the village green, bouncing from foot to foot. The fun run had three start lines: under sevens, eight to eleven, and twelve and over. Coach Patel checked a clipboard and smiled at him.

"You are with the middle group," he said. "You turned nine in January, so you stay there this year. Next summer you will be ten, and you will still not be with the big ones."

Arun tried to keep still. He had been awake since six, tying his trainers twice because the first bow looked uneven. His sister Lila, who was six, was already waving a paper flag with the under sevens.

Mum pressed a bottle into his hand. "Do not start before the whistle," she said. "And if a lace comes undone, stop and tie it. I will be by the oak tree at the finish."

Arun nodded, but his eyes stayed on the orange cones. He wanted that whistle now.`,
`The whistle blew, and the middle group set off across the grass. Arun kept a steady pace beside his friend Bea. At the first corner a boy in a red shirt shot ahead, then slowed, clutching his side.

"Stitch," Bea said. "He went off too fast."

Arun remembered Mum's words when his left lace slapped his ankle. He pulled over by a bench, knelt, and tied a double bow. Bea waited, jogging on the spot. Three runners passed them. Arun felt a hot prickle of worry, then shook it off.

"We can catch them on the hill," he said.

They did. The hill was short but steep, and the runners who had sprinted early were walking. Arun and Bea trotted past, saving a little speed for the flat path by the pond. A duck flapped out of the reeds and made them both laugh.`,
`The finish tape was yellow, stretched between two chairs by the oak tree. Arun could see Mum holding Lila up so she could watch. He and Bea crossed side by side, neither of them trying to beat the other.

Coach Patel clicked his stopwatch and grinned. "Sensible running," he said. "You tied that lace, and you still finished together. That is how a fun run should look."

Lila pushed a paper cup of water into Arun's hand. "I won my group," she announced. "Well, I finished. The flag is a bit torn."

Arun looked back at the middle start line, already empty. His legs ached and his face was damp, but he was grinning. Nine felt like exactly the right age to be, at least until next January.`]};

export function storiesC(w:Writer){
 ask(w,run,0,{prompt:'Where will Mum wait for Arun?',answer:'By the oak tree at the finish',wrong:['At the middle start line','On the hill','By the pond','With the under sevens'],rewardGroup:'quick',
  explanation:explain("Mum says, 'I will be by the oak tree at the finish.'",'So she will wait **by the oak tree at the finish**.','- The middle start line is where Arun begins. The hill and the pond come later in the run. Lila is with the under sevens, not Mum\'s waiting place.')},
  'I will be by the oak tree at the finish.');
 ask(w,run,0,{prompt:'Why does Arun tie his trainers a second time?',answer:'The first bow looked uneven.',wrong:['The lace had snapped.','Coach Patel told him to.','Bea asked him to wait.','The whistle had already blown.'],
  explanation:explain("Arun had been 'tying his trainers twice because the first bow looked uneven.'",'He ties them again so the bow sits properly.','- Nothing says the lace snapped, or that Coach Patel or Bea told him to retie it before the start. The whistle has not blown yet.')},
  'tying his trainers twice because the first bow looked uneven.');
 ask(w,run,0,{prompt:'Select the **two** instructions Mum gives Arun.',answer:['Do not start before the whistle.','Stop and tie a lace if it comes undone.'],wrong:['Sprint at the start.','Wait under the oak tree.','Wave the paper flag.'],
  explanation:explain("Mum says, 'Do not start before the whistle,' and, 'if a lace comes undone, stop and tie it.'",'Those are her **two** instructions.','- She will stand by the oak tree herself. She does not tell Arun to sprint, to wait there, or to wave the flag.')},
  'Do not start before the whistle','if a lace comes undone, stop and tie it.');
 ask(w,run,1,{prompt:'Why did the boy in the red shirt slow down?',answer:'He had gone off too fast and had a stitch.',wrong:['His lace had come undone.','He stopped to watch the duck.','Bea asked him to wait.','He had finished already.'],
  explanation:explain("The boy 'slowed, clutching his side.' Bea says, 'Stitch,' and 'He went off too fast.'",'So he slowed because he **had gone off too fast and had a stitch**.','- The loose lace and the duck belong to Arun and Bea, not to the boy in red.')},
  'He went off too fast.');
 ask(w,run,1,{prompt:"What does 'saving a little speed' suggest about Arun and Bea?",answer:'They kept some energy for later in the run.',wrong:['They stopped running and walked the rest.','They hid from the other runners.','They turned back to the start.','They raced each other to the pond.'],rewardGroup:'challenge',
  explanation:explain("The text says they were 'saving a little speed for the flat path by the pond' after trotting past people who were walking.",'**Saving a little speed** means they **kept some energy for later**, rather than using it all on the hill.','- They did not stop for good, hide, turn back, or race each other.')},
  'saving a little speed for the flat path by the pond');
 ask(w,run,2,{prompt:'Who does Arun finish with?',answer:'Bea',wrong:['Lila','Mum','Coach Patel','The boy in the red shirt'],rewardGroup:'quick',
  explanation:explain("The text says, 'He and Bea crossed side by side, neither of them trying to beat the other.'",'So Arun finishes with **Bea**.','- Mum and Lila are watching. Coach Patel is timing them. The boy in red is not with them at the tape.')},
  'He and Bea crossed side by side');
 ask(w,run,2,{prompt:'Which word best describes Coach Patel when Arun finishes?',answer:'Pleased',wrong:['Cross','Bored','Frightened','Jealous'],
  explanation:explain("Coach Patel 'grinned' and said, 'Sensible running,' and 'That is how a fun run should look.'",'A grin and that praise show he is **pleased**.','- Nothing suggests he is cross, bored, frightened or jealous.')},
  'Sensible running','That is how a fun run should look.');
 ask(w,run,2,{prompt:'What does Arun learn from the way he ran?',answer:'Steady running can still get you to the finish with a friend.',wrong:['Winning is the only thing that matters.','Sprinting from the start is always best.','He was too young to take part.','He should have left his lace undone.'],rewardGroup:'challenge',
  explanation:explain("Arun stopped to tie his lace, passed the early sprinters on the hill, and 'He and Bea crossed side by side'. He ends 'grinning'.",'The story shows that **steady running can still get you to the finish with a friend**.','- He does not treat winning as the only aim, and he does not regret tying the lace.')},
  'He and Bea crossed side by side','grinning');
}
