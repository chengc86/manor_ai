export const MAX_WEAPON_LEVEL=10;
export const EQUIPMENT=[
 {id:'standard',name:'Pencil Lance',price:40,description:'Accurate pencil magic. Pierces a line of monsters from level 3.',effect:'Piercing',art:0},
 {id:'swift',name:'Chalk Blaster',price:60,description:'Very quick chalk shots; level 3 marks targets for extra damage.',effect:'Rapid fire + mark',art:1},
 {id:'frost',name:'Frost Glue',price:60,description:'Briefly freezes monsters. Longer freezes at levels 3 and 6.',effect:'Freeze',art:2},
 {id:'blast',name:'Football Launcher',price:80,description:'A powerful splash around the target. Blast radius grows with upgrades.',effect:'Area damage',art:3},
 {id:'ruler',name:'Ruler of Reach',price:50,description:'Short-range ruler waves push monsters backwards along the path.',effect:'Knockback',art:4},
 {id:'glue',name:'Super Glue',price:50,description:'Sticky splashes slow enemies; level 6 adds a brief freeze.',effect:'Slow + root',art:5},
 {id:'tennis',name:'Tennis Trickshot',price:60,description:'Bounces between nearby monsters, reaching more targets at levels 3 and 6.',effect:'Chain bounce',art:6},
 {id:'basketball',name:'Basketball Bouncer',price:70,description:'A close-range slam damages a group and knocks it back.',effect:'Splash + knockback',art:7},
 {id:'cricket',name:'Cricket Sixer',price:80,description:'Every third hit is a double-damage sixer. Level 6 adds piercing.',effect:'Critical hit',art:8},
 {id:'pingpong',name:'Table Tennis Flurry',price:45,description:'Light but extremely fast shots; level 6 attacks two targets.',effect:'Fast multi-shot',art:9},
 {id:'rugby',name:'Rugby Rocket',price:70,description:'A heavy hit pushes enemies back; level 3 adds splash.',effect:'Heavy impact',art:10},
 {id:'badminton',name:'Shuttle Storm',price:55,description:'Long-range shuttle magic slows its target; later shots pierce.',effect:'Long-range slow',art:11},
 {id:'fork',name:'Lunch Fork Trident',price:50,description:'Three magical prongs hit three enemies in close range.',effect:'Triple shot',art:12},
 {id:'teddy',name:'Manor Ted’s Heartbeam',price:100,description:'Heart magic marks enemies so every classmate hits harder. Upgrades add freeze and splash.',effect:'Team damage boost',art:13},
 {id:'paint',name:'Rainbow Paintbrush',price:60,description:'Magic paint deals damage over time; level 3 spreads it with a splash.',effect:'Damage over time',art:14},
 {id:'book',name:'Storybook Spells',price:80,description:'Pages of magic jump between enemies. Level 6 adds slowing.',effect:'Chain + slow',art:15},
 {id:'bell',name:'School Bell Burst',price:90,description:'A ringing pulse briefly stuns a group of monsters.',effect:'Area stun',art:16},
 {id:'eraser',name:'Super Eraser',price:65,description:'A strong erasing blast; every second shot is critical from level 3.',effect:'Power hit',art:17},
];
export function equipment(id='standard'){return EQUIPMENT.find(w=>w.id===id)??EQUIPMENT[0]}
export function weaponStage(level:number){return level>=10?'Legendary':level>=6?'Master':level>=3?'Advanced':'Starter'}
export function weaponTraits(id:string,level:number){const tier=level>=6?2:level>=3?1:0;const t={damage:1,speed:1,range:0,targets:1,splash:0,freeze:0,slow:0,slowDuration:2,knockback:0,chain:0,pierce:0,dot:0,dotDuration:3,mark:0,criticalEvery:0};
 switch(id){
 case 'standard':t.pierce=tier?tier+1:0;break;
 case 'swift':t.damage=.65;t.speed=.55;t.mark=tier?.1+.05*tier:0;break;
 case 'frost':t.damage=.65;t.freeze=[.6,.8,1][tier];break;
 case 'blast':t.damage=.8;t.speed=1.35;t.splash=3.6+tier*.4;break;
 case 'ruler':t.range=-1;t.damage=1.3;t.knockback=.4+tier*.3;break;
 case 'glue':t.damage=.45;t.slow=.25+tier*.15;t.slowDuration=2+tier;t.splash=tier?1.5:0;t.freeze=tier===2?.4:0;break;
 case 'tennis':t.damage=.65;t.chain=2+tier;t.speed=.85;break;
 case 'basketball':t.damage=.8;t.splash=1.8+tier*.5;t.knockback=.2+tier*.15;t.speed=1.3;break;
 case 'cricket':t.damage=1.2;t.speed=1.4;t.criticalEvery=3;t.pierce=tier===2?2:0;break;
 case 'pingpong':t.damage=.35;t.speed=.4;t.targets=tier===2?2:1;break;
 case 'rugby':t.damage=1.4;t.speed=1.5;t.knockback=.7+tier*.2;t.splash=tier?1.5:0;break;
 case 'badminton':t.damage=.65;t.range=2;t.slow=.15+tier*.1;t.pierce=tier===2?2:0;break;
 case 'fork':t.damage=.55;t.targets=3+tier;t.range=-1;break;
 case 'teddy':t.damage=.45;t.mark=.2+tier*.1;t.freeze=tier?.4:0;t.splash=tier===2?2:0;break;
 case 'paint':t.damage=.55;t.dot=.18+tier*.06;t.dotDuration=3+tier;t.splash=tier?1.5+tier*.3:0;break;
 case 'book':t.damage=.65;t.chain=3+tier;t.speed=1.3;t.slow=tier===2?.2:0;break;
 case 'bell':t.damage=.5;t.splash=2+tier*.5;t.freeze=.3+tier*.2;t.speed=1.5;break;
 case 'eraser':t.damage=1.6;t.speed=1.5;t.criticalEvery=tier?2:0;t.pierce=tier===2?2:0;break;
 }return t;
}
export function effectSummary(s:ReturnType<typeof weaponTraits>){return [s.targets>1?`${s.targets} targets`:'',s.splash?`${s.splash.toFixed(1)}-square splash`:'',s.freeze?`${s.freeze.toFixed(1)}s freeze`:'',s.slow?`${Math.round(s.slow*100)}% slow`:'',s.knockback?`${s.knockback.toFixed(1)}-square push`:'',s.chain?`${s.chain} bounces`:'',s.pierce?`Pierces ${s.pierce}`:'',s.dot?`${Math.round(s.dot*100)}% hit damage/sec for ${s.dotDuration}s`:'',s.mark?`Team damage +${Math.round(s.mark*100)}% for 3s`:'',s.criticalEvery?`Double damage every ${s.criticalEvery} shots`:''].filter(Boolean).join(' · ')||'Single-target attack'}
