export const ACCESSORIES = [
 {id:'classic',name:'Emerald bow',price:0,image:'bow'},
 {id:'moonlight',name:'Moonlight bow tie',price:0,image:'bow-tie'},
 {id:'sunset',name:'Emerald pendant',price:80,image:'necklace'},
 {id:'royal',name:'Manor crown',price:120,image:'crown'},
 {id:'stars',name:'Star clips',price:60,image:'earrings'},
 {id:'tie',name:'Great Manor tie',price:40,image:'tie'},
 {id:'cuff',name:'Guardian bracelet',price:60,image:'bracelet'},
] as const;
export function accessory(id:string){return ACCESSORIES.find(a=>a.id===id)??ACCESSORIES[0]}
export const UNIFORMS=[{id:'winter',name:'Manor winter uniform',price:0},{id:'summer',name:'Manor summer uniform',price:60},{id:'sports',name:'Manor sports kit',price:80}] as const;
