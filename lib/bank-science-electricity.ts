import type {Topic} from './bank-kit';
import {words} from './bank-kit';
import {mc,item,science,quick,challenge} from './bank-science-kit';
import {circuit,circuits,symbol,type CLoop} from './bank-science-draw';
// Science: electricity. Every circuit is a series loop (bank-science-draw.ts). tests/bank-science.cjs reads each drawn
// circuit back from its wires and symbols, simulates it, and checks the claims listed in each audit.
// Claims: [label,'on'|'off'] for a bulb or buzzer ('*' means every one), [label,'>'|'<'|'=',label] for brightness,
// ['switch '+name,'open'|'closed'], ['cells','=',n]. A reason the picture cannot show is listed under reasons.

const count=(n:number,one:string)=>`${words(n)} ${one}${n===1?'':'s'}`;
const bright=(cells:number,bulbs:number):CLoop=>({top:Array.from({length:cells},()=>({k:'cell' as const})),bottom:Array.from({length:bulbs},()=>({k:'bulb' as const})),w:218});
const BRIGHT_CHOICES:[string,number,number][]=[['c2b1',2,1],['c1b1',1,1],['c2b2',2,2],['c3b2',3,2]];
const BUZZER_CHOICES:{key:string;loop:CLoop;alt:string}[]=[
 {key:'complete',loop:{top:[{k:'cell'}],bottom:[{k:'switch',closed:true},{k:'buzzer'}],w:152},alt:'A cell, a closed switch and a buzzer joined in a loop'},
 {key:'open',loop:{top:[{k:'cell'}],bottom:[{k:'switch',closed:false},{k:'buzzer'}],w:152},alt:'A cell, an open switch and a buzzer joined in a loop'},
 {key:'gap',loop:{top:[{k:'cell'}],left:[{k:'gap'}],bottom:[{k:'switch',closed:true},{k:'buzzer'}],w:152},alt:'A cell, a closed switch and a buzzer, with a break in one wire'},
 {key:'noCell',loop:{top:[],bottom:[{k:'switch',closed:true},{k:'buzzer'}],w:152},alt:'A closed switch and a buzzer joined in a loop'}];
const SYMBOLS:{key:'buzzer'|'motor'|'bulb'|'cell';alt:string}[]=[{key:'buzzer',alt:'A small dome shape on a wire'},{key:'motor',alt:'A circle with the letter M inside'},{key:'bulb',alt:'A circle with a cross inside'},{key:'cell',alt:'A long thin line beside a short thick line'}];

const electricityTopic:Topic={id:'sc-electricity',subject:'Science',strand:'Physics',title:'Electricity',helpsheet:{
 intro:'Electricity flows only when there is a **complete loop** (a circuit) from one end of a cell, through the components, and back to the other end.',
 steps:['Trace the wire from the cell with your finger, all the way round.','A gap or an **open switch** breaks a series circuit, so nothing in it works.','More cells facing the same way (a higher voltage) make bulbs **brighter** and buzzers **louder**.','More bulbs in the same series circuit make each bulb **dimmer**.'],
 example:{title:'Does the bulb light?',visual:circuit({top:[{k:'cell'}],bottom:[{k:'switch',closed:true},{k:'bulb'}]},'A circuit with a cell, a closed switch and a bulb'),lines:['Follow the wire from the cell, through the closed switch and the bulb, and back to the cell.','The loop is complete, so the bulb lights.']},
 tips:['Symbols: a cell is a long thin line beside a short thick line. A battery is two or more cells joined together.','An open switch anywhere in a series circuit turns off everything in that circuit.','Identical bulbs in one series loop are equally bright: the electricity is not used up by the first bulb.','Metals are good electrical conductors. Plastic, rubber, wood and glass are insulators.','Never experiment with mains electricity: it is dangerous.']}};

