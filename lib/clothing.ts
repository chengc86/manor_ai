export const CLOTHING_SLOTS=[{id:'top',name:'Shirts & dresses'},{id:'outer',name:'Jumpers & cardigans'},{id:'bottom',name:'Trousers, shorts & skirts'},{id:'tie',name:'School tie'},{id:'feet',name:'Shoes'}] as const;
export type ClothingSlot=typeof CLOTHING_SLOTS[number]['id'];
export type Wardrobe=Partial<Record<ClothingSlot,string>>;
export const CLOTHING=[
{id:'shirt',name:'White shirt',slot:'top',price:40,art:0},
{id:'blouse',name:'White blouse',slot:'top',price:40,art:1},
{id:'polo',name:'Summer polo',slot:'top',price:40,art:2},
{id:'sports-top',name:'Sports polo',slot:'top',price:40,art:3},
{id:'dress',name:'Summer leaf dress',slot:'top',price:80,art:4},
{id:'jumper',name:'Green jumper',slot:'outer',price:60,art:5},
{id:'cardigan',name:'Green cardigan',slot:'outer',price:60,art:6},
{id:'trousers',name:'Grey trousers',slot:'bottom',price:40,art:7},
{id:'shorts',name:'Grey shorts',slot:'bottom',price:40,art:8},
{id:'skirt',name:'Grey skirt',slot:'bottom',price:40,art:9},
{id:'sports-shorts',name:'Sports shorts',slot:'bottom',price:40,art:10},
{id:'skort',name:'Sports skort',slot:'bottom',price:40,art:11},
{id:'school-tie',name:'Green school tie',slot:'tie',price:20,art:12},
{id:'school-shoes',name:'Black school shoes',slot:'feet',price:40,art:13},
{id:'trainers',name:'Sports trainers',slot:'feet',price:60,art:14},
] as const;
export function wear(clothing:Wardrobe,id:string):Wardrobe{const item=CLOTHING.find(c=>c.id===id);if(!item)return clothing;const next={...clothing,[item.slot]:id};if(id==='dress'){delete next.bottom;delete next.outer;delete next.tie;}else if((item.slot==='bottom'||item.slot==='outer')&&next.top==='dress')delete next.top;return next;}
export function uniformPieces(uniform:string,gender?:string){if(uniform==='winter')return gender==='girl'?['blouse','cardigan','skirt','school-shoes']:['shirt','jumper','trousers','school-tie','school-shoes'];if(uniform==='summer')return gender==='girl'?['dress','school-shoes']:['polo','shorts','school-shoes'];if(uniform==='sports')return ['sports-top',gender==='girl'?'skort':'sports-shorts','trainers'];return [];}
export function ensureWardrobe(p:{clothing?:Wardrobe;clothingOwned?:string[];uniforms?:string[];uniform?:string;gender?:string}){if(p.clothingOwned)return;p.clothingOwned=[...new Set((p.uniforms??[]).flatMap(u=>uniformPieces(u,p.gender)))];p.clothing={};for(const id of uniformPieces(p.uniform??'none',p.gender))if(p.clothingOwned.includes(id))p.clothing=wear(p.clothing,id);}
