import {explain} from './bank-kit';
import {ask,type Writer,type Reading} from './bank-english-kit';
// Non-fiction texts 1 and 2 (en-non-fiction): an information text about hedgehogs and a persuasive leaflet.
// Brambleford and its community garden are made up.

const hedgehogs:Reading={id:'en-read-hedgehogs',title:'Hedgehogs: Our Prickly Garden Visitors',byline:'An original information text written for Manor Quest',pages:[
`What is a hedgehog?

The hedgehog is a small wild mammal that lives across much of the United Kingdom, in woodland edges, hedgerows, parks and gardens. An adult is about 25 centimetres long and weighs about as much as a bag of sugar. Its back is covered in between 5,000 and 7,000 spines. Each spine is a stiff, hollow hair, made of the same material as your fingernails.

When a hedgehog feels threatened, it does not usually run away. Instead, it tucks in its head and legs and rolls into a tight ball, so that an enemy meets nothing but a crown of prickles.

Hedgehogs are nocturnal. They spend the day asleep in a nest of leaves and come out after dark to hunt for food. Their eyesight is poor, but their sense of smell is excellent, and they snuffle noisily as they search for beetles, caterpillars and earthworms. In one night, a hedgehog may travel as far as two kilometres.`,
`A hedgehog's year

In spring, hedgehogs wake up hungry after their long winter sleep. They have lost a lot of weight, so the first thing they do is eat.

Most babies, called hoglets, are born in early summer. A mother usually has four or five in a litter. The hoglets are born blind, and their first spines are soft and white. After about four weeks, they follow their mother out of the nest to learn how to find food, and soon after that they leave to live on their own.

In autumn, every hedgehog has one important job: to eat as much as possible. It needs to store enough fat to last through the winter.

When the weather turns cold, usually around November, the hedgehog builds a thick nest under a hedge, a shed or a pile of logs and begins to hibernate. Its heartbeat slows right down and its body becomes cold. It may stir once or twice, but it will not become fully active again until spring, which is why a warm, safe nest matters so much.`,
`How can you help?

Sadly, there are far fewer hedgehogs in Britain than there were fifty years ago. Many have lost their homes as hedges have been removed, and garden fences stop them from travelling between gardens to find food and mates. The good news is that almost anyone with a garden can help.

- Make a hedgehog highway. Cut a hole about 13 centimetres square at the bottom of your fence so that hedgehogs can pass from garden to garden.
- Leave a wild corner. A pile of logs or leaves makes a perfect place to shelter and hibernate.
- Put out a shallow dish of water and some meaty cat or dog food. Never give hedgehogs milk or bread: milk upsets their stomachs, and bread fills them up without giving them what they need.
- Check before you strim long grass or light a bonfire, in case a hedgehog is sleeping inside.

A hedgehog snuffling across the lawn is one of the most delightful sights of a summer evening. Why not make your garden a place where hedgehogs are welcome?`]};

const leaflet:Reading={id:'en-read-garden',title:'Help Us Grow!',byline:'An original leaflet written for Manor Quest',pages:[
`HELP US GROW!

Have you ever wished there was a green, peaceful place in the middle of Brambleford? Somewhere to watch the bees, pick an apple or simply sit in the sunshine?

There is. It is called Brambleford Community Garden, and it needs you.

Ten years ago, this corner of town was an empty car park covered in broken glass and litter. Today, it has been transformed. There are forty raised vegetable beds, a wildlife pond, a sensory garden full of lavender and mint, and an orchard of twelve apple trees. Local schools use it for outdoor lessons, and more than three hundred people visit every week.

All of this was built by volunteers: ordinary people who gave up a few hours of their time. But gardens never stop growing, and after a long, wet winter, ours is looking tired. That is why we are holding our Big Spring Clean-Up, and why we would love you to join us.`,
`THE BIG SPRING CLEAN-UP

When: Saturday 14 March, 10 am to 3 pm
Where: Brambleford Community Garden, Mill Lane (look for the green gate)

What will you do? Whatever you enjoy! There are jobs for every age and every ability:
- pulling weeds and digging over the vegetable beds
- planting seeds and young plants
- painting the tool shed (it is currently a rather sad shade of brown)
- building bug hotels from old bricks, sticks and pine cones
- making tea for the hard workers!

You do not need to be an expert. Our friendly team leaders will show you what to do, and all tools are provided. Just bring wellies or old shoes, gardening gloves if you have them, and clothes that you do not mind getting muddy.

Every volunteer will be given a free lunch of fresh bread and homemade soup, made with vegetables grown in the garden. Children under twelve are very welcome but must come with an adult.`,
`WHY IT MATTERS

Last spring, sixty volunteers planted more than two thousand bulbs in a single day. When they flowered, the whole garden glowed with yellow and purple. Could we do even better this year? With your help, we know we can.

The garden is not just a pretty place. It gives wildlife a home in the middle of a busy town. It gives families somewhere free to spend time together. For some of our visitors, it is the only garden they have.

"I live in a flat with no outside space," says Mr Adebayo, who has volunteered every Saturday for three years. "This garden is the best part of my week. I've made more friends here than anywhere else."

So don't just walk past the green gate. Step inside, roll up your sleeves and help us grow. Every weed pulled and every seed sown makes a difference.

To sign up, leave your name at the garden shed or ask at Brambleford Library.`]};

