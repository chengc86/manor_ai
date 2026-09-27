export const BASE_WAYPOINTS=[[0,3],[20,3],[20,6],[3,6],[3,10],[18,10],[18,14],[7,14],[7,16],[20,16]];
// Hand-designed routes, one per chapter in turn from World.routeFrom onwards, so the path changes at every new chapter.
// Each enters on the left edge and ends at The Manor. They were tuned in the battle simulator so the same squad defeats
// a similar share of monsters as on the original route (checked in tests/chapters-enemies.cjs): a new layout changes
// where heroes should stand, not how hard the chapter is.
export const ROUTES=[
 [[0,5],[3,5],[3,14],[7,14],[7,5],[11,5],[11,14],[15,14],[15,5],[19,5],[19,16],[20,16]],
 [[0,3],[21,3],[21,6],[18,6],[18,13],[15,13],[15,6],[12,6],[12,13],[9,13],[9,6],[6,6],[6,13],[3,13],[3,16],[20,16]],
 [[0,14],[18,14],[18,11],[3,11],[3,8],[18,8],[18,5],[3,5],[3,3],[21,3],[21,16],[20,16]],
 [[0,6],[3,6],[3,13],[7,13],[7,6],[11,6],[11,13],[14,13],[14,4],[21,4],[21,8],[17,8],[17,11],[21,11],[21,16],[20,16]],
 [[0,5],[3,5],[3,3],[7,3],[7,5],[11,5],[11,3],[15,3],[15,5],[21,5],[21,9],[17,9],[17,11],[13,11],[13,9],[9,9],[9,11],[5,11],[5,9],[2,9],[2,14],[6,14],[6,16],[10,16],[10,14],[14,14],[14,16],[20,16]],
 [[0,10],[4,10],[4,3],[21,3],[21,7],[9,7],[9,13],[21,13],[21,16],[20,16]],
 [[0,3],[2,3],[2,9],[6,9],[6,3],[10,3],[10,9],[14,9],[14,3],[18,3],[18,9],[21,9],[21,12],[3,12],[3,15],[20,15]],
 [[0,3],[9,3],[9,7],[2,7],[2,11],[9,11],[9,14],[12,14],[12,4],[15,4],[15,14],[18,14],[18,4],[21,4],[21,16],[20,16]],
 [[0,3],[20,3],[20,6],[2,6],[2,15],[5,15],[5,9],[9,9],[9,15],[12,15],[12,9],[16,9],[16,16],[20,16]],
];
function legacy(chapter:number){const i=Math.max(0,chapter-4),right=20-i%3,left=3+Math.floor(i/6)%3,mid=18-Math.floor(i/2)%3,lower=7+Math.floor(i/9)%3,row=6+Math.floor(i/3)%2;
 return chapter<=3?BASE_WAYPOINTS:[[0,3],[right,3],[right,row],[left,row],[left,10],[mid,10],[mid,14],[lower,14],[lower,16],[20,16]];
}
function trace(waypoints:number[][]){const path:{x:number;y:number}[]=[];for(let j=0;j<waypoints.length-1;j++){let[x,y]=waypoints[j];const[tx,ty]=waypoints[j+1];while(x!==tx||y!==ty){path.push({x:x+.5,y:y+.5});x+=Math.sign(tx-x);y+=Math.sign(ty-y)}}const[x,y]=waypoints[waypoints.length-1];path.push({x:x+.5,y:y+.5});
 return{waypoints,path,cells:new Set(path.map(p=>Math.floor(p.y)*24+Math.floor(p.x)))};
}
const cache=new Map<string,ReturnType<typeof trace>>();
function cached(key:string,waypoints:()=>number[][]){if(!cache.has(key))cache.set(key,trace(waypoints()));return cache.get(key)!;}
// Battles carry their own route, so a fight in progress never changes shape.
export function routeLayout(waypoints:number[][]){return cached(waypoints.join(';'),()=>waypoints);}
export function mapLayout(wave=1,version=5,routeFrom=Infinity){const chapter=Math.floor((wave-1)/10)+1;if(version>=5&&chapter>=routeFrom){const i=(chapter-routeFrom)%ROUTES.length;return cached('route'+i,()=>ROUTES[i]);}const old=version<5?1:Math.min(30,chapter);return cached('chapter'+old,()=>legacy(old));}
