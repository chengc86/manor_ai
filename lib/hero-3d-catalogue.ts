import {EXTRA_HEROES} from './hero-catalogue';
/** Chosen hero art catalogue, using existing stable hero IDs. No player records belong here. */
const CHOSEN_HEROES = [
  {id:16,name:'Tumble',skin:'capybara',kind:'Capybara'},
  {id:19,name:'Pebble',skin:'penguin',kind:'Penguin'},
  {id:21,name:'Acorn',skin:'deer',kind:'Red deer'},
  {id:10,name:'Scout',skin:'raccoon',kind:'Raccoon'},
  {id:14,name:'Bamboo',skin:'panda',kind:'Panda'},
  {id:15,name:'Leo',skin:'lion',kind:'Lion'},
  {id:37,name:'Saffron',skin:'tiger',kind:'Tiger cub'},
  {id:43,name:'Truffle',skin:'pig',kind:'Piglet'},
  {id:1,name:'Luna',skin:'cat',kind:'Cat'},
  {id:2,name:'Flint',skin:'bear',kind:'Bear'},
  {id:3,name:'Tempest',skin:'owl',kind:'Snowy owl'},
  {id:4,name:'Pip',skin:'rabbit',kind:'Rabbit'},
  {id:6,name:'Ember',skin:'dragon',kind:'Green dragon'},
  {id:11,name:'Briar',skin:'hedgehog',kind:'Hedgehog'},
  {id:12,name:'Hazel',skin:'squirrel',kind:'Squirrel'},
  {id:13,name:'Brook',skin:'otter',kind:'Otter'},
  {id:29,name:'Waddle',skin:'duck',kind:'Duck'},
  {id:30,name:'Poppy',skin:'redpanda',kind:'Red panda'},
  {id:31,name:'Sunny',skin:'meerkat',kind:'Meerkat'},
  {id:35,name:'Biscuit',skin:'corgi',kind:'Corgi'},
  {id:36,name:'Marble',skin:'snowleopard',kind:'Snow leopard'},
  {id:69,name:'Cinder',skin:'cinder',kind:'Dragon'},
  {id:82,name:'Glade',skin:'guardian',kind:'Moss guardian'},
] as const;
export type Hero3DSkin=string;
const slug=(kind:string)=>kind.toLowerCase().replace(/[^a-z0-9]+/g,'-');
const base=[{id:0,name:'Bramble',skin:'fox',kind:'Fox'},{id:5,name:'Rowan',skin:'badger',kind:'Badger'},{id:9,name:'Ash',skin:'wolf',kind:'Wolf'}];
// Heroes that share a kind with another hero but look different in their 2D art get their own skin.
const DISTINCT:Record<number,string>={34:'tuxedo-cat',39:'brown-owl',70:'mint-dragon',77:'teal-alien'};
export const HERO_3D_STUDIES=[...CHOSEN_HEROES,...base,...EXTRA_HEROES.filter(h=>!CHOSEN_HEROES.some(c=>c.id===h.id)).map(h=>({...h,skin:DISTINCT[h.id]??slug(h.kind)}))].sort((a,b)=>a.id-b.id);
export const hero3D=(id:number)=>HERO_3D_STUDIES.find(h=>h.id===id);
export function heroModelProfile(skin:string){
 const palette=[0x81a9b0,0xd2a76e,0xad8fb7,0x88ad7b,0xd9917c,0x8fa4cf];
 const speciesColours:Record<string,number>={'axolotl':0xdda9bb,'tortoise':0x73986a,'frog':0x94b65d,'koala':0x9babb1,'seahorse':0xe1b16c,'seal':0x9aaebd,'dolphin':0x7ba8c8,'fennec-fox':0xd9bf94,'alpaca':0xded2bc,'sloth':0xa79b82,'kiwi-bird':0x9d7956,'parrot':0x86ad62,'hippo':0xa8a6bf,'mouse':0xb1a8b5,'honeybee':0xe2bc55,'ladybird':0x6e705f,'crocodile':0x7f9e61,'toucan':0x405762,'pumpkin-sprite':0xdb9b4f,'strawberry-sprite':0xd87578,'orange-sprite':0xe6af53,'coconut-sprite':0xa38766,'pepper-sprite':0xb37469,'star-sprite':0xf0d37e,'sun-sprite':0xf0c264,'moon-sprite':0xc5cbe1,'cloud-sprite':0xdde9e9,'raindrop-sprite':0x92bfd8,'forest-sprite':0x7d9f66,'seedling-sprite':0x97b979,'wooden-robot':0xb38d64,'wooden-puppet':0xbd9672,'round-robot':0x94b2bd,'waffle-pal':0xcda86f,'rice-cake-sprite':0xe4d4cb};
 const colour=speciesColours[skin]??palette[[...skin].reduce((a,c)=>a+c.charCodeAt(0),0)%palette.length];
 return {colour,kind:skin,robot:/robot|clockwork|puppet/.test(skin),plant:/sprite|guardian/.test(skin),toy:/pal|patchwork|fabric|plush/.test(skin)};
}
