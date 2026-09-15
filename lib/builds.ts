export type Mods={str?:number;aim?:number;magic?:number;damage?:number;speed?:number;range?:number;crit?:number;critDamage?:number;area?:number;control?:number;dot?:number;boss?:number;normal?:number;single?:number};
export const MOD_LABELS:Record<keyof Mods,string>={str:'Strength',aim:'Aim',magic:'Magic',damage:'Damage',speed:'Attack speed',range:'Range',crit:'Crit chance',critDamage:'Crit multiplier',area:'Area radius',control:'Control duration',dot:'Damage over time',boss:'Boss damage',normal:'Normal-enemy damage',single:'Non-area damage'};
export function modText(m:Mods){return Object.entries(m).map(([k,v])=>`${v!>=0?'+':''}${['str','aim','magic','range','critDamage'].includes(k)?Number(v!.toFixed(2)):Math.round(v!*100)}${k==='range'?' squares':k==='critDamage'?'×':['str','aim','magic'].includes(k)?'':'%'} ${MOD_LABELS[k as keyof Mods]}`).join(' · ')}
export const HERO_TRAITS:{role:string;mods:Mods;weapons:string}[]=[
{role:'Precision ranger',mods:{aim:3,range:.5,str:-2},weapons:'Pencil / Shuttle'},
{role:'Magic specialist',mods:{magic:4,damage:.05,speed:-.1},weapons:'Storybook / Paintbrush'},
{role:'Heavy hitter',mods:{str:5,boss:.1,speed:-.15},weapons:'Ruler / Fork'},
{role:'Chain caster',mods:{magic:2,speed:.15,damage:-.1},weapons:'Storybook / Chalk'},
{role:'Speed specialist',mods:{speed:.25,crit:.05,damage:-.15,range:-.3},weapons:'Table tennis / Chalk'},
{role:'Long-range marksman',mods:{aim:4,range:.8,speed:-.2},weapons:'Pencil / Cricket'},
{role:'Crowd clearer',mods:{area:.25,magic:2,single:-.1},weapons:'Football / Paintbrush'},
{role:'Legacy tower',mods:{aim:2},weapons:'Pencil'}, {role:'Legacy magic tower',mods:{magic:2},weapons:'Storybook'},
{role:'Melee critical striker',mods:{str:3,crit:.1,range:-.4},weapons:'Ruler / Fork'},
{role:'Flexible shooter',mods:{aim:2,speed:.1,magic:-2},weapons:'Tennis / Basketball'},
{role:'Control specialist',mods:{control:.3,range:.3,damage:-.15},weapons:'Glue / Frost glue'},
{role:'Rapid shooter',mods:{speed:.2,aim:1,area:-.2},weapons:'Table tennis / Shuttle'},
{role:'Paint specialist',mods:{dot:.3,magic:2,crit:-.05},weapons:'Paintbrush / Glue'},
{role:'Team supporter',mods:{control:.25,area:.15,damage:-.15},weapons:'Manor Ted / Bell'},
{role:'Boss hunter',mods:{boss:.25,damage:.1,speed:-.15},weapons:'Cricket / Rugby / Eraser'},
];
export const ITEMS:{id:string;name:string;price:number;mods:Mods}[]=[
{id:'stopwatch',name:'Stopwatch',price:100,mods:{speed:.15,damage:-.05}},
{id:'sharpener',name:'Pencil sharpener',price:100,mods:{aim:3,range:-.2}},
{id:'glasses',name:'Reading glasses',price:100,mods:{range:.6,speed:-.05}},
{id:'wristband',name:'PE wristband',price:120,mods:{str:4,magic:-2}},
{id:'library',name:'Library card',price:120,mods:{magic:4,str:-2}},
{id:'notebook',name:'Practice notebook',price:100,mods:{damage:.1,speed:-.05}},
{id:'magnifier',name:'Magnifying glass',price:140,mods:{crit:.08,range:-.3}},
{id:'geometry',name:'Geometry set',price:140,mods:{aim:2,range:.4,str:-2}},
{id:'goggles',name:'Science goggles',price:140,mods:{magic:2,control:.15,damage:-.05}},
{id:'icepack',name:'Ice pack',price:160,mods:{control:.25,speed:-.1}},
{id:'palette',name:'Wide paint palette',price:160,mods:{area:.2,damage:-.1}},
{id:'apron',name:'Artist apron',price:160,mods:{dot:.25,crit:-.05}},
{id:'whistle',name:'Sports whistle',price:140,mods:{control:.2,range:.2,str:-2}},
{id:'textbook',name:'Heavy textbook',price:160,mods:{damage:.2,speed:-.12}},
{id:'grip',name:'Rubber grip',price:120,mods:{str:3,speed:.05,range:-.2}},
{id:'bookmark',name:'Feather bookmark',price:120,mods:{speed:.12,area:-.15}},
{id:'captain',name:'Captain badge',price:180,mods:{boss:.2,normal:-.08}},
{id:'flashcards',name:'Revision flashcards',price:160,mods:{crit:.06,damage:.05,control:-.1}},
{id:'telescope',name:'Telescope',price:180,mods:{range:1,speed:-.12}},
{id:'mask',name:'Drama mask',price:180,mods:{critDamage:.3,damage:-.08}},
{id:'flask',name:'Lab flask',price:160,mods:{magic:3,dot:.15,aim:-2}},
{id:'pennant',name:'Team pennant',price:180,mods:{control:.2,area:.1,damage:-.1}},
{id:'gloves',name:'Cricket gloves',price:180,mods:{aim:3,boss:.1,speed:-.08}},
{id:'medal',name:'Manor merit medal',price:240,mods:{str:2,aim:2,magic:2,damage:.08}},
];
export type ItemLoadout={itemInventory?:Record<string,number>;equippedItems?:string[];itemSlots?:number};
export function itemMods(id:string,level=1):Mods{const item=ITEMS.find(i=>i.id===id);return Object.fromEntries(Object.entries(item?.mods??{}).map(([k,v])=>[k,v>0?v*(1+.4*(Math.max(1,Math.min(3,level))-1)):v]));}
export function itemUpgradeCost(id:string,level:number){const item=ITEMS.find(i=>i.id===id);return !item||level<1||level>=3?null:Math.ceil(item.price*(level===1?1:1.5)/20)*20;}
export function slotCost(slots=2){return slots===2?200:slots===3?400:null;}
export function equippedMods(type:number,loadout:ItemLoadout={}):Mods{loadout=loadout??{};const m={...HERO_TRAITS[type]?.mods};for(const id of [...new Set(loadout.equippedItems??[])].slice(0,loadout.itemSlots??2)){const l=loadout.itemInventory?.[id];if(!l)continue;for(const [k,v] of Object.entries(itemMods(id,l)))m[k as keyof Mods]=(m[k as keyof Mods]??0)+v;}return m;}
export const WEAPON_BASE:Record<string,{category:'str'|'aim'|'magic';damage:number;cooldown:number;range:number;crit:number;scaling:number}>={};
const bases:[string,'str'|'aim'|'magic',number,number,number,number,number][]=[['standard','aim',18,1.1,4.5,.1,1],['swift','aim',7,.45,3.5,.05,.35],['frost','magic',10,1.5,3.5,0,.6],['blast','aim',22,1.8,3.8,.05,.8],['ruler','str',28,1.3,2.2,.1,1.2],['glue','magic',6,1.2,3.2,0,.4],['tennis','aim',13,.95,4,.1,.7],['basketball','aim',20,1.6,3,.05,.8],['cricket','aim',32,1.9,4.8,.15,1.3],['pingpong','aim',5,.35,3,.05,.25],['rugby','aim',30,2,3.6,.05,1.1],['badminton','aim',12,.9,5.2,.1,.6],['fork','str',10,1.2,2,.1,.4],['teddy','magic',8,1.5,4,0,.5],['paint','magic',8,1.4,3.6,0,.5],['book','magic',16,1.7,4,.05,.8],['bell','magic',10,2.2,3.5,0,.5],['eraser','magic',34,2.1,3.3,.1,1.4]];
for(const [id,category,damage,cooldown,range,crit,scaling] of bases)WEAPON_BASE[id]={category,damage,cooldown,range,crit,scaling};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function buildStats(type:number,level=1,weapon='standard',loadout:ItemLoadout={}){
const b=WEAPON_BASE[weapon]??WEAPON_BASE.standard,m=equippedMods(type,loadout),tier=level>=10?3:level>=6?2:level>=3?1:0;
const t={targets:1,splash:0,freeze:0,slow:0,slowDuration:2,knockback:0,chain:0,pierce:0,dot:0,dotDuration:4,mark:0,markDuration:3,criticalEvery:0,critChance:b.crit,critMultiplier:2,bossDamage:0,rangeBonus:0,splashFalloff:.6};
switch(weapon){case 'standard':t.pierce=tier?tier+1:0;break;case 'swift':t.mark=tier?[0,.1,.15,.2][tier]:0;t.markDuration=2;break;case 'frost':t.freeze=[.6,.8,1,1.2][tier];break;case 'blast':t.splash=[1.6,1.9,2.2,2.2][tier];if(tier===3)t.splashFalloff=.75;break;case 'ruler':t.knockback=[.5,.7,.9,.9][tier];if(tier===3)t.bossDamage=.15;break;case 'glue':t.slow=[.25,.35,.45,.45][tier];if(tier===3)t.splash=1.2;break;case 'tennis':t.chain=2+tier;break;case 'basketball':t.splash=[1.2,1.5,1.5,1.8][tier];t.knockback=tier>=2?.5:.3;break;case 'cricket':if(tier)t.critMultiplier=2.2;if(tier>=2)t.bossDamage=.15;if(tier===3)t.critChance+=.1;break;case 'pingpong':if(tier)t.rangeBonus=.3;if(tier>=2)t.targets=2;if(tier===3)t.critChance+=.1;break;case 'rugby':t.knockback=tier?1:.8;if(tier>=2)t.splash=1.2;if(tier===3)t.bossDamage=.15;break;case 'badminton':t.slow=tier?.25:.15;if(tier>=2)t.pierce=2;if(tier===3)t.rangeBonus=.5;break;case 'fork':t.targets=[3,4,4,5][tier];if(tier>=2)t.rangeBonus=.3;break;case 'teddy':t.mark=[.15,.2,.25,.25][tier];if(tier===3)t.markDuration=4;break;case 'paint':t.dot=tier===3?.3:.2;if(tier)t.dotDuration=5;if(tier>=2)t.splash=1.2;break;case 'book':t.chain=[3,4,5,5][tier];if(tier===3)t.slow=.2;break;case 'bell':t.splash=tier===3?2.2:1.8;t.freeze=[.3,.4,.5,.5][tier];break;case 'eraser':if(tier)t.bossDamage=.1;if(tier>=2)t.critChance+=.1;if(tier===3)t.critMultiplier=2.3;break;}
const damage=level===0||weapon==='none'?0:Math.max(1,Math.round((b.damage*(1+.18*(level-1))+clamp(m[b.category]??0,-10,20)*b.scaling)*(1+clamp((m.damage??0)+(t.splash?0:m.single??0),-.5,1.5))));
const cooldown=Math.max(.2,b.cooldown/(1+clamp(m.speed??0,-.4,1.5))/(1+.025*Math.max(0,level-1))),control=1+clamp(m.control??0,-.3,.5);
return {...t,damage,cooldown,range:clamp(b.range+t.rangeBonus+(m.range??0),1.2,8),splash:Math.min(5,t.splash*(1+clamp(m.area??0,-.3,.6))),freeze:t.freeze*control,slowDuration:t.slowDuration*control,markDuration:t.markDuration*control,dot:t.dot*(1+clamp(m.dot??0,-.5,1)),critChance:clamp(t.critChance+(m.crit??0),0,.5),critMultiplier:clamp(t.critMultiplier+(m.critDamage??0),1,2.5),bossDamage:clamp(t.bossDamage+(m.boss??0),0,.4),normalDamage:clamp(m.normal??0,-.5,1.5),category:b.category,scaling:b.scaling};
}
export function referenceDps(s:ReturnType<typeof buildStats>){return s.damage/s.cooldown*(1+s.critChance*(s.critMultiplier-1));}
