export type RoutePoint={x:number;y:number};
// Round only the visual corner, keeping the shared combat rules unchanged.
export function visualPosition(progress:number,path:RoutePoint[]):RoutePoint{
 const distance=Math.max(0,Math.min(path.length-1,progress*(path.length-1))),corner=Math.round(distance),radius=.35;
 if(corner>0&&corner<path.length-1&&Math.abs(distance-corner)<radius){
  const a=path[corner-1],b=path[corner],c=path[corner+1];
  if((b.x-a.x)!==(c.x-b.x)||(b.y-a.y)!==(c.y-b.y)){
   const t=(distance-corner+radius)/(radius*2),u=1-t;
   const start={x:b.x+(a.x-b.x)*radius,y:b.y+(a.y-b.y)*radius},end={x:b.x+(c.x-b.x)*radius,y:b.y+(c.y-b.y)*radius};
   return{x:u*u*start.x+2*u*t*b.x+t*t*end.x,y:u*u*start.y+2*u*t*b.y+t*t*end.y};
  }
 }
 const i=Math.min(path.length-2,Math.floor(distance)),f=distance-i;return{x:path[i].x+(path[i+1].x-path[i].x)*f,y:path[i].y+(path[i+1].y-path[i].y)*f};
}
/** Direction of travel as a yaw angle: 0 faces down the board (+y), π/2 faces right. */
export function visualHeading(progress:number,path:RoutePoint[]){
 const step=.5/Math.max(1,path.length-1),a=visualPosition(progress-step,path),b=visualPosition(progress+step,path);
 return Math.atan2(b.x-a.x,b.y-a.y);
}
