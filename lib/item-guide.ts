import {ITEMS,type Mods} from './builds';
// Child-friendly words for the shop and backpack. Game rules stay in builds.ts.
export const ITEM_BLURBS:Record<string,string>={
 stopwatch:'Tick-tock! Every hero attacks a little faster.',
 sharpener:'Sharper aim for pencils, chalk, balls and shuttles.',
 glasses:'Helps your heroes see further down the path.',
 wristband:'More muscle for rulers and forks.',
 library:'Extra magic for glue, paint, storybooks and bells.',
 notebook:'Practice makes every hit a bit stronger.',
 magnifier:'Spot weak spots for more lucky hits.',
 geometry:'Better aim and a little more reach.',
 goggles:'A splash of magic, and freezes and slows last longer.',
 icepack:'Freezes and slows last much longer.',
 palette:'Splashes cover a bigger area.',
 apron:'Makes paint hurt monsters more.',
 whistle:'Freezes and slows last longer, with a little more reach.',
 textbook:'Heavy hits: much stronger, but a bit slower.',
 grip:'A firm grip for strong, quick swings.',
 bookmark:'Faster attacks, but smaller splashes.',
 captain:'Lead the charge: extra damage against bosses.',
 flashcards:'More lucky hits and slightly stronger attacks.',
 telescope:'The longest reach of any item.',
 mask:'Lucky hits land with a dramatic bang.',
 flask:'Bubbling magic and stronger paint.',
 pennant:'Team spirit: longer freezes and bigger splashes.',
 gloves:'Better aim and extra damage against bosses.',
 medal:'The Manor’s finest: a little bit of everything.',
};
export const itemArt=(id:string)=>`/items/${id}.svg`;
export const MOD_WORDS:Record<keyof Mods,string>={str:'Strength',aim:'Aim',magic:'Magic',damage:'Stronger hits',speed:'Faster attacks',range:'Longer reach',crit:'Lucky hits',critDamage:'Bigger lucky hits',area:'Bigger splash',control:'Longer freeze and slow',dot:'Stronger paint',boss:'Boss damage',normal:'Normal monster damage',single:'One-target damage'};
// "What do you want your heroes to get better at?" filters in the item aisle.
export const ITEM_GOALS=[{id:'speed',label:'Faster',mods:['speed']},{id:'power',label:'Stronger',mods:['damage','str','aim','normal','single']},{id:'reach',label:'Reach further',mods:['range']},{id:'magic',label:'Magic & paint',mods:['magic','dot']},{id:'freeze',label:'Freeze & slow',mods:['control']},{id:'lucky',label:'Lucky hits',mods:['crit','critDamage']},{id:'splash',label:'Splash',mods:['area']},{id:'boss',label:'Bosses',mods:['boss']}] as const;
export function itemGoals(id:string):string[]{const mods=ITEMS.find(i=>i.id===id)?.mods??{};return ITEM_GOALS.filter(g=>Object.entries(mods).some(([k,v])=>v!>0&&(g.mods as readonly string[]).includes(k))).map(g=>g.id);}
export function modAmount(key:string,value:number){const n=['str','aim','magic','range','critDamage'].includes(key)?Number(value.toFixed(2)):Math.round(value*100);return `${n>=0?'+':'−'}${Math.abs(n)}${key==='range'?' squares':key==='critDamage'?'×':['str','aim','magic'].includes(key)?'':'%'}`;}
