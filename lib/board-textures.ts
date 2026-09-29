import * as THREE from 'three';
import type {PathStyle} from './board-theme';
/** Small procedural textures for the 3D battlefield, generated from data so they also build outside a browser. */
function rand(x:number,y:number,seed=0){const s=Math.sin(x*127.1+y*311.7+seed*74.7)*43758.5453;return s-Math.floor(s);}
/** Tileable value noise with the given lattice period. */
function noise(x:number,y:number,period:number,seed=0){
 const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=(a:number)=>((a%period)+period)%period;
 const a=rand(w(xi),w(yi),seed),b=rand(w(xi+1),w(yi),seed),c=rand(w(xi),w(yi+1),seed),d=rand(w(xi+1),w(yi+1),seed);
 return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
}
function texture(size:number,fill:(x:number,y:number)=>[number,number,number,number],repeat=true){
 const data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const [r,g,b,a]=fill(x,y),i=(y*size+x)*4;data[i]=r;data[i+1]=g;data[i+2]=b;data[i+3]=a;}
 const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
 if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;}
 t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;
 return t;
}
const clamp=(v:number)=>Math.max(0,Math.min(255,Math.round(v)));
const grey=(v:number):[number,number,number,number]=>[clamp(v),clamp(v),clamp(v),255];
export function grassTexture(){
 const n=128;return texture(n,(x,y)=>{
  const broad=noise(x/16,y/16,8,1)*.55+noise(x/8,y/8,16,2)*.3+noise(x/3,y/3,43,3)*.15,blade=rand(x,y,4);
  const v=196+broad*48+(blade>.92?18:blade<.06?-16:0);
  // A touch of warmth in the light patches keeps the lawn from looking flat.
  return [clamp(v+broad*6),clamp(v+4),clamp(v-broad*10),255];
 });
}
export function pathTexture(style:PathStyle){
 const n=128;
 if(style==='flagstone')return texture(n,(x,y)=>{
  // Two courses of slabs per square, alternate rows offset by half a slab.
  const row=Math.floor(y/64),ox=(x+(row%2)*32)%128,col=Math.floor(ox/64),fx=ox%64,fy=y%64,edge=Math.min(fx,64-fx,fy,64-fy);
  const shade=rand(col,row,5)*26-13,grain=noise(x/6,y/6,21,6)*14;
  return grey(edge<2.2?120:edge<4?196+shade:222+shade+grain);
 });
 if(style==='cobble')return texture(n,(x,y)=>{
  const cell=21.33,gy=Math.floor(y/cell),gx=Math.floor((x+(gy%2)*cell/2)/cell),cx=(gx+.5)*cell-(gy%2)*cell/2,cy=(gy+.5)*cell;
  const d=Math.hypot(x-cx,y-cy)/(cell*.5),shade=rand(gx,gy,7)*34-17;
  return grey(d>.92?96:228+shade-d*d*40+noise(x/4,y/4,32,8)*10);
 });
 if(style==='tarmac')return texture(n,(x,y)=>{const r=rand(x,y,9);return grey(214+noise(x/10,y/10,13,10)*22+(r>.96?30:r<.04?-24:0));});
 return texture(n,(x,y)=>{
  const r=rand(x,y,11),pebble=noise(x/2.2,y/2.2,58,12);
  return grey(212+noise(x/12,y/12,11,13)*28+(pebble>.78?24:pebble<.2?-26:0)+(r>.97?20:0));
 });
}
export function swirlTexture(){
 const n=128;return texture(n,(x,y)=>{
  const dx=(x-n/2)/(n/2),dy=(y-n/2)/(n/2),r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
  const arm=.5+.5*Math.sin(a*3+r*9),core=Math.max(0,1-r*1.6),alpha=r>1?0:Math.pow(1-r,.55);
  return [clamp(150+arm*90+core*80),clamp(60+arm*60+core*160),clamp(210+core*45),clamp(alpha*(170+arm*85))];
 },false);
}
export function glowTexture(){
 const n=64;return texture(n,(x,y)=>{const r=Math.hypot(x-n/2+.5,y-n/2+.5)/(n/2),a=Math.max(0,1-r);return [255,255,255,clamp(a*a*255)];},false);
}
export function petalTexture(){
 const n=32;return texture(n,(x,y)=>{const dx=(x-n/2+.5)/(n*.45),dy=(y-n/2+.5)/(n*.26),r=Math.hypot(dx,dy);return [255,255,255,clamp(r<1?255*(1-Math.pow(r,6)):0)];},false);
}
/** A placement square: faint fill, bright rounded frame and a "+" in the middle, like the flat map. */
export function tileTexture(){
 const n=64;return texture(n,(x,y)=>{
  const cx=Math.abs(x-n/2+.5),cy=Math.abs(y-n/2+.5),edge=Math.max(cx,cy),corner=Math.hypot(Math.max(0,cx-22),Math.max(0,cy-22));
  const frame=edge>26&&edge<30.5&&corner<8.5,plus=(cx<1.8&&cy<8)||(cy<1.8&&cx<8);
  return [255,255,255,clamp(frame?235:plus?200:edge<27?50:0)];
 },false);
}
export function rippleTexture(){
 const n=128;return texture(n,(x,y)=>{const w=noise(x/9,y/5,14,14)*.6+noise(x/4,y/3,32,15)*.4,crest=Math.pow(w,6)*2.2;return [clamp(206+w*30+crest*60),clamp(220+w*24+crest*50),clamp(236+w*16+crest*20),255];});
}
