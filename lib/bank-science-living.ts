import type {Topic} from './bank-kit';
import type {KeyNode,Visual} from './visual';
import {mc,item,science,sorted,quick,challenge} from './bank-science-kit';
import {footprint,leaf,cycle,foodChain,flower,circulation,rockLayers,type PrintKind,type LeafKind} from './bank-science-draw';
// Science: living things — classification and keys, life cycles and habitats, the human body, evolution and inheritance.

const key=(root:KeyNode,alt:string):Visual=>({kind:'key',root,alt});

// ── Classification and keys ─────────────────────────────────────────────────────────────────────────────────
const MINI:KeyNode={q:'Does it have legs?',yes:{q:'Does it have more than six legs?',yes:{q:'Does it have eight legs?',yes:'Spider',no:'Woodlouse'},no:'Ladybird'},no:{q:'Does it have a shell?',yes:'Snail',no:'Earthworm'}};
const VERT:KeyNode={q:'Does it have feathers?',yes:'Bird',no:{q:'Does it have fur or hair?',yes:'Mammal',no:{q:'Does it have fins?',yes:'Fish',no:{q:'Does it have dry, scaly skin?',yes:'Reptile',no:'Amphibian'}}}};
const PRINTS:KeyNode={q:'Is it a hoof print?',yes:'Deer',no:{q:'Are the toes joined by webbing?',yes:'Duck',no:{q:'Can you see claw marks?',yes:{q:'Are there five toe marks?',yes:'Badger',no:'Fox'},no:'Cat'}}};
const LEAVES:KeyNode={q:'Is the leaf a thin needle?',yes:'Pine',no:{q:'Does the edge have sharp spikes?',yes:'Holly',no:{q:'Is it shaped like an open hand?',yes:'Sycamore',no:{q:'Does the edge have rounded lobes?',yes:'Oak',no:'Beech'}}}};
const POND:KeyNode={q:'Does it have a backbone?',yes:{q:'Does it have fins?',yes:'Stickleback',no:'Frog'},no:{q:'Does it have a shell?',yes:'Water snail',no:'Pond skater'}};
const miniKey=key(MINI,'A branching key for sorting five minibeasts'),vertKey=key(VERT,'A branching key for the five groups of vertebrates');
// What each drawn print or leaf shows, as answers to the key's questions.
const PRINT_FACTS:Record<PrintKind,Record<string,boolean>>={
 fox:{'Is it a hoof print?':false,'Are the toes joined by webbing?':false,'Can you see claw marks?':true,'Are there five toe marks?':false},
 badger:{'Is it a hoof print?':false,'Are the toes joined by webbing?':false,'Can you see claw marks?':true,'Are there five toe marks?':true},
 cat:{'Is it a hoof print?':false,'Are the toes joined by webbing?':false,'Can you see claw marks?':false},
 deer:{'Is it a hoof print?':true},
 duck:{'Is it a hoof print?':false,'Are the toes joined by webbing?':true}};
const LEAF_FACTS:Record<LeafKind,Record<string,boolean>>={
 oak:{'Is the leaf a thin needle?':false,'Does the edge have sharp spikes?':false,'Is it shaped like an open hand?':false,'Does the edge have rounded lobes?':true},
 sycamore:{'Is the leaf a thin needle?':false,'Does the edge have sharp spikes?':false,'Is it shaped like an open hand?':true},
 holly:{'Is the leaf a thin needle?':false,'Does the edge have sharp spikes?':true},
 beech:{'Is the leaf a thin needle?':false,'Does the edge have sharp spikes?':false,'Is it shaped like an open hand?':false,'Does the edge have rounded lobes?':false},
 pine:{'Is the leaf a thin needle?':true}};
const printChoices:PrintKind[]=['fox','badger','cat','deer'],leafChoices:LeafKind[]=['oak','sycamore','holly','beech'];

const classificationTopic:Topic={id:'sc-classification',subject:'Science',strand:'Living things',title:'Classification and keys',helpsheet:{
 intro:'Scientists sort living things into groups using features you can see, such as a backbone, legs, wings, fur or feathers. A branching key asks yes/no questions until only one name is left.',
 steps:['Start at the top question of the key.','Answer **yes** or **no** using only the features you are given or can see.','Follow that branch to the next question, and keep going until you reach a name.','Check by reading back up the key: every answer on your path should match the living thing.'],
 example:{title:'Using a key: pond animals',visual:key(POND,'A branching key for four pond animals'),lines:['Tilly finds a pond animal with a backbone but no fins.','Backbone? **Yes**. Fins? **No**. The key gives **frog**.']},
 tips:['Vertebrates have a backbone: fish, amphibians, reptiles, birds and mammals. Invertebrates, such as insects, spiders, snails and worms, do not.','Spiders are not insects: a spider has eight legs and a body in two parts.','Some animals look as if they belong to another group: a dolphin is a mammal, not a fish, and a seahorse is a fish.','Good key questions are about features everyone would agree on (legs, wings, a shell), not opinions such as "Is it pretty?".']}};

