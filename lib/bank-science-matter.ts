import type {Topic} from './bank-kit';
import type {KeyNode} from './visual';
import {mc,item,science,sorted,quick,challenge} from './bank-science-kit';
import {filterKit,waterCycle,statesDiagram} from './bank-science-draw';
// Science: chemistry — properties and changes of materials, and states of matter with the water cycle.

// ── Materials ───────────────────────────────────────────────────────────────────────────────────────────────
const MATERIALS:KeyNode={q:'Is it attracted to a magnet?',yes:'Iron',no:{q:'Does it conduct electricity?',yes:'Aluminium',no:{q:'Is it transparent?',yes:'Glass',no:{q:'Is it stretchy?',yes:'Rubber',no:'Wood'}}}};

const materialsTopic:Topic={id:'sc-materials',subject:'Science',strand:'Chemistry',title:'Materials and changes',helpsheet:{
 intro:'Materials have **properties**, such as being hard, flexible, transparent, magnetic, soluble or a good conductor. We choose materials whose properties suit the job, and we can use the properties to separate mixtures.',
 steps:['**Sieving** separates solids with different-sized pieces.','**Filtering** separates an insoluble solid, such as sand, from a liquid.','**Evaporating** gets a dissolved solid, such as salt, back from a solution.','A **magnet** pulls out pieces of iron or steel.','Changes of state and dissolving are **reversible**. Burning, cooking and rusting make **new materials** and are usually **irreversible**.'],
 example:{title:'Separating rice, chalk and water',lines:['Pour the mixture through a **sieve**: the rice stays behind.','Pour what is left through **filter paper**: the chalk stays on the paper and the water drips through.']},
 tips:['Dissolving is not melting. Dissolved coffee is still there, spread through the water: you can taste it.','Filtering cannot remove something that has dissolved. Evaporate the water to get it back.','When a solid dissolves, no mass is lost: 10 g of salt in 100 g of water makes 110 g of salt water.','Signs that a new material may have been made include fizzing, a new colour or a new smell.']}};

