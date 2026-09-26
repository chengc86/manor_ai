export const BASE_WAYPOINTS=[[0,3],[20,3],[20,6],[3,6],[3,10],[18,10],[18,14],[7,14],[7,16],[20,16]];
const cache=new Map<number,ReturnType<typeof build>>();
function build(chapter:number){const i=Math.max(0,chapter-4),right=20-i%3,left=3+Math.floor(i/6)%3,mid=18-Math.floor(i/2)%3,lower=7+Math.floor(i/9)%3,row=6+Math.floor(i/3)%2;
 const waypoints=chapter<=3?BASE_WAYPOINTS:[[0,3],[right,3],[right,row],[left,row],[left,10],[mid,10],[mid,14],[lower,14],[lower,16],[20,16]];
 const path:{x:number;y:number}[]=[];for(let j=0;j<waypoints.length-1;j++){let[x,y]=waypoints[j];const[tx,ty]=waypoints[j+1];while(x!==tx||y!==ty){path.push({x:x+.5,y:y+.5});x+=Math.sign(tx-x);y+=Math.sign(ty-y)}}path.push({x:20.5,y:16.5});
 return{waypoints,path,cells:new Set(path.map(p=>Math.floor(p.y)*24+Math.floor(p.x)))};
}
export function mapLayout(wave=1,version=5){const chapter=version<5?1:Math.min(30,Math.floor((wave-1)/10)+1);if(!cache.has(chapter))cache.set(chapter,build(chapter));return cache.get(chapter)!;}