const classification=science(classificationTopic,[
 item(mc('Freya finds this minibeast under a log in the manor garden. Use the branching key to identify it.','Woodlouse',['Spider','Ladybird','Earthworm','Snail'],
  ['Legs? **Yes**. More than six legs? **Yes**, it has fourteen. Eight legs? **No**. The key ends at **woodlouse**.','A woodlouse is not an insect: it is a crustacean, a relative of crabs and shrimps.'],
  {stimulus:'It has fourteen legs and a hard grey body made of overlapping plates.',visual:miniKey}),
  {type:'key',facts:{'Does it have legs?':true,'Does it have more than six legs?':true,'Does it have eight legs?':false}}),
 item(mc('Which question in the key separates a **spider** from a **woodlouse**?','Does it have eight legs?',['Does it have more than six legs?','Does it have legs?','Does it have a shell?'],
  ['Spiders and woodlice both have legs, and both have more than six, so they follow the same path until **"Does it have eight legs?"**.','A spider has eight legs (yes); a woodlouse has fourteen (no).'],{visual:miniKey}),
  {type:'key-split',a:'Spider',b:'Woodlouse'}),
 item(mc('According to the key, which statement describes a **snail**?','It has no legs, and it has a shell.',['It has legs, and it has a shell.','It has no legs and no shell.','It has more than six legs.'],
  ['Follow the key back from **snail**: it is on the **no** branch of "Does it have legs?" and the **yes** branch of "Does it have a shell?".','An animal with no legs and no shell would be an earthworm.'],{visual:miniKey,...challenge}),
  {type:'key-claims',leaf:'Snail',claims:{
   'It has no legs, and it has a shell.':{'Does it have legs?':false,'Does it have a shell?':true},
   'It has legs, and it has a shell.':{'Does it have legs?':true,'Does it have a shell?':true},
   'It has no legs and no shell.':{'Does it have legs?':false,'Does it have a shell?':false},
   'It has more than six legs.':{'Does it have legs?':true,'Does it have more than six legs?':true}}}),
 item(mc('Use the key to find which group of vertebrates a **slow-worm** belongs to.','Reptile',['Amphibian','Fish','Mammal'],
  ['Feathers? **No**. Fur or hair? **No**. Fins? **No**. Dry, scaly skin? **Yes**, so it is a **reptile**.','Despite its name, a slow-worm is a legless lizard, not a worm or a snake.'],
  {stimulus:'A slow-worm has no legs, no fins, no fur and no feathers. Its skin is dry and covered in small, smooth scales.',visual:vertKey}),
  {type:'key',facts:{'Does it have feathers?':false,'Does it have fur or hair?':false,'Does it have fins?':false,'Does it have dry, scaly skin?':true}}),
 item(mc('Use the key to find which group of vertebrates a **penguin** belongs to.','Bird',['Fish','Mammal','Amphibian'],
  ['The first question settles it: a penguin has **feathers**, so it is a **bird**.','Birds are grouped by their feathers, not by flying. Penguins use their wings as flippers for swimming.'],
  {stimulus:'A penguin cannot fly. It swims using flipper-like wings, and its body is covered in short, waterproof feathers.',visual:vertKey}),
  {type:'key',facts:{'Does it have feathers?':true}}),
 item({...mc('Use the branching key to identify the animal tracks. Which print was made by a **fox**?','fox',['badger','cat','deer'],
  ['Follow the key to **fox**: not a hoof print, no webbing, claw marks **yes**, five toe marks **no**.','So a fox print has four toe marks, each with a claw mark. The badger print has five toes, and the cat print has no claw marks.']),
  visual:key(PRINTS,'A branching key for five animal tracks'),pictures:printChoices.map(k=>({key:k,visual:footprint(k)}))},
  {type:'key-pictures',target:'Fox',pictures:printChoices.map(k=>({visual:footprint(k),facts:PRINT_FACTS[k]}))}),
 item({...mc('Use the branching key. Which of these leaves comes from an **oak** tree?','oak',['sycamore','holly','beech'],
  ['Follow the key to **oak**: not a needle, no sharp spikes, not shaped like an open hand, and the edge **has rounded lobes**.','The sycamore leaf is shaped like a hand, the holly leaf has spikes and the beech leaf has a smooth edge.']),
  visual:key(LEAVES,'A branching key for five kinds of tree leaf'),pictures:leafChoices.map(k=>({key:k,visual:leaf(k)}))},
  {type:'key-pictures',target:'Oak',pictures:leafChoices.map(k=>({visual:leaf(k),facts:LEAF_FACTS[k]}))}),
 item(mc('Which of these animals is an **invertebrate**?','Garden snail',['Slow-worm','Frog','Robin','Hedgehog'],
  ['An invertebrate has **no backbone**. A garden snail has a soft body inside a shell, and no bones at all.','A slow-worm looks a little like a worm, but it is a reptile with a backbone, like the frog, robin and hedgehog.'],quick),
  {type:'category',yes:'invertebrate',no:['vertebrate']}),
 item(mc('A **bat** can fly. Which group of animals does it belong to?','Mammals',['Birds','Insects','Reptiles'],
  ['Bats have **fur**, give birth to live young and feed them on **milk**, so they are mammals.','Flying does not decide the group: animals from several groups can fly, including birds, insects and bats.']),
  {type:'group',animal:'bat',options:{Mammals:'mammal',Birds:'bird',Insects:'insect',Reptiles:'reptile'}}),
 item(mc('A whale lives in the sea and has flippers. Why do scientists classify it as a **mammal**, not a fish?','It breathes air with lungs and feeds its young on milk.',['It is much bigger than any fish, so it cannot be one.','It lives in the sea and swims with a powerful tail.','It has a backbone and a skeleton made of bone.'],
  ['Mammals breathe air using **lungs**, give birth to live young and feed them on **milk**. Whales do all three.','Fish also live in the sea and have backbones, so those facts cannot separate whales from fish, and size does not decide a group.'],challenge)),
 item(mc('Which feature do **all** insects have?','Six legs and three body parts',['Two pairs of wings','Eight legs and two body parts','Wings covered in tiny scales','A backbone'],
  ['Every adult insect has **six legs** and a body in **three parts**: head, thorax and abdomen.','Some insects, such as worker ants, have no wings at all. Eight legs and two body parts describe a spider.'],quick)),
 item(mc('Select the **two** animals that are **amphibians**.',['Frog','Newt'],['Lizard','Tortoise','Salmon'],
  ['Frogs and newts are **amphibians**: they have moist skin and usually lay their eggs in water.','Lizards and tortoises are reptiles with dry, scaly skin; a salmon is a fish.']),
  {type:'category',yes:'amphibian',no:['reptile','fish']}),
 item(mc('Which animal belongs in the box marked **?**','Butterfly',['Bat','Penguin','Spider','Slug'],
  ['The box is in the **has wings** row and the **no backbone** column, so it needs an invertebrate with wings.','A butterfly fits. Bats and penguins have wings but also backbones; spiders and slugs have no wings.'],
  {visual:{kind:'table',head:['','Has a backbone','No backbone'],rows:[['Has wings','Robin','?'],['No wings','Hedgehog','Earthworm']],alt:'A sorting table with two rows, two columns and one empty box'},...challenge}),
  {type:'carroll'}),
 item(mc('Which of these living things is a **fungus** rather than a plant?','Mushroom',['Moss','Fern','Grass','Ivy'],
  ['Fungi cannot make their own food using light as plants do. They feed on dead or living material.','Moss, ferns, grass and ivy are all plants: they are green and make their own food.']),
  {type:'category',yes:'fungus',no:['plant']}),
 item(mc('Which of these is a **micro-organism**?','Yeast',['Mushroom','Woodlouse','Moss','Ant'],
  ['Micro-organisms are living things too small to see without a microscope, such as **bacteria** and **yeast**.','Yeast is a tiny fungus used in baking. A mushroom is a fungus too, but it is easy to see without a microscope.'],quick),
  {type:'category',yes:'micro-organism',no:['visible']}),
 item(mc('Which question would work **best** in a branching key?','Does it have eight legs?',['Is it a pretty animal?','Is it a big animal?','Is it a friendly animal?'],
  ['A good key question is about a feature you can **observe**, so everyone gives the same yes or no answer.','"Pretty", "big" and "friendly" depend on opinion or comparison, so two people could answer differently.'])),
 item(mc('Mei sorted these invertebrates into two groups using one yes/no question. Which question did she use?','Does it have legs?',['Does it have wings?','Does it have a shell?','Does it have a backbone?'],
  ['Every animal in **Group 1** has legs, and none in **Group 2** does, so the question was "Does it have legs?".','None of these animals has a backbone, spiders and woodlice have no wings, and crabs and snails both have shells but are in different groups.'],
  {visual:{kind:'table',head:['Group 1','Group 2'],rows:[['spider','slug'],['woodlouse','earthworm'],['crab','snail'],['ant','leech']],alt:'Two groups of invertebrates in a table'},...challenge}),
  {type:'sort-question',groups:[['spider','woodlouse','crab','ant'],['slug','earthworm','snail','leech']],questions:{'Does it have legs?':'legs','Does it have wings?':'wings','Does it have a shell?':'shell','Does it have a backbone?':'backbone'}}),
]);

