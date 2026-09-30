import * as THREE from 'three';
/**
 * Building blocks for the procedural heroes: shared geometries and materials (disposed together), and helpers
 * that place features on curved surfaces. Everything is plain coloured meshes so the battlefield can bake it.
 */
export type V3=[number,number,number];
/** How a surface looks: soft fur and cloth, glossy toy plastic, eyes, metal, or unlit highlights. */
export type Finish='fur'|'skin'|'cloth'|'plastic'|'metal'|'eye'|'glow';
const ROUGHNESS:Record<Finish,number>={fur:.78,skin:.46,cloth:.88,plastic:.3,metal:.28,eye:.1,glow:1};
const Z=new THREE.Vector3(0,0,1);
export class Kit{
 private materials=new Map<string,THREE.Material>();private geometries=new Map<string,THREE.BufferGeometry>();private owned:THREE.BufferGeometry[]=[];
 mat(color:number,finish:Finish='fur',twoSided=false){
  const key=finish+color+(twoSided?'2':'');let m=this.materials.get(key);
  if(!m){m=finish==='glow'?new THREE.MeshBasicMaterial({color}):new THREE.MeshStandardMaterial({color,roughness:ROUGHNESS[finish],metalness:finish==='metal'?.8:0});m.userData.finish=finish;if(twoSided)m.side=THREE.DoubleSide;this.materials.set(key,m);}
  return m;
 }
 /** Swaps a mesh onto the double-sided version of its material (capes, skirts, open bands). */
 twoSided(mesh:THREE.Mesh){const m=mesh.material as THREE.MeshStandardMaterial;mesh.material=this.mat(m.color.getHex(),m.userData.finish as Finish,true);return mesh;}
 /** A geometry shared by every mesh that asks for the same key. */
 shared(key:string,make:()=>THREE.BufferGeometry){let g=this.geometries.get(key);if(!g){g=make();this.geometries.set(key,g);}return g;}
 sphere(detail=1){const w=Math.max(8,Math.round(32*detail)),h=Math.max(6,Math.round(22*detail));return this.shared(`s${w}`,()=>new THREE.SphereGeometry(1,w,h));}
 own<G extends THREE.BufferGeometry>(g:G){this.owned.push(g);return g;}
 mesh(parent:THREE.Object3D,geometry:THREE.BufferGeometry,color:number,finish:Finish,pos:V3=[0,0,0],scale:V3=[1,1,1],rot:V3=[0,0,0]){
  const m=new THREE.Mesh(geometry,this.mat(color,finish));m.position.set(...pos);m.scale.set(...scale);m.rotation.set(...rot);
  m.castShadow=m.receiveShadow=finish!=='glow';if(finish==='metal')m.userData.metal=true;if(finish==='glow')m.userData.glow=true;parent.add(m);return m;
 }
 /** An ellipsoid: the workhorse of soft, rounded characters. */
 ball(parent:THREE.Object3D,color:number,pos:V3,scale:V3,finish:Finish='fur',rot:V3=[0,0,0],detail=1){return this.mesh(parent,this.sphere(detail),color,finish,pos,scale,rot);}
 dispose(){this.geometries.forEach(g=>g.dispose());this.owned.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());}
}
/** A point on an ellipsoid's front (+z) surface at (x, y), with its outward normal, optionally lifted along it. */
export function onEllipsoid(r:V3,x:number,y:number,lift=0){
 const [rx,ry,rz]=r,k=Math.max(0,1-(x/rx)**2-(y/ry)**2),z=rz*Math.sqrt(k);
 const n=new THREE.Vector3(x/(rx*rx),y/(ry*ry),z/(rz*rz)).normalize();
 return {p:new THREE.Vector3(x,y,z).addScaledVector(n,lift),n};
}
/** A group sitting on a surface point, its +z facing out of the surface and its +y kept as close to "up" as possible. */
export function surfaceFrame(parent:THREE.Object3D,p:THREE.Vector3,n:THREE.Vector3,roll=0){
 const g=new THREE.Group();g.position.copy(p);
 const up=new THREE.Vector3(0,1,0),x=new THREE.Vector3().crossVectors(up,n);
 if(x.lengthSq()<1e-6)g.quaternion.setFromUnitVectors(Z,n);else{x.normalize();const y=new THREE.Vector3().crossVectors(n,x);g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,n));}
 if(roll)g.rotateZ(roll);parent.add(g);return g;
}
/** A smooth solid of revolution from (radius, height) control points. */
export function lathe(points:[number,number][],segments=28,samples=22){
 const curve=new THREE.SplineCurve(points.map(([r,y])=>new THREE.Vector2(r,y)));
 return new THREE.LatheGeometry(curve.getPoints(samples).map(v=>new THREE.Vector2(Math.max(0,v.x),v.y)),segments);
}
/** A flat outline with soft bevelled edges, extruded towards +z and centred on its thickness. */
export function slab(shape:THREE.Shape,depth:number,bevel=depth*.4,curveSegments=7,bevelSegments=2):THREE.BufferGeometry{
 const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments,curveSegments,steps:1});
 g.translate(0,0,-depth/2);g.computeVertexNormals();
 g.userData.simplify=(detail:number)=>slab(shape,depth,bevel,Math.max(2,Math.round(curveSegments*detail)),1);return g;
}
/** Rounded-triangle outline for ears, horns, leaves and fins: base width w, height h, tip roundness. */
export function earShape(w:number,h:number,round=.35){
 const s=new THREE.Shape();s.moveTo(-w/2,0);s.quadraticCurveTo(-w*round,h*.75,0,h);s.quadraticCurveTo(w*round,h*.75,w/2,0);s.quadraticCurveTo(0,-h*.08,-w/2,0);return s;
}
/** Rectangle outline with rounded corners, centred on the origin. */
export function roundedRect(w:number,h:number,r:number){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
/** A box with soft, rounded edges: overall width × height × depth (depth along z). */
export function softBox(kit:Kit,w:number,h:number,d:number,round=.12){const b=Math.min(.06,d/4);return kit.shared(`box${w}:${h}:${d}:${round}`,()=>slab(roundedRect(w-2*b,h-2*b,Math.max(.01,round-b)),d-2*b,b));}
/** Leaf / petal outline pointing up. */
export function leafShape(w:number,h:number){
 const s=new THREE.Shape();s.moveTo(0,0);s.bezierCurveTo(w*.62,h*.18,w*.52,h*.78,0,h);s.bezierCurveTo(-w*.52,h*.78,-w*.62,h*.18,0,0);return s;
}
/** Five-pointed star outline. */
export function starShape(outer:number,inner:number,points=5){
 const s=new THREE.Shape();for(let i=0;i<points*2;i++){const a=i/(points*2)*Math.PI*2,r=i%2?inner:outer,x=Math.sin(a)*r,y=Math.cos(a)*r;if(i)s.lineTo(x,y);else s.moveTo(x,y);}s.closePath();return s;
}
/**
 * A soft tube along points, with a radius that can change along its length (fluffy tails, horns, antennae).
 * Returned as a plain geometry: the battlefield rebuilds real TubeGeometry from its parameters, which would lose the taper.
 */
export function taperedTube(points:V3[],radius:(t:number)=>number,segments=24,radial=12):THREE.BufferGeometry{
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
 const g=new THREE.TubeGeometry(curve,segments,1,radial,false),pos=g.attributes.position,c=new THREE.Vector3(),v=new THREE.Vector3();
 for(let i=0;i<=segments;i++){const t=i/segments,r=radius(t);curve.getPointAt(t,c);for(let j=0;j<=radial;j++){const k=i*(radial+1)+j;v.fromBufferAttribute(pos,k).sub(c).multiplyScalar(r);pos.setXYZ(k,c.x+v.x,c.y+v.y,c.z+v.z);}}
 g.computeVertexNormals();const plain=new THREE.BufferGeometry().copy(g);g.dispose();
 plain.userData.simplify=(detail:number)=>taperedTube(points,radius,Math.max(4,Math.round(segments*detail)),Math.max(5,Math.round(radial*detail)));return plain;
}
/** Mixes two colours: t=0 gives a, t=1 gives b. */
export function mix(a:number,b:number,t:number){return new THREE.Color(a).lerp(new THREE.Color(b),t).getHex();}
export function shade(c:number,amount:number){return amount<0?mix(c,0x000000,-amount):mix(c,0xffffff,amount);}