const materials=science(materialsTopic,[
 item(mc('Tilly stirs sugar into warm tea until she cannot see it. Where has the sugar gone?','It is still there, spread out through the tea.',['It has melted and turned into more liquid water.','It has disappeared completely and no longer exists.','It has evaporated into the air as steam.'],
  ['The sugar has **dissolved**: it has broken up into pieces too small to see, spread through the tea to make a **solution**.','You can still taste it, and if the water evaporated the sugar would be left behind.'])),
 item(mc('How could Leo get the salt back from salty water?','Leave the water to evaporate.',['Pour it through filter paper.','Pour it through a sieve.','Stir a magnet through it.'],
  ['When the water **evaporates**, the dissolved salt is left behind as crystals.','Filter paper and sieves cannot catch salt once it has dissolved, and salt is not magnetic.'])),
 item(mc('Which mixture could be separated using this equipment?','Sand and water',['Salt and water','Sugar and water','Iron filings and sand'],
  ['**Filtering** catches **insoluble** solids such as sand, while the water drips through the paper.','Salt and sugar dissolve, so they pass through the filter paper with the water. Iron filings and sand would both stay on the paper together.'],
  {visual:filterKit('A funnel lined with filter paper above a beaker')})),
 item(mc('Select the **two** reversible changes.',['Melting chocolate','Dissolving salt in water'],['Baking a cake','Burning a match','Frying an egg'],
  ['Melted chocolate sets again when it cools, and dissolved salt can be got back by evaporating the water, so both are **reversible**.','Baking, burning and frying make **new materials**, so they cannot be reversed.']),
  {type:'category',yes:'reversible',no:['irreversible']}),
 item(mc('When bicarbonate of soda is added to vinegar, the mixture fizzes. What does the fizzing show?','A new material, a gas, is being made, so the change is irreversible.',['The vinegar is boiling because it has got very hot.','The bicarbonate of soda is melting as it mixes with the vinegar.','Air that was trapped inside the powder is escaping as bubbles.'],
  ['The bubbles are **carbon dioxide**, a **new material** made when the two substances react.','A change that makes new materials is usually **irreversible**.'])),
 item(mc('Why are saucepans usually made of metal, with plastic or wooden handles?','Metal conducts heat to the food, and plastic and wood are insulators that stay cool.',['Metal is a thermal insulator that keeps the food warm, and plastic conducts heat.','Plastic and wood are stronger than metal, so they are used for the handles.','Metal is transparent, so you can see the food cooking inside the pan.'],
  ['Metals are good **thermal conductors**, so heat passes quickly from the hob to the food.','Plastic and wood are **thermal insulators**, so heat passes through them slowly and the handle is safe to hold.'])),
 item(mc('Zain wrapped cups of hot water in different materials and measured the temperature after 20 minutes. Every cup started at 80 °C. Which material was the best thermal insulator?','Wool',['Foil','Newspaper','Bubble wrap'],
  ['The best **thermal insulator** keeps the heat in, so its water stays **hottest**.','The water in the wool-wrapped cup was still 68 °C, the highest temperature.'],
  {visual:{kind:'table',head:['Material','Temperature after 20 minutes (°C)'],rows:[['No wrapping','50'],['Foil','52'],['Wool','68'],['Newspaper','61'],['Bubble wrap','65']],alt:'A results table of wrapping materials and water temperature after 20 minutes'}}),
  {type:'table-max',col:1,skip:['No wrapping']}),
 item(mc('Arjun tests a material. Use the branching key to identify it.','Rubber',['Wood','Glass','Aluminium','Iron'],
  ['Magnetic? **No**. Conducts electricity? **No**. Transparent? **No**. Stretchy? **Yes**, so the key gives **rubber**.','Rubber is stretchy and an electrical insulator, which makes it useful for bands and cable covers.'],
  {stimulus:'It is not attracted to a magnet and does not conduct electricity. You cannot see through it, and it stretches when pulled.',visual:{kind:'key',root:MATERIALS,alt:'A branching key for five materials'}}),
  {type:'key',facts:{'Is it attracted to a magnet?':false,'Does it conduct electricity?':false,'Is it transparent?':false,'Is it stretchy?':true}}),
 item(mc('Which is the quickest way to separate iron filings from sand?','Use a magnet',['Pour them through a sieve','Filter them through paper','Add water and let it evaporate'],
  ['Iron is **magnetic** and sand is not, so a magnet pulls the iron filings out.','Iron filings and sand grains are a similar size, so a sieve would not separate them.'],quick)),
 item(mc('Nadia has a mixture of salt, sand and iron filings. Which plan would separate all three?','Use a magnet, then add water and stir, filter, and evaporate the water.',['Filter the dry mixture, then use a magnet, then evaporate it.','Add water and stir, evaporate the water, then filter what is left.','Use a magnet, then filter the dry mixture, then add water.'],
  ['The **magnet** removes the iron. Adding water **dissolves** the salt; **filtering** keeps the sand on the paper; **evaporating** leaves the salt behind.','Filtering a dry mixture does nothing, and evaporating before filtering just mixes the salt and sand again.'],challenge)),
 item(mc('Which of these is an **irreversible** change?','Burning wood',['Freezing water','Melting butter','Dissolving sugar in tea'],
  ['Burning makes **new materials** (ash, smoke and gases) that cannot be turned back into wood.','Freezing, melting and dissolving can all be reversed.'],quick),
  {type:'category',yes:'irreversible',no:['reversible']}),
 item(mc('Why does an iron bike chain left out in the rain go rusty?','The iron reacts with water and oxygen to make a new material, rust.',['The rain slowly melts the iron, which turns orange as it cools.','The rain dissolves the surface of the iron, like sugar in water.','Rust is dirt from the rain that sticks to the chain.'],
  ['**Rusting** is a chemical change: iron joins with **oxygen** and **water** to make a new, flaky material called rust.','It is **irreversible**. Oiling or painting the chain keeps water and air away from the iron.'])),
 item(mc('Which of these will **dissolve** in water?','Sugar',['Sand','Chalk','Pepper','Flour'],
  ['Sugar is **soluble**: it breaks up into tiny pieces that spread through the water, making a clear solution.','Sand, chalk, pepper and flour are **insoluble**: they sink or make the water cloudy, but they do not dissolve.']),
  {type:'category',yes:'soluble',no:['insoluble']}),
 item(mc('Freya dissolves 20 g of salt in 200 g of water. What is the mass of the salty water?','220 g',['200 g','180 g','20 g','240 g'],
  ['When salt dissolves it is still there, just spread out, so **no mass is lost**.','200 g + 20 g = **220 g**.'],{...challenge,...sorted}),
  {type:'mass-sum',parts:[20,200]}),
 item(mc('Which of these would make sugar dissolve **faster** in water?','Using warmer water and stirring',['Using colder water and not stirring','Using bigger lumps of sugar','Putting the water in the fridge first'],
  ['Warm water and **stirring** both help sugar dissolve more quickly.','Colder water and bigger lumps slow dissolving down.'])),
 item(mc('Which property makes glass a good material for windows?','It is transparent.',['It is magnetic.','It is flexible.','It conducts electricity.','It is soluble.'],
  ['Glass is **transparent**: it lets light through, so we can see clearly out of a window.','It is also hard and waterproof, which helps too.'],quick)),
 item(mc('Sami did a scratch test on four rocks. Which rock is the **hardest**?','Rock R',['Rock P','Rock Q','Rock S'],
  ['A harder rock is **scratched by fewer things**.','Rock R was not scratched by the fingernail, the iron nail or the steel file, so it is the hardest.'],
  {visual:{kind:'table',caption:'Was the rock scratched by …',head:['Rock','a fingernail?','an iron nail?','a steel file?'],rows:[['P','yes','yes','yes'],['Q','no','no','yes'],['R','no','no','no'],['S','no','yes','yes']],alt:'A table of scratch test results for four rocks'},...sorted}),
  {type:'hardness'}),
]);