// ── Life cycles, reproduction and habitats ──────────────────────────────────────────────────────────────────
const flowerPicture=flower('A flower cut in half, with five parts labelled P to T'),FLOWER_LABELS={P:'petal',Q:'anther',R:'stigma',S:'ovary',T:'sepal'};
const livingTopic:Topic={id:'sc-living-things',subject:'Science',strand:'Living things',title:'Life cycles and habitats',helpsheet:{
 intro:'Every living thing has a life cycle: it begins life, grows, reproduces and dies. Different groups have different life cycles.',
 steps:['**Mammals**: most are born alive and fed on milk, then grow into adults.','**Birds**: an egg hatches into a chick, which grows into an adult.','**Amphibians** and many **insects** go through **metamorphosis**: their bodies change shape completely as they grow.','**Flowering plants**: a seed germinates and grows; its flowers are pollinated, fertilisation makes seeds, and the seeds are dispersed.'],
 example:{title:'A ladybird\'s life cycle',visual:cycle(['Egg','Larva','Pupa','Adult'],'A life cycle diagram with four stages'),lines:['A ladybird hatches from an **egg** as a **larva**, which eats and grows.','The larva becomes a **pupa**, and the adult ladybird comes out of it.']},
 tips:['Pollen has to reach a stigma before seeds can form.','Some plants can grow new plants from a part of themselves instead of from seeds. The new plant has only one parent.','Green plants make their own food; they do not eat it from the soil.','Micro-organisms are living things too small to see. Some are useful, for example in making yoghurt, and some cause illness.']}};

