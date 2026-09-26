export type EnemyKind={id:string;name:string;description:string;counter:string;hp:number;speed:number;armour:number;magicResist:number;control:number;paint:number;colour:string};
export const ENEMIES:EnemyKind[]=[
 {id:'slime',name:'Meadow Slime',description:'A steady, unarmoured scout.',counter:'Any weapon works well.',hp:1,speed:1,armour:0,magicResist:0,control:1,paint:1,colour:'#b2e888'},
 {id:'runner',name:'Bramble Runner',description:'Light-footed and quick, but fragile.',counter:'Glue and frost buy time.',hp:.72,speed:1.4,armour:0,magicResist:0,control:1.15,paint:1,colour:'#ffc183'},
 {id:'tinback',name:'Tinback Beetle',description:'Metal plates block 35% of physical damage.',counter:'Magic bypasses its armour.',hp:1.15,speed:.8,armour:.35,magicResist:0,control:1,paint:1,colour:'#a3c9df'},
 {id:'moth',name:'Inkwing Moth',description:'Enchanted wings resist 40% of magic damage. Follows the route.',counter:'Use pencils and rulers.',hp:.9,speed:1.15,armour:0,magicResist:.4,control:1,paint:1,colour:'#c0a3ef'},
 {id:'shell',name:'Acorn Shellguard',description:'Thick shell blocks 50% of physical hits; slow-moving.',counter:'Magic and paint wear it down.',hp:1.35,speed:.65,armour:.5,magicResist:0,control:.8,paint:1.2,colour:'#d9b88c'},
 {id:'frost',name:'Frost Puff',description:'Icy fluff halves freeze, slow and knockback effects.',counter:'Raw damage beats repeated freezing.',hp:1.15,speed:1,armour:0,magicResist:.15,control:.5,paint:1,colour:'#b4efff'},
 {id:'boots',name:'Boot Brute',description:'Heavy boots shrug off 70% of control effects.',counter:'Keep high-damage weapons nearby.',hp:1.6,speed:.72,armour:.15,magicResist:0,control:.3,paint:1,colour:'#d5b18e'},
 {id:'bubble',name:'Bubble Warden',description:'Magic bubble resists 55% of magic damage.',counter:'Physical hits burst through.',hp:1.2,speed:.9,armour:0,magicResist:.55,control:1,paint:.8,colour:'#ddc6ff'},
 {id:'paper',name:'Paper Skitter',description:'Very fast folded-paper trickster; paint deals 50% extra.',counter:'Paint and fast-firing weapons.',hp:.65,speed:1.55,armour:0,magicResist:.1,control:1.2,paint:1.5,colour:'#fff0bb'},
 {id:'moss',name:'Moss Golem',description:'Bulky moss armour softens both physical and magic hits.',counter:'Mark it to help the whole squad.',hp:1.7,speed:.62,armour:.25,magicResist:.25,control:.75,paint:1.1,colour:'#83bb82'},
 {id:'rubber',name:'Rubber Rascal',description:'Springy shell resists physical hits and half of paint damage.',counter:'Magic and freeze are effective.',hp:1,speed:1.2,armour:.3,magicResist:0,control:1,paint:.5,colour:'#f7c16e'},
 {id:'lantern',name:'Lantern Knight',description:'Armoured night guardian with balanced resistance.',counter:'Mix weapon types and upgrade.',hp:1.45,speed:.88,armour:.3,magicResist:.2,control:.7,paint:1,colour:'#ffdfa0'},
];
const neutral={...ENEMIES[0],hp:1,speed:1,armour:0,magicResist:0,control:1,paint:1};
export function enemyFor(wave:number,index:number,version=5):EnemyKind{if(version<5)return neutral;const unlocked=Math.min(ENEMIES.length,3+Math.floor((wave-1)/3));return ENEMIES[(index+Math.floor((wave-1)/10)*3)%unlocked];}
export function enemyDamage(amount:number,enemy:EnemyKind,category:string,dot=false){return Math.max(1,Math.round(amount*(dot?enemy.paint:1-(category==='magic'?enemy.magicResist:enemy.armour))));}
export function waveEnemies(wave:number){return [...new Map(Array.from({length:48},(_,i)=>{const e=enemyFor(wave,i);return[e.id,e] as const})).values()];}