// ── States of matter and the water cycle ───────────────────────────────────────────────────────────────────
const statesTopic:Topic={id:'sc-states-of-matter',subject:'Science',strand:'Chemistry',title:'States of matter',helpsheet:{
 intro:'Materials can be **solids**, **liquids** or **gases**. Heating or cooling can change a material from one state to another.',
 steps:['**Solids** keep their shape. **Liquids** flow and take the shape of their container, but keep the same volume. **Gases** spread out to fill any container.','Heating: solid → liquid is **melting**; liquid → gas is **evaporating** (or **boiling**, when it happens quickly throughout the liquid).','Cooling: gas → liquid is **condensing**; liquid → solid is **freezing**.','Pure water melts and freezes at **0 °C** and, at sea level, boils at **100 °C**.','The **water cycle**: water evaporates, condenses into clouds, falls as rain or snow, and flows back to the sea.'],
 example:{title:'An ice lolly on a hot day',lines:['In the sun, the ice lolly **melts**: solid → liquid.','The puddle it leaves slowly **evaporates**: liquid → gas (water vapour).']},
 tips:['Evaporation happens at any temperature, and faster when it is warm or windy. Water only boils at 100 °C.','Water vapour is an invisible gas. Mist and clouds are made of tiny drops of liquid water.','A material melts and freezes at the same temperature.','Drops on a cold window come from water vapour in the air, not through the glass.']}};