const living=science(livingTopic,[
 item(mc('The diagram shows the life cycle of a frog. What is the missing stage?','Froglet',['Pupa','Caterpillar','Nymph'],
  ['A frog\'s life cycle is **frogspawn → tadpole → froglet → adult frog**.','A froglet is a young frog with legs and part of a tail. A pupa, a caterpillar and a nymph are stages in the life cycles of insects.'],
  {visual:cycle(['Frogspawn','Tadpole','?','Adult frog'],'A life cycle diagram with four stages, one of them missing')}),
  {type:'cycle',kb:'frog'}),
 item(mc('Which list shows the life cycle of a butterfly in the right order?','egg → caterpillar → pupa → adult butterfly',['egg → pupa → caterpillar → adult butterfly','caterpillar → egg → pupa → adult butterfly','egg → caterpillar → adult butterfly → pupa'],
  ['A butterfly lays an **egg**, which hatches into a **caterpillar** (the larva). The caterpillar forms a **pupa** (chrysalis), and the adult butterfly comes out of it.','This big change of body shape is called **metamorphosis**.']),
  {type:'order',kb:'butterfly'}),
 item(mc('What is the main difference between the life cycles of **most mammals** and **birds**?','Most mammals give birth to live young, but birds lay eggs.',['Birds feed their young on milk, but mammals never do this.','Mammals go through metamorphosis, but birds do not.','Only mammals look after their young.'],
  ['Most mammal babies grow inside their mother and are **born alive**; bird chicks develop inside **eggs** with hard shells.','Mammals feed their young on milk, neither group goes through metamorphosis, and many birds care for their chicks.'])),
 item(mc('What is the name for moving **pollen** from an anther to a stigma?','Pollination',['Fertilisation','Germination','Seed dispersal'],
  ['**Pollination** is the transfer of pollen, usually by insects or the wind.','Fertilisation happens afterwards, when the male cell from the pollen joins an egg cell in the ovule. Germination is a seed starting to grow.'],quick)),
 item(mc('The diagram shows a flower cut in half. What is the part labelled **R**?','Stigma',['Anther','Ovary','Petal','Sepal'],
  ['Part R is the **stigma**: the sticky top of the female part of the flower, where pollen lands.','The anthers (Q) make pollen, the ovary (S) holds the ovules, the petals (P) attract insects and the sepals (T) protected the flower when it was a bud.'],
  {visual:flowerPicture}),
  {type:'labels',labels:FLOWER_LABELS,ask:'R'}),
 item(mc('After fertilisation, which labelled part of this flower grows into the **fruit**?','Part S',['Part P','Part Q','Part R','Part T'],
  ['The **ovary** (S) holds the ovules. After fertilisation, the ovules become seeds and the ovary grows into the fruit around them.','The petals (P) and anthers (Q) usually wither and fall off.'],
  {visual:flowerPicture,...sorted,...challenge}),
  {type:'labels',labels:FLOWER_LABELS,ask:'ovary'}),
 item(mc('A sycamore seed has a thin "wing" that makes it spin as it falls. How is the seed dispersed?','By the wind',['By animals eating the fruit','By floating on water','By the pod bursting open','By hooks catching on fur'],
  ['The wing makes the seed spin and fall slowly, so the **wind** can carry it away from the parent tree.','Seeds that land away from their parent do not have to compete with it for light, water and space.'])),
 item(mc('Maya\'s grandad grows new strawberry plants from the **runners** of one plant. Which statement about the new plants is true?','They grow from just one parent plant, without pollination.',['They grow from seeds made after the flowers were pollinated.','They need two parent plants.','They are a different kind of plant from the parent.'],
  ['Runners are stems that grow along the ground and root to make new plants. This is **asexual reproduction**: there is only **one parent**, and no pollination or seeds.','The new plants are identical copies of the parent plant.'],challenge)),
 item(mc('Select the **two** ways a plant can make new plants **without** seeds.',['Growing new bulbs','Sending out runners'],['Being pollinated by bees','Scattering seeds in the wind','Growing fruit that birds eat'],
  ['Daffodils grow new **bulbs**, and strawberry plants send out **runners**. Both make new plants from one parent, with no seeds.','Pollination, scattering seeds and growing fruit are all part of making and spreading seeds.'])),
 item(mc('Which is an example of a micro-organism being **useful** to people?','Yeast making bread dough rise',['Bacteria causing tooth decay','A virus causing a cold','Mould spoiling a loaf of bread'],
  ['**Yeast** feeds on sugar in the dough and gives off carbon dioxide gas. The bubbles make the bread rise.','Tooth decay, colds and mouldy bread are harmful or unwanted effects of micro-organisms.'])),
 item(mc('Dead leaves on the floor of the manor wood slowly rot away. What breaks them down?','Micro-organisms such as bacteria and fungi',['Sunlight bleaching them until they vanish','Rain slowly dissolving them into the soil','The wind blowing them away as fine dust'],
  ['**Decomposers** such as bacteria and fungi feed on dead material and break it down.','This returns nutrients to the soil for new plants to use.'])),
 item(mc('Which living thing in this food chain is the **producer**?','Grass',['Rabbit','Fox','The Sun'],
  ['A **producer** makes its own food using light. In most food chains the producer is a green plant.','The Sun gives the energy, but it is not a living thing. The rabbit and the fox are consumers.'],
  {visual:foodChain(['Grass','Rabbit','Fox'],'A food chain of three living things joined by arrows'),...quick}),
  {type:'chain',ask:'producer'}),
 item(mc('In this pond food chain, which animal is both a **predator** and **prey**?','Stickleback',['Heron','Tadpole','Pondweed'],
  ['The stickleback **eats tadpoles**, so it is a predator, and **is eaten by herons**, so it is prey.','The tadpole eats pondweed, a plant, so it is not a predator here. Nothing in this chain eats the heron.'],
  {visual:foodChain(['Pondweed','Tadpole','Stickleback','Heron'],'A pond food chain of four living things joined by arrows'),...challenge}),
  {type:'chain',ask:'predator and prey'}),
 item(mc('Where does a plant get its **food** from?','It makes its own food in its leaves, using light, air and water.',['It takes in ready-made food from the soil through its roots.','It soaks up food that falls onto its leaves in rainwater.','It catches insects and digests them to get all its food.'],
  ['Plants **make their own food** in their leaves, using energy from light, carbon dioxide from the air and water from the soil.','Roots take in water and minerals, but minerals are not food. A few plants, such as the Venus flytrap, catch insects, but they still make their food in their leaves.'])),
 item(mc('Select the **two** main jobs of a plant\'s roots.',['Taking in water and minerals from the soil','Holding the plant firmly in the ground'],['Making food using sunlight','Making pollen','Attracting insects'],
  ['Roots **anchor** the plant and **take in water and minerals**.','Leaves make food; flowers make pollen and attract insects.'])),
 item(mc('Which of these animals goes through **metamorphosis** as it grows?','A frog',['A chicken','A rabbit','A snake','A tortoise'],
  ['**Metamorphosis** is a big change in body shape during a life cycle: a tadpole with gills and a tail changes into a frog with lungs and legs.','A snake sheds its skin as it grows, but its body keeps the same shape.'],quick),
  {type:'category',yes:'metamorphosis',no:['no metamorphosis']}),
 item(mc('Which list gives the stages of a flowering plant\'s life cycle in order?','germination → pollination → fertilisation → seed dispersal',['germination → fertilisation → pollination → seed dispersal','pollination → germination → fertilisation → seed dispersal','germination → seed dispersal → pollination → fertilisation'],
  ['A seed **germinates** and grows into a plant. When it flowers it is **pollinated**, then **fertilisation** makes seeds, and the seeds are **dispersed**.','Pollination must come before fertilisation: pollen has to reach the stigma first.']),
  {type:'order',kb:'plant'}),
]);