export function nonFictionA(w:Writer){
 // Hedgehogs
 ask(w,hedgehogs,0,{prompt:"What does 'nocturnal' mean?",answer:'active at night and asleep during the day',wrong:['covered in spines','living in hedges','unable to see'],rewardGroup:'quick',
  explanation:explain("The text says 'Hedgehogs are nocturnal.' and then explains: 'They spend the day asleep in a nest of leaves and come out after dark to hunt for food.'",'So nocturnal means **active at night and asleep during the day**.','- Hedgehogs do have spines and poor eyesight, but that is not what nocturnal means.')},
  'Hedgehogs are nocturnal.','They spend the day asleep in a nest of leaves and come out after dark to hunt for food.');
 ask(w,hedgehogs,0,{prompt:'The text says how far a hedgehog may travel in one night. At that rate, what is the furthest it could travel in one week?',answer:'14 kilometres',wrong:['7 kilometres','9 kilometres','2 kilometres'],
  explanation:explain("The text says 'In one night, a hedgehog may travel as far as two kilometres.'",'A week has 7 nights: 7 × 2 = **14 kilometres**.','- 7 kilometres would be only one kilometre a night.','- 9 comes from adding 7 + 2 instead of multiplying.')},
  'In one night, a hedgehog may travel as far as two kilometres.');
 ask(w,hedgehogs,0,{prompt:'What does a hedgehog usually do when it feels threatened?',answer:'It rolls into a tight ball.',wrong:['It runs away as fast as it can.','It climbs the nearest tree.','It hides underwater.'],rewardGroup:'quick',
  explanation:explain("The text says 'it does not usually run away'. Instead, it 'rolls into a tight ball', so an enemy meets only prickles.")},
  'it does not usually run away','rolls into a tight ball');
 ask(w,hedgehogs,1,{prompt:'Select the **two** facts about newborn hoglets that the text gives.',answer:['They are born blind.','Their first spines are soft and white.'],wrong:['They can find food by themselves straight away.','They are born in the middle of winter.','They weigh about as much as a bag of sugar.'],
  explanation:explain("The text says 'The hoglets are born blind, and their first spines are soft and white.'","- Hoglets only follow their mother out to find food 'After about four weeks'.",'- Most are born in early summer, not winter, and it is an adult hedgehog that weighs about as much as a bag of sugar.')},
  'The hoglets are born blind, and their first spines are soft and white.','After about four weeks');
 ask(w,hedgehogs,1,{prompt:'Why is it so important for hedgehogs to eat a lot in autumn?',answer:'They need to store enough fat to last through the winter.',wrong:['Food tastes better in autumn.','They need to grow new spines before spring.','They have to feed their hoglets all winter.'],
  explanation:explain("The text says 'It needs to store enough fat to last through the winter.' A hibernating hedgehog does not go out to find food, so it lives on the fat it has stored.",'- Nothing is said about food tasting better or spines growing, and hoglets are born in summer.')},
  'It needs to store enough fat to last through the winter.');
 ask(w,hedgehogs,2,{prompt:'According to the text, why should you never give hedgehogs milk?',answer:'It upsets their stomachs.',wrong:['It fills them up without giving them what they need.','It makes their spines go soft.','It attracts foxes into the garden.'],
  explanation:explain("The text says 'milk upsets their stomachs'.","- The text says 'bread fills them up without giving them what they need': that is the reason for bread, not milk.",'- Nothing is said about spines or foxes.')},
  'milk upsets their stomachs','bread fills them up without giving them what they need');
 ask(w,hedgehogs,2,{prompt:'Which sentence from the text is an **opinion**?',answer:'A hedgehog snuffling across the lawn is one of the most delightful sights of a summer evening.',wrong:['A mother usually has four or five in a litter.','Hedgehogs are nocturnal.','In one night, a hedgehog may travel as far as two kilometres.'],rewardGroup:'challenge',
  explanation:explain('A fact can be checked; an opinion is what someone thinks or feels.',"'A hedgehog snuffling across the lawn is one of the most delightful sights of a summer evening.' is the writer's feeling. Not everyone would agree, and it cannot be proved, so it is an **opinion**.",'- The other sentences are facts that scientists could check.')},
  'A hedgehog snuffling across the lawn is one of the most delightful sights of a summer evening.');
 ask(w,hedgehogs,2,{prompt:'What is the main purpose of the whole text?',answer:'to inform readers about hedgehogs and explain how to help them',wrong:['to tell a story about one particular hedgehog','to persuade readers to keep a hedgehog as a pet','to warn readers that hedgehogs are dangerous'],rewardGroup:'challenge',
  explanation:explain("The first two sections give facts about what hedgehogs are and how they live. The last section asks 'How can you help?' and says 'The good news is that almost anyone with a garden can help.'",'So the text **informs readers about hedgehogs and explains how to help them**.','- It is about hedgehogs in general, not one hedgehog, and it never suggests keeping one as a pet or says that they are dangerous.')},
  'How can you help?','The good news is that almost anyone with a garden can help.');

 // Help Us Grow!
 ask(w,leaflet,0,{prompt:'What is the main purpose of this leaflet?',answer:'to persuade people to volunteer at the garden',wrong:['to tell a story about a car park','to explain how to grow apples','to complain about litter in Brambleford'],
  explanation:explain("The leaflet describes how good the garden is, then says 'That is why we are holding our Big Spring Clean-Up, and why we would love you to join us.'",'Its purpose is to **persuade people to volunteer**.','- The car park is only mentioned to show how much the place has changed.','- It does not explain how to grow apples, and it is not a complaint.')},
  'That is why we are holding our Big Spring Clean-Up, and why we would love you to join us.');
 ask(w,leaflet,0,{prompt:'Which **two** persuasive techniques are used in the first sentence after the heading?',answer:['a rhetorical question',"addressing the reader as 'you'"],wrong:['a simile','a fact with a number','onomatopoeia'],rewardGroup:'challenge',
  explanation:explain("The sentence is 'Have you ever wished there was a green, peaceful place in the middle of Brambleford?'",'It is a **rhetorical question**: the writer does not expect an answer, but wants the reader to think yes. It also **addresses the reader as you**, which makes it feel personal.','- There is no comparison (simile), no number and no sound word (onomatopoeia) in this sentence.')},
  'Have you ever wished there was a green, peaceful place in the middle of Brambleford?');
 ask(w,leaflet,0,{prompt:"What does 'transformed' mean in the sentence 'Today, it has been transformed.'?",answer:'changed completely',wrong:['moved to a new place','made smaller','left empty'],
  explanation:explain("Ten years ago, the place was 'an empty car park covered in broken glass and litter'. Then the leaflet says 'Today, it has been transformed.' Now it has vegetable beds, a pond and an orchard.",'So transformed means **changed completely**.','- The garden is in the same place, it has not shrunk, and it is certainly not empty.')},
  'an empty car park covered in broken glass and litter','Today, it has been transformed.');
 ask(w,leaflet,1,{prompt:'The Clean-Up runs from 10 am to 3 pm. How long does it last?',answer:'5 hours',wrong:['7 hours','3 hours','13 hours'],
  explanation:explain("The leaflet says '10 am to 3 pm'. From 10 am to 12 noon is 2 hours, and from noon to 3 pm is 3 more hours: 2 + 3 = **5 hours**.",'- 7 hours comes from working out 10 − 3.','- 13 hours comes from adding 10 + 3.')},
  '10 am to 3 pm');
 ask(w,leaflet,1,{prompt:'Who must come with an adult?',answer:'children under twelve',wrong:['anyone who is not an expert','anyone bringing their own tools','all volunteers'],rewardGroup:'quick',
  explanation:explain("The leaflet says 'Children under twelve are very welcome but must come with an adult.'","- It also says 'You do not need to be an expert.', and tools are provided for everyone.")},
  'Children under twelve are very welcome but must come with an adult.','You do not need to be an expert.');
 ask(w,leaflet,1,{prompt:'Why does the leaflet mention the free lunch?',answer:'to encourage more people to come and help',wrong:['because the garden sells soup','to warn volunteers to bring money','because volunteers must bring their own food'],
  explanation:explain("The leaflet says 'Every volunteer will be given a free lunch'. A free meal is a reward that makes helping more attractive, so it **encourages more people to come and help**.",'- The lunch is free, so nobody needs to bring money or food, and nothing says the garden sells soup.')},
  'Every volunteer will be given a free lunch');
 ask(w,leaflet,2,{prompt:"'the whole garden glowed with yellow and purple'. What does the word 'glowed' suggest?",answer:'The flowers were so bright that the garden seemed to shine.',wrong:['The garden had electric lights.','The garden was on fire.','The flowers were warm to touch.'],
  explanation:explain("The leaflet says that when the bulbs flowered, 'the whole garden glowed with yellow and purple'.","'glowed' suggests the colours were **so bright that the garden seemed to shine**.",'- It does not mean real lights, fire or heat.')},
  'the whole garden glowed with yellow and purple');
 ask(w,leaflet,2,{prompt:'Why does the writer include the words of Mr Adebayo?',answer:'to show how much the garden means to a real volunteer',wrong:['to explain how to build a bug hotel','to tell readers where he lives','to show that volunteering is hard work'],rewardGroup:'challenge',
  explanation:explain("Mr Adebayo says, 'This garden is the best part of my week.' Hearing from a real volunteer makes the leaflet more persuasive: it shows **how much the garden means to the people who help**.",'- He does not explain bug hotels, and he only mentions his flat to show that he has no garden of his own.','- He talks about friends and enjoyment, not hard work.')},
  'This garden is the best part of my week.');
}