const states=science(statesTopic,[
 item(mc('Which of these is a **gas**?','Oxygen',['Sand','Milk','Ice','Honey'],
  ['**Oxygen** is a gas: it spreads out to fill any space and has no fixed shape.','Sand and ice are solids; milk and honey are liquids.'],quick),
  {type:'category',yes:'gas',no:['solid','liquid']}),
 item(mc('Sand can be poured, like a liquid. Why is it still a solid?','Each grain keeps its own shape and size; the grains are just very small.',['Sand is really a liquid, because it can be poured from a bucket.','Sand is a gas, because it can blow about in the wind.','Sand melts a little every time it is poured, then sets again.'],
  ['Each grain of sand is a tiny **solid** with its own shape, which does not change.','Sand pours because the grains slide past each other, but it piles up in a heap instead of flowing flat like a liquid.'])),
 item(mc('Drops of water form on the outside of a cold can of drink. Where does the water come from?','Water vapour in the air cools on the can and condenses.',['The drink slowly leaks out through tiny holes in the metal.','The cold makes the outside of the metal can start to melt.','Ice inside the drink melts and seeps through the metal.'],
  ['The air contains invisible **water vapour**. When it touches the cold can, it cools and **condenses** into liquid drops.','The can is sealed, so none of the drink has escaped.'])),
 item(mc('In the water cycle diagram, which label shows **condensation**?','Label Q',['Label P','Label R','Label S'],
  ['**Condensation** is water vapour cooling and turning back into tiny liquid droplets. This is how **clouds** form (Q).','P shows evaporation from the sea, R shows rain (precipitation) and S shows a river carrying water back to the sea.'],
  {visual:waterCycle('A water cycle picture of the sea, the Sun, a cloud, a hill, rain and a river, with parts labelled P, Q, R and S'),...sorted}),
  {type:'labels',labels:{P:'evaporation',Q:'condensation',R:'precipitation',S:'collection'},ask:'condensation'}),
 item(mc('At what temperature does pure water boil at sea level?','100 °C',['0 °C','50 °C','37 °C','212 °C'],
  ['Pure water **boils at 100 °C** and **freezes at 0 °C**.','37 °C is body temperature. 212 is water\'s boiling point on a different scale (Fahrenheit), not in °C.'],{...quick,...sorted})),
 item(mc('Ruby heated a pan of water on a hob and recorded its temperature every minute. What was happening to the water while its temperature stayed at 100 °C?','It was boiling.',['It was melting.','It was freezing.','It was condensing.'],
  ['Water heats up until it reaches its boiling point, about **100 °C**, and then its temperature stays the same while it **boils**.','The heat is being used to turn the liquid water into water vapour, so the water gets no hotter.'],
  {visual:{kind:'chart',type:'line',title:'Heating water',x:'Time (minutes)',y:'Temperature (°C)',labels:['0','1','2','3','4','5','6','7','8','9'],values:[20,36,52,68,84,96,100,100,100,100],max:120,step:20,alt:'A line graph of the temperature of water as it is heated'}}),
  {type:'plateau',state:'boiling'}),
 item(mc('Which puddle will dry up **fastest**?','A shallow puddle on a warm, sunny, windy day',['A shallow puddle on a cold, still day','A deep puddle in the shade on a cold day','A shallow puddle on a cold, cloudy day'],
  ['Water **evaporates** faster when it is **warm**, when **wind** carries the water vapour away, and when the puddle is shallow and spread out.','The warm, sunny, windy day has all of these.'])),
 item(mc('Iris left saucers of water in rooms at different temperatures and recorded how long the water took to disappear. What do her results show?','Water evaporates faster when it is warmer.',['Water evaporates faster when it is colder.','Temperature makes no difference to evaporation.','Water only evaporates when it boils at 100 °C.'],
  ['As the temperature goes up, the number of days goes **down**: the water **evaporated faster** in warmer rooms.','Evaporation happens at any temperature, not just at boiling point.'],
  {visual:{kind:'table',head:['Room temperature (°C)','Days for the water to evaporate'],rows:[['10','9'],['15','6'],['20','4'],['25','3']],alt:'A results table of room temperature and the days taken for water to evaporate'}}),
  {type:'trend',dir:'down'}),
 item(mc('A kettle is boiling. What is the white "cloud" a little way above the spout?','Tiny drops of liquid water, made when steam cools and condenses',['Water vapour, the gas that water turns into when it boils','Smoke given off by the hot metal of the kettle','Hot air that has turned white because it is so hot'],
  ['**Steam** (water vapour) is an invisible gas: look closely and there is a clear gap just above the spout.','As the steam meets cooler air it **condenses** into tiny drops of liquid water, which we see as a white cloud.'],challenge)),
 item(mc('What is the name of the change when a liquid turns into a solid?','Freezing',['Melting','Condensing','Evaporating'],
  ['**Freezing** (or solidifying) turns a liquid into a solid when it cools.','Melting is the reverse: a solid turning into a liquid.'],quick)),
 item(mc('What happens to a gas if it is let into a bigger, empty container?','It spreads out to fill the whole container.',['It sinks and stays in a lump at the bottom.','It keeps its own shape, like a solid does.','It turns into a liquid because it has more room.'],
  ['Gases have **no fixed shape or volume**: they spread out to fill **any** container.','A liquid would only fill the bottom of the container, and a solid would keep its own shape.'])),
 item(mc('Which statement about **liquids** is true?','They take the shape of their container but keep the same volume when poured.',['They keep their own shape, just like solids, even when they are poured.','They spread out to fill the whole of any container, just like gases do.','They can easily be squashed into a much smaller space, like a sponge.'],
  ['Liquids can be **poured**, and they take the shape of the container they are in.','A litre of water poured into a different jug is still a litre: pouring does not change a liquid\'s **volume**.'])),
 item(mc('Select the **two** changes that happen when a material is **cooled**.',['Condensing','Freezing'],['Melting','Evaporating','Boiling'],
  ['When a gas cools it **condenses** into a liquid; when a liquid cools it **freezes** into a solid.','Melting, evaporating and boiling happen when materials are **heated**.'])),
 item(mc('Which part of the water cycle is mainly caused by the Sun heating the Earth?','Water evaporating from seas, rivers and lakes',['Water vapour condensing into clouds high up','Raindrops falling from the clouds to the ground','Rivers flowing down the hills to the sea'],
  ['The Sun\'s heat makes water **evaporate** into water vapour, which rises into the air.','Condensing happens where the air is cool, and rain falls and rivers flow because of **gravity**.'],challenge)),
 item(mc('Water freezes at 0 °C. At what temperature does ice melt?','0 °C',['100 °C','10 °C','4 °C','−10 °C'],
  ['A substance **melts** and **freezes** at the **same temperature**.','For water that is **0 °C**: below it, water freezes; above it, ice melts.'],sorted)),
 item(mc('Washing dries faster on a windy day. Why?','The wind carries water vapour away, so more water can evaporate.',['The wind cools the clothes, and cold water evaporates faster.','The wind adds more water vapour to the air around the clothes.','The wind turns the water in the clothes straight into ice.'],
  ['As water **evaporates**, the air right next to the clothes fills with water vapour.','The **wind** blows this damp air away and brings drier air, so evaporation keeps going quickly.'])),
 item(mc('Which arrow on the diagram shows **evaporation**?','Arrow Q',['Arrow P','Arrow R','Arrow S'],
  ['**Evaporation** turns a **liquid** into a **gas**, so it is the arrow from liquid to gas: Q.','P shows melting, R shows condensing and S shows freezing.'],
  {visual:statesDiagram('Boxes for solid, liquid and gas joined by four arrows labelled P, Q, R and S'),...sorted}),
  {type:'states',from:'liquid',to:'gas'}),
]);

export const matterParts=[materials,states];