// ── The human body ──────────────────────────────────────────────────────────────────────────────────────────
const bodyTopic:Topic={id:'sc-human-body',subject:'Science',strand:'Living things',title:'The human body',helpsheet:{
 intro:'Your heart pumps blood through blood vessels to every part of your body. Blood carries oxygen, water and nutrients to your cells and takes waste, such as carbon dioxide, away.',
 steps:['The **heart** is a muscle that pumps blood.','**Arteries** carry blood away from the heart; **veins** carry blood back to it.','**Capillaries** are tiny vessels where oxygen and nutrients pass into the body\'s cells.','Blood goes to the **lungs** to collect oxygen and get rid of carbon dioxide, then back to the heart to be pumped round the body.'],
 example:{title:'One trip round the body',lines:['Heart → artery → capillaries in a leg muscle (oxygen and nutrients pass into the muscle) → vein → back to the heart.','Then the heart pumps the blood to the lungs to collect more oxygen.']},
 tips:['**A**rteries carry blood **a**way from the heart.','Blood is always red. Veins only look blue through your skin.','A balanced diet has carbohydrates, protein, fats, vitamins and minerals, fibre and water.','Drugs change how the body works. Some are medicines; others, such as the nicotine in cigarettes and the alcohol in drinks, can damage the body.']}};