const electricity=science(electricityTopic,[
 item(mc('Which component does this circuit symbol show?','Bulb',['Motor','Cell','Buzzer','Switch'],
  ['A circle with a **cross** inside is the symbol for a **bulb** (also called a lamp).','A motor is a circle with an M inside, and a cell is a long line beside a short, thick line.'],
  {visual:symbol('bulb','A circle with a cross inside, on a wire'),...quick}),
  {type:'symbol',kind:'bulb'}),
 item({...mc('Which of these is the symbol for a **buzzer**?','buzzer',['motor','bulb','cell'],
  ['The buzzer symbol looks like a small **dome**, a half circle, on the wire.','The circle with a cross is a bulb, the circle with an M is a motor, and the long and short lines are a cell.'],quick),
  pictures:SYMBOLS.map(s=>({key:s.key,visual:symbol(s.key,s.alt)}))},
  {type:'symbol-pictures',target:'buzzer',pictures:SYMBOLS.map(s=>({visual:symbol(s.key,s.alt),kind:s.key}))}),
 item(mc('Will the bulb in this circuit light?','No, because the switch is open.',['Yes, because the switch is closed.','No, because there is no cell in the circuit.','Yes, because electricity can jump across the switch.'],
  ['Follow the wire from the cell: the path is broken at the **open switch**.','Electricity can only flow round a **complete loop**, so the bulb stays off until the switch is closed.'],
  {visual:circuit({top:[{k:'cell'}],bottom:[{k:'switch',closed:false,name:'S'},{k:'bulb'}]},'A circuit with a cell, a switch labelled S and a bulb')}),
  {type:'circuit',claims:{'No, because the switch is open.':[['*','off'],['switch S','open']],'Yes, because the switch is closed.':[['*','on'],['switch S','closed']],'No, because there is no cell in the circuit.':[['*','off'],['cells','=',0]],'Yes, because electricity can jump across the switch.':[['*','on']]}}),
 item(mc('The two bulbs are the same. Which bulbs in this circuit will light?','P and Q, equally brightly',['P only','Q only','Neither bulb','P and Q, but P is brighter than Q'],
  ['The switch is closed, so there is a **complete loop** through the cell and both bulbs.','In a series circuit the same current flows through every part, so the bulbs are **equally bright**. The first bulb does not use the electricity up.'],
  {visual:circuit({top:[{k:'cell'}],bottom:[{k:'bulb',name:'P'},{k:'switch',closed:true},{k:'bulb',name:'Q'}]},'A circuit with a cell, two bulbs labelled P and Q, and a switch')}),
  {type:'circuit',claims:{'P and Q, equally brightly':[['P','on'],['Q','on'],['P','=','Q']],'P only':[['P','on'],['Q','off']],'Q only':[['P','off'],['Q','on']],'Neither bulb':[['P','off'],['Q','off']],'P and Q, but P is brighter than Q':[['P','on'],['Q','on'],['P','>','Q']]}}),
 item(mc('The switch in this circuit is open. Which bulbs are lit?','Neither bulb',['P only','Q only','P and Q'],
  ['An open switch makes a **gap** in the loop. A series circuit has only one path, so **no current** flows anywhere in it.','Both bulbs are off, wherever the switch is placed in the loop.'],
  {visual:circuit({top:[{k:'cell'},{k:'switch',closed:false}],bottom:[{k:'bulb',name:'P'},{k:'bulb',name:'Q'}]},'A circuit with a cell, a switch and two bulbs labelled P and Q')}),
  {type:'circuit',claims:{'Neither bulb':[['P','off'],['Q','off']],'P only':[['P','on'],['Q','off']],'Q only':[['P','off'],['Q','on']],'P and Q':[['P','on'],['Q','on']]}}),
 item(mc('All the cells and bulbs are the same. How does bulb Q in circuit 2 compare with bulb P in circuit 1?','Q is brighter than P.',['Q is dimmer than P.','Q is exactly as bright as P.','Q does not light at all.'],
  ['Circuit 2 has **two cells**, which give a **higher voltage**, so a bigger current flows through its bulb.','With the same kind of bulb, more cells make the bulb **brighter**.'],
  {visual:circuits([{top:[{k:'cell'}],bottom:[{k:'bulb',name:'P'}],w:152},{top:[{k:'cell'},{k:'cell'}],bottom:[{k:'bulb',name:'Q'}],w:152}],['Circuit 1','Circuit 2'],'Two circuits: circuit 1 has one cell and bulb P; circuit 2 has two cells and bulb Q')}),
  {type:'circuit',claims:{'Q is brighter than P.':[['Q','>','P']],'Q is dimmer than P.':[['Q','<','P']],'Q is exactly as bright as P.':[['Q','=','P']],'Q does not light at all.':[['Q','off']]}}),
 item(mc('All the cells and bulbs are the same. How do bulbs Q and R in circuit 2 compare with bulb P in circuit 1?','Q and R are both dimmer than P.',['Q and R are both brighter than P.','Q is as bright as P, but R is dimmer.','All three bulbs are equally bright.'],
  ['Each circuit has one cell, but in circuit 2 its voltage is **shared** between two bulbs.','A smaller current flows, so Q and R are equally bright, and both are **dimmer** than P.'],
  {visual:circuits([{top:[{k:'cell'}],bottom:[{k:'bulb',name:'P'}],w:152},{top:[{k:'cell'}],bottom:[{k:'bulb',name:'Q'},{k:'bulb',name:'R'}],w:152}],['Circuit 1','Circuit 2'],'Two circuits with one cell each: circuit 1 has bulb P; circuit 2 has bulbs Q and R')}),
  {type:'circuit',claims:{'Q and R are both dimmer than P.':[['Q','<','P'],['R','<','P']],'Q and R are both brighter than P.':[['Q','>','P'],['R','>','P']],'Q is as bright as P, but R is dimmer.':[['Q','=','P'],['R','<','P']],'All three bulbs are equally bright.':[['Q','=','P'],['R','=','P']]}}),
 item({...mc('All the cells are the same, and so are all the bulbs. In which circuit will each bulb be **brightest**?','c2b1',['c1b1','c2b2','c3b2'],
  ['Brightness depends on how many cells there are **for each bulb**.','Two cells for one bulb gives the most. Three cells shared by two bulbs is 1½ cells per bulb, and the other two circuits have one cell per bulb.'],challenge),
  pictures:BRIGHT_CHOICES.map(([key,c,b])=>({key,visual:circuit(bright(c,b),`A circuit with ${count(c,'cell')} and ${count(b,'bulb')}`)}))},
  {type:'circuit-pictures',ask:'brightest',pictures:BRIGHT_CHOICES.map(([,c,b])=>({visual:circuit(bright(c,b),`A circuit with ${count(c,'cell')} and ${count(b,'bulb')}`)}))}),
 item({...mc('In which circuit will the buzzer sound?','complete',['open','gap','noCell'],
  ['The buzzer only sounds if there is a **complete loop** that includes a **cell**.','One of the other circuits has an open switch, one has a break in a wire, and one has no cell to push the electricity round.']),
  pictures:BUZZER_CHOICES.map(c=>({key:c.key,visual:circuit(c.loop,c.alt)}))},
  {type:'circuit-pictures',ask:'sounds',pictures:BUZZER_CHOICES.map(c=>({visual:circuit(c.loop,c.alt)}))}),
 item(mc('What must Chloe do to make the bulb light?','Close switch S1',['Open switch S2','Add a second bulb','Turn the cell round','Nothing: the bulb is already lit'],
  ['Switch S1 is **open**, so the loop is broken. Closing S1 completes the circuit.','Opening S2 would make another gap, and adding a bulb or turning the cell round does not close the gap.'],
  {visual:circuit({top:[{k:'cell'},{k:'switch',closed:false,name:'S1'}],bottom:[{k:'switch',closed:true,name:'S2'},{k:'bulb'}]},'A circuit with a cell, two switches labelled S1 and S2, and a bulb')}),
  {type:'circuit-actions',actions:{'Close switch S1':{close:'S1'},'Open switch S2':{open:'S2'},'Add a second bulb':{addBulb:true},'Turn the cell round':{flipCell:true},'Nothing: the bulb is already lit':{}}}),
 item(mc('Leo adds a second cell, facing the same way, to his circuit of one cell and a buzzer. What happens to the buzzer?','It sounds louder.',['It sounds quieter.','It stops sounding.','It sounds exactly the same.'],
  ['Two cells give a **higher voltage**, so a bigger current flows through the buzzer.','A bigger current makes the buzzer vibrate more strongly, so it is **louder**.']),
  {type:'series-change',before:{cells:1,loads:1},after:{cells:2,loads:1},answer:'louder'}),
 item(mc('Ben puts different objects into a gap in his circuit. Which object will make the bulb light?','A steel paper clip',['A plastic ruler','A rubber band','A wooden lolly stick','A glass marble'],
  ['The object must **conduct electricity** to complete the loop. Metals such as steel are good **conductors**.','Plastic, rubber, wood and glass are **insulators**, so with them in the gap the bulb stays off.']),
  {type:'category',yes:'conductor',no:['insulator']}),
 item(mc('Select the **two** materials that are electrical **insulators**.',['Plastic','Rubber'],['Copper','Aluminium','Iron'],
  ['**Insulators** do not let electricity flow through them easily. Plastic and rubber are good insulators.','Copper, aluminium and iron are metals, and metals are good **conductors**.']),
  {type:'category',yes:'insulator',no:['conductor']}),
 item(mc('Why are the wires inside a cable made of copper and covered in plastic?','Copper conducts electricity, and the plastic insulates it so it is safe to touch.',['Plastic conducts electricity well, and copper keeps the cable safe to touch.','Copper and plastic both conduct electricity, so the current is doubled.','Copper is soft and bendy, and the plastic makes the electricity flow faster.'],
  ['**Copper** is a metal and a very good **conductor**, so electricity flows easily along it.','**Plastic** is an **insulator**, so it stops the electricity reaching anyone who touches the cable.'])),
 item(mc('Priya built this circuit, but the bulb does not light. What is the reason?','The two cells face opposite ways, so they cancel each other out.',['The switch is open, so the loop is broken.','A bulb needs at least three cells to light.','The wires are much too long for the electricity to reach the bulb.'],
  ['Look at the cell symbols: the long and short lines of one cell are the **other way round** from the other.','The two cells push the current in **opposite directions**, so they cancel out and no current flows.'],
  {visual:circuit({top:[{k:'cell'},{k:'cell',rev:true}],bottom:[{k:'switch',closed:true,name:'S'},{k:'bulb'}]},'A circuit with two cells, a switch labelled S and a bulb'),...challenge}),
  {type:'circuit',claims:{'The two cells face opposite ways, so they cancel each other out.':[['*','off'],['cells','opposed']],'The switch is open, so the loop is broken.':[['switch S','open']]},reasons:['A bulb needs at least three cells to light.','The wires are much too long for the electricity to reach the bulb.']}),
 item(mc('Why is it safe to handle a 1.5 V cell, but dangerous to touch mains electricity?','Mains voltage is far higher, so it can push a dangerous current through your body.',['The electricity from a cell is a kind that cannot flow through people.','Mains electricity is only dangerous when it is raining outside.','Cells are covered in plastic, so electricity can never come out of them.'],
  ['A small cell has a **low voltage**, too low to push a harmful current through you.','Mains electricity is about **230 V**, high enough to cause serious injury, so we never experiment with it.'])),
 item(mc('Which list names all the components in this circuit?','A cell, a switch and a motor',['A cell, a switch and a bulb','A cell, a bulb and a motor','A cell, a buzzer and a motor'],
  ['The long and short lines are a **cell**, the two dots joined by a line are a closed **switch**, and the circle with **M** is a **motor**.','A bulb would be a circle with a cross, and a buzzer looks like a small dome.'],
  {visual:circuit({top:[{k:'cell'}],bottom:[{k:'switch',closed:true},{k:'motor'}]},'A circuit with three components joined in a loop'),...quick}),
  {type:'components'}),
 item(mc('Kofi turns the cell round in his circuit with a motor. What happens to the motor?','It spins the other way.',['It stops working.','It spins twice as fast.','It spins exactly as before.'],
  ['Turning the cell round makes the current flow the **other way** round the circuit.','A motor spins in the **opposite direction** when the current is reversed. A bulb would simply stay lit.'],challenge)),
]);

export const electricityParts=[electricity];