const body=science(bodyTopic,[
 item(mc('Which organ pumps blood around the body?','Heart',['Lungs','Brain','Stomach','Liver'],
  ['The **heart** is a muscle that squeezes over and over to pump blood through the blood vessels.','The lungs take in oxygen, but they do not pump blood.'],quick)),
 item(mc('Which blood vessels carry blood **away from** the heart?','Arteries',['Veins','Capillaries','Nerves'],
  ['**Arteries** carry blood **a**way from the heart. Veins bring blood back to it.','Capillaries are tiny vessels that join arteries to veins. Nerves carry messages, not blood.'])),
 item(mc('What is the job of the **capillaries**?','To let oxygen and nutrients pass into the body\'s cells',['To pump blood all the way around the body','To carry messages from the body to the brain','To make new blood cells when the body needs them'],
  ['Capillaries are tiny blood vessels with very thin walls, so **oxygen and nutrients** can pass through into the cells, and waste such as carbon dioxide can pass back.','The heart does the pumping, nerves carry messages, and new blood cells are made inside bones.'])),
 item(mc('Blood travels between the heart, the lungs and the rest of the body. Select the **two** arrows that show blood that is rich in **oxygen**.',['Arrow Q','Arrow R'],['Arrow P','Arrow S'],
  ['Blood picks up oxygen in the **lungs**. It returns to the heart (Q), and the heart pumps it out to the body (R).','The body\'s cells use up oxygen, so blood coming back from the body (S) and going to the lungs (P) has less oxygen.'],
  {visual:circulation('Boxes for the lungs, heart and body joined by four arrows labelled P, Q, R and S'),...sorted,...challenge}),
  {type:'circulation',arrows:{P:['heart','lungs'],Q:['lungs','heart'],R:['heart','body'],S:['body','heart']}}),
 item(mc('Nutrients from digested food pass into the blood. In which organ does most of this happen?','Small intestine',['Stomach','Large intestine','Oesophagus','Heart'],
  ['The **small intestine** is long, with a huge inner surface, so nutrients soak into the blood there.','The blood then carries the nutrients all round the body. The large intestine mainly takes water back from what is left.'])),
 item(mc('The bar chart shows Ravi\'s pulse rate after different activities. What does it show?','The harder the exercise, the higher the pulse rate.',['The harder the exercise, the lower the pulse rate.','Walking raised the pulse rate more than jogging did.','Exercise did not change the pulse rate.'],
  ['The bars get taller from resting to walking to jogging to sprinting: **harder exercise, higher pulse rate**.','Harder exercise makes the muscles need more oxygen, so the heart beats faster.'],
  {visual:{kind:'chart',type:'bar',title:'Ravi\'s pulse rate',x:'Activity',y:'Beats per minute',labels:['Resting','Walking','Jogging','Sprinting'],values:[72,96,128,164],max:180,step:20,alt:'A bar chart of pulse rate for four activities'}}),
  {type:'trend',dir:'up'}),
 item(mc('Why does your heart beat faster when you exercise?','Your muscles need more oxygen, so blood must be pumped round faster.',['Your heart needs to push food into your stomach faster.','Your heart gets colder during exercise, so it must work harder.','Your lungs stop working, so the heart takes over breathing.'],
  ['Working muscles use more **oxygen** and nutrients to release energy, and they make more carbon dioxide.','The heart beats faster and harder to deliver more blood, and you breathe faster to take in more oxygen.'])),
 item(mc('Which nutrient does the body mainly need for **growth and repair**?','Protein',['Carbohydrate','Fibre','Fat'],
  ['**Protein**, in foods such as fish, eggs, beans and meat, is used to build and repair muscles and other parts of the body.','Carbohydrates and fats mainly give energy; fibre helps food move through the gut.'],quick)),
 item(mc('Why do we need **fibre** in our diet?','It helps food move through the digestive system.',['It gives us most of the energy we need each day.','It builds strong muscles and repairs the body.','It carries oxygen around the body in the blood.'],
  ['**Fibre**, from foods such as wholemeal bread, vegetables and fruit, keeps food moving through the intestines.','Carbohydrates and fats give us energy, protein builds muscle, and red blood cells carry oxygen.'])),
 item(mc('Which of these is a harmful effect of **smoking** on the body?','It damages the lungs, so it is harder to take in oxygen.',['It makes the heart muscle stronger and healthier.','It helps clean dust and germs out of the lungs.','It helps the lungs take in more oxygen.'],
  ['Tobacco smoke contains harmful chemicals and tar that **damage the lungs** and make the heart and blood vessels work harder.','This makes it harder to take in oxygen and raises the risk of serious diseases.'])),
 item(mc('Which statement about **medicines** is true?','Medicines are drugs, and must be taken exactly as the label or a doctor says.',['Medicines are not drugs, so they are always safe to take.','Taking extra medicine always makes you get better much more quickly.','It is safe to share your medicine with any friend who feels ill.'],
  ['A **drug** is any substance that changes the way the body works. Medicines are helpful drugs when they are used correctly.','Too much medicine, or someone else\'s medicine, can harm you. Only take medicine from a trusted adult and follow the instructions.'])),
 item(mc('Which of these is NOT a job of the skeleton?','Pumping blood around the body',['Supporting the body','Protecting organs such as the brain','Helping the body to move'],
  ['The skeleton **supports** the body, **protects** organs (the skull protects the brain; the ribs protect the heart and lungs) and works with muscles to **move** us.','Pumping blood is the job of the heart, which is a muscle, not a bone.'],quick)),
 item(mc('Muscles can only **pull**, not push. Your biceps bends your arm. How does your arm straighten again?','The triceps at the back of the arm contracts and pulls it straight.',['The biceps pushes the lower arm back down to straighten it.','The bones push against each other to straighten the arm.','The biceps contracts a second time and pulls the arm straight.'],
  ['Muscles work in **pairs**. When the biceps contracts, the arm bends; when the **triceps** contracts, the arm straightens.','While one muscle of a pair contracts, the other relaxes.'],challenge)),
 item(mc('Which type of tooth is best for **tearing** food?','Canine',['Incisor','Molar','Premolar'],
  ['**Canines** are pointed teeth for gripping and tearing.','Incisors at the front cut and bite; premolars and molars at the back grind and crush food.'],quick)),
 item(mc('Which list shows the order in which food passes through the digestive system?','mouth → oesophagus → stomach → small intestine → large intestine',['mouth → stomach → oesophagus → small intestine → large intestine','mouth → oesophagus → stomach → large intestine → small intestine','mouth → oesophagus → small intestine → stomach → large intestine'],
  ['Food is chewed in the **mouth**, swallowed down the **oesophagus** and churned in the **stomach**. Nutrients are absorbed in the **small intestine**.','Water is taken back in the **large intestine**, and the waste leaves the body.']),
  {type:'order',kb:'digestion'}),
 item(mc('Four children measured their pulse at rest and straight after two minutes of skipping. Whose pulse rate **increased** the most?','Chloe',['Ben','Amara','Dev'],
  ['Work out each increase: Amara 118 − 72 = **46**, Ben 126 − 84 = **42**, Chloe 120 − 64 = **56**, Dev 112 − 76 = **36**.','Chloe\'s went up the most. Ben had the highest pulse after skipping, but he also started highest.'],
  {visual:{kind:'table',head:['Name','Pulse at rest','Pulse after skipping'],rows:[['Amara','72','118'],['Ben','84','126'],['Chloe','64','120'],['Dev','76','112']],caption:'Pulse rate in beats per minute',alt:'A table of four children\'s pulse rates before and after skipping'},...challenge}),
  {type:'table-maxdiff',cols:[1,2]}),
 item(mc('Select the **two** changes that happen to your body while you exercise hard.',['Your breathing rate goes up.','Your heart rate goes up.'],['Your body temperature falls.','Your pulse slows down.','You stop sweating.'],
  ['During hard exercise you **breathe faster** to take in more oxygen, and your **heart beats faster** to carry it to your muscles.','You also get warmer and sweat more to help you cool down.'])),
]);

// ── Evolution and inheritance ───────────────────────────────────────────────────────────────────────────────
const evolutionTopic:Topic={id:'sc-evolution',subject:'Science',strand:'Living things',title:'Evolution and inheritance',helpsheet:{
 intro:'Living things produce young of the same kind, but the young are not identical. Over many generations, features that help living things survive become more common. This slow change is **evolution**.',
 steps:['**Variation**: offspring get a mix of features from their parents, so they differ from each other.','**Competition**: there is not enough food, space and shelter for all of them.','**Survival**: those with the most helpful features are more likely to survive and have young.','**Inheritance**: they pass the helpful features on to their offspring.','Over thousands or millions of years, the species changes.'],
 example:{title:'Hares on snowy hills',lines:['In a snowy place, hares with whiter winter fur are harder for foxes and eagles to spot.','More of the white hares survive to breed and pass on their fur colour, so over many generations most hares there turn white in winter.']},
 tips:['Animals cannot choose to change. Changes happen over many generations, not in one animal\'s lifetime.','Features gained during life, such as strong muscles from training or dyed hair, are not passed on to offspring.','Fossils are the remains or traces of living things preserved in rock, usually over millions of years.','An adaptation is a feature that helps a living thing survive in its habitat.']}};

const evolution=science(evolutionTopic,[
 item(mc('Which list shows, in order, how the fossil of an animal\'s bones usually forms?','dies → buried in sediment → hard parts slowly turn to stone → rock above wears away',['buried in sediment → dies → hard parts slowly turn to stone → rock above wears away','dies → hard parts slowly turn to stone → buried in sediment → rock above wears away','dies → buried in sediment → rock above wears away → hard parts slowly turn to stone'],
  ['An animal **dies** and is **buried** by mud or sand (sediment). Over a very long time, minerals from water in the sediment slowly **turn its hard parts to stone**.','Much later, the rock above **wears away** and the fossil can be found.']),
  {type:'order',kb:'fossil'}),
 item(mc('Why are fossils of soft-bodied animals, such as jellyfish, very rare?','Soft parts usually rot away before they can be preserved in rock.',['Jellyfish did not live on Earth until a few hundred years ago.','Soft animals are too light to sink into the mud and be buried.','Rain washes soft fossils away as soon as they have formed in rock.'],
  ['Fossils usually form from **hard parts** such as bones, teeth and shells, which last long enough to be buried and turned to rock.','Soft bodies are normally eaten or **decay** first, so only rare, special conditions preserve them.'],challenge)),
 item(mc('What can fossils tell scientists?','What living things were like long ago, and how they have changed',['Exactly what colour every dinosaur was, and how each one sounded','How living things will change over the next million years','That living things today are just the same as long ago'],
  ['Fossils show the **shapes of living things** that lived millions of years ago, many of which are now **extinct**.','Comparing fossils of different ages shows that living things have **changed over time**.'])),
 item(mc('**Mary Anning** was a famous fossil hunter. What is she best known for?','Finding fossils of ancient sea reptiles on the Dorset coast',['Sailing to the Galápagos Islands to study finches and tortoises','Working out how electricity flows round circuits','Proving that the Earth moves around the Sun in a year'],
  ['About 200 years ago, Mary Anning found fossils of **ichthyosaurs** and **plesiosaurs** near Lyme Regis.','Her finds helped show that animals had lived and become extinct long before humans existed.'],quick)),
 item(mc('Finches on different Galápagos islands have different beak shapes. Charles Darwin studied these birds. What is the best explanation for the differences?','Each beak suited the food on its island, so those birds survived to breed.',['The birds stretched their beaks by trying very hard to reach food.','The beaks were bent into new shapes by fights between the birds.','The finches chose to grow new beaks when their usual food changed.'],
  ['On each island, finches whose beaks suited the local food, such as seeds, insects or cactus, were more likely to **survive and pass on** their beak shape.','Over many generations this **natural selection** changed the finches. A bird cannot change its own beak by trying.'],challenge)),
 item(mc('Two kittens from the same litter look different. What is the best explanation?','Each kitten gets a different mix of features from its two parents.',['Only the mother passes on features, and she chose different ones.','Kittens copy the look of the animals around them.','The kitten born first always looks most like its father.'],
  ['Offspring **inherit** a mix of features from **both** parents, and the mix is different each time.','This is why offspring **vary**: brothers and sisters are similar, but not identical.'])),
 item(mc('Which of these features is **inherited** from your parents?','Natural eye colour',['A scar on the knee','Being able to ride a bike','A short haircut','A suntan'],
  ['**Inherited** features are passed on from parents, such as natural eye colour or blood group.','Scars, skills, haircuts and suntans come from your life and surroundings, so they are **environmental** and cannot be passed on.'],quick),
  {type:'category',yes:'inherited',no:['environmental']}),
 item(mc('Select the **two** features that are caused by the **environment**, not inherited.',['A scar from a fall','Being able to speak French'],['Blood group','Natural hair colour','Eye colour'],
  ['A scar comes from an injury, and a language is learned, so both come from the **environment**.','Blood group, natural hair colour and eye colour are **inherited** from parents.']),
  {type:'category',yes:'environmental',no:['inherited']}),
 item(mc('How does a camel\'s hump help it survive in the desert?','It stores fat, which gives the camel energy when food is scarce.',['It stores water, which the camel drinks when there is none.','It is full of sand, which keeps the camel cool in the heat.','It lifts the camel higher so it can see over the sand dunes.'],
  ['A camel\'s hump is a store of **fat**, not water.','When food is hard to find, the camel\'s body can use this fat for energy.'])),
 item(mc('Which features help a polar bear to survive in the freezing Arctic?','A thick layer of fat and thick fur',['Large ears to lose heat','Thin fur to stay cool','Long, thin legs for running on sand'],
  ['A thick layer of **fat** (blubber) and thick **fur** trap heat, so the bear stays warm in icy water and snow.','Large ears and thin fur help animals in hot places lose heat, such as the fennec fox in the desert.'])),
 item(mc('Cacti grow in hot, dry deserts. Why do they have spines instead of broad, flat leaves?','Spines lose less water than leaves and protect the cactus from animals.',['Spines take in much more sunlight than broad, flat leaves can.','Spines make the cactus grow much faster than other plants.','Spines take in more carbon dioxide from the air than leaves do.'],
  ['Plants lose water through their leaves. Thin **spines** have a tiny surface, so the cactus **saves water**.','Sharp spines also stop thirsty animals eating the juicy stem, which **stores water**.'])),
 item(mc('Grey beetles and green beetles live on the grey stone walls of the manor. Birds eat the beetles they can spot easily. What will probably happen over many generations?','Grey beetles will become more common, because more of them survive to breed.',['Green beetles will turn grey so that they can hide.','Green beetles will become more common, because birds prefer grey ones.','Both colours will stay just as common as each other.'],
  ['Green beetles stand out on grey stone, so birds eat more of them. More **grey** beetles survive, breed and **pass on** their colour.','Over many generations grey beetles become more common. This is **natural selection**: no beetle can change its own colour.'],challenge)),
 item(mc('What is **evolution**?','The slow change in living things over many generations',['An animal changing its body during its own lifetime','A caterpillar changing into a butterfly inside its pupa','Animals travelling to a warmer habitat for the winter'],
  ['**Evolution** is the change in living things over a very long time, as helpful inherited features become more common.','A caterpillar becoming a butterfly is **metamorphosis**, and moving for the winter is **migration**.'])),
 item(mc('A dog has a litter of puppies. Which statement is true?','The puppies will be dogs, but not identical to their parents.',['The puppies will be identical to their mother.','The puppies might grow into a different kind of animal.','All the puppies will be identical to each other.'],
  ['Living things produce offspring of the **same kind**, so puppies grow into dogs.','But offspring **vary**: each puppy inherits a different mix of features, so they are not identical.'],quick)),
 item(mc('The diagram shows layers of sedimentary rock with fossils in them. The layers have not been moved or folded. Which layer formed **first**?','Layer S',['Layer P','Layer Q','Layer R'],
  ['Sediment settles in layers, and each new layer settles **on top** of the older ones.','So the **lowest** layer, S, formed first, and its fossils are the oldest.'],
  {visual:rockLayers('Four layers of rock labelled P at the top to S at the bottom, with fossils in them'),...sorted,...challenge}),
  {type:'layers'}),
 item(mc('Water lilies have large, flat leaves that float on the surface of ponds. How does this help the plant?','The leaves can catch plenty of sunlight at the surface.',['The leaves soak up minerals from the mud at the bottom.','The leaves keep fish away from the plant.','The leaves stop the pond from freezing.'],
  ['Plants need **light** to make food. Deep water is dim, so floating leaves reach the **bright surface**.','Being wide and flat, they catch lots of light.'])),
 item(mc('Kofi takes two cuttings from the same geranium plant. He grows one on a sunny windowsill and one in a dark corner. The one in the dark grows pale and weak. What is the best explanation?','The cuttings are identical, so the difference comes from their surroundings.',['The second cutting must have inherited weakness from the parent plant.','Plants in dark places always grow stronger than those in light.','The two cuttings must have come from different kinds of plant.'],
  ['Cuttings from one plant are **identical copies** of it, so they inherited exactly the same features.','The difference must come from the **environment**: the plant in the dark could not get enough light to make its food.'])),
]);

export const livingParts=[classification,living,body,evolution];
