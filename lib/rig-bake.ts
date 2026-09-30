import * as THREE from 'three';
import {GeometryBatch} from './mesh-batch';
/** Rebuild a primitive with fewer segments. Battlefield characters are small, so full detail is wasted there. */
export function simplifyGeometry(g:THREE.BufferGeometry,detail:number):THREE.BufferGeometry{
 const s=(n:number,min:number)=>Math.max(min,Math.round(n*detail));
 if(detail>=1)return g;
 // Shapes that were bent or tapered after construction supply their own lower-detail rebuild.
 if(typeof g.userData.simplify==='function')return g.userData.simplify(detail) as THREE.BufferGeometry;
 // Small, already-coarse spheres (eye highlights, buttons) may go coarser still.
 if(g instanceof THREE.SphereGeometry){const p=g.parameters,small=p.widthSegments<=16;return new THREE.SphereGeometry(p.radius,s(p.widthSegments,small?6:8),s(p.heightSegments,small?4:6),p.phiStart,p.phiLength,p.thetaStart,p.thetaLength);}
 // Faceted cones (ears, beaks) keep their deliberate low segment counts.
 if(g instanceof THREE.ConeGeometry){const p=g.parameters;return p.radialSegments>8?new THREE.ConeGeometry(p.radius,p.height,s(p.radialSegments,8),1,p.openEnded,p.thetaStart,p.thetaLength):g;}
 if(g instanceof THREE.CylinderGeometry){const p=g.parameters;return p.radialSegments>8?new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom,p.height,s(p.radialSegments,8),1,p.openEnded,p.thetaStart,p.thetaLength):g;}
 if(g instanceof THREE.CapsuleGeometry){const p=g.parameters;return new THREE.CapsuleGeometry(p.radius,p.height,s(p.capSegments,2),s(p.radialSegments,6));}
 if(g instanceof THREE.TorusGeometry){const p=g.parameters;return new THREE.TorusGeometry(p.radius,p.tube,s(p.radialSegments,4),s(p.tubularSegments,8),p.arc);}
 if(g instanceof THREE.TubeGeometry){const p=g.parameters;return new THREE.TubeGeometry(p.path,s(p.tubularSegments,6),p.radius,s(p.radialSegments,4),p.closed);}
 // Smooth bodies and clothes: keep enough of the outline for the silhouette, fewer steps around.
 if(g instanceof THREE.LatheGeometry){const p=g.parameters,n=Math.max(8,Math.round(p.points.length*Math.max(detail,.5)));return new THREE.LatheGeometry(Array.from({length:n},(_,i)=>p.points[Math.round(i/(n-1)*(p.points.length-1))]),s(p.segments,10),p.phiStart,p.phiLength);}
 // Smooth bodies and clothes: keep enough of the outline for the silhouette, fewer steps around.
 if(g instanceof THREE.LatheGeometry){const p=g.parameters,n=Math.max(8,Math.round(p.points.length*Math.max(detail,.5)));return new THREE.LatheGeometry(Array.from({length:n},(_,i)=>p.points[Math.round(i/(n-1)*(p.points.length-1))]),s(p.segments,10),p.phiStart,p.phiLength);}
 return g;
}
export type RigTemplate<A extends unknown[]=never[]>={
 geometry:THREE.BufferGeometry;metal:THREE.BufferGeometry|null;glow:THREE.BufferGeometry|null;
 /** The original, now mesh-free hierarchy; its animation code poses every instance in turn. */
 joints:THREE.Object3D[];parents:number[];inverses:THREE.Matrix4[];
 extras:{joint:number;object:THREE.Object3D}[];triangles:number;radius:number;
 animate:(...args:A)=>void;dispose():void;
};
/**
 * Bakes every opaque mesh under `root` into one rigidly skinned geometry. Each part in `parts` becomes a bone;
 * meshes follow their nearest part ancestor. Parts must be direct children of the root or of another part.
 * Meshes flagged `userData.glow` go to an unlit geometry and `userData.metal` to a shiny one; transparent meshes
 * stay separate and ride their bone.
 */
export function bakeRig<A extends unknown[]>(root:THREE.Object3D,parts:THREE.Object3D[],animate:(...args:A)=>void,detail=.35):RigTemplate<A>{
 root.updateMatrixWorld(true);
 const joints=[root,...parts],index=new Map(joints.map((j,i)=>[j,i]));
 const parents=joints.map((j,i)=>{if(i===0)return -1;const p=index.get(j.parent!);if(p===undefined)throw new Error('Rig parts must hang directly from the root or another part.');return p;});
 const base=root.parent?root.parent.matrixWorld.clone().invert():new THREE.Matrix4(),lit=new GeometryBatch(),metal=new GeometryBatch(),glow=new GeometryBatch();
 const meshes:THREE.Mesh[]=[],extras:{joint:number;object:THREE.Object3D}[]=[];
 root.traverse(o=>{if((o as THREE.Mesh).isMesh&&o.visible)meshes.push(o as THREE.Mesh);});
 const owner=(o:THREE.Object3D)=>{let p=o.parent;while(p&&!index.has(p))p=p.parent;return p?index.get(p)!:0;};
 for(const mesh of meshes){
  const material=mesh.material as THREE.MeshStandardMaterial,joint=owner(mesh);
  if(material.transparent){
   const local=joints[joint].matrixWorld.clone().invert().multiply(mesh.matrixWorld);
   mesh.removeFromParent();local.decompose(mesh.position,mesh.quaternion,mesh.scale);extras.push({joint,object:mesh});continue;
  }
  const simple=simplifyGeometry(mesh.geometry,detail),matrix=base.clone().multiply(mesh.matrixWorld);
  (mesh.userData.glow?glow:mesh.userData.metal?metal:lit).add(simple,matrix,material.color,joint,material.side===THREE.DoubleSide);
  if(simple!==mesh.geometry)simple.dispose();
  mesh.removeFromParent();mesh.geometry.dispose();material.dispose();
 }
 const inverses=joints.map(j=>base.clone().multiply(j.matrixWorld).invert());
 const geometry=lit.build(true),metalGeometry=metal.vertexCount?metal.build(true):null,glowGeometry=glow.vertexCount?glow.build(true):null;
 return {geometry,metal:metalGeometry,glow:glowGeometry,joints,parents,inverses,extras,animate,triangles:lit.triangleCount+metal.triangleCount+glow.triangleCount,radius:geometry.boundingSphere!.radius,
  dispose(){geometry.dispose();metalGeometry?.dispose();glowGeometry?.dispose();for(const e of extras)e.object.traverse(o=>{if((o as THREE.Mesh).isMesh){(o as THREE.Mesh).geometry.dispose();((o as THREE.Mesh).material as THREE.Material).dispose();}});}};
}
export type RigMaterials={lit:THREE.Material;metal?:THREE.Material;glow?:THREE.Material};
export type RigInstance<A extends unknown[]=never[]>={root:THREE.Group;mesh:THREE.SkinnedMesh;metal:THREE.SkinnedMesh|null;glow:THREE.SkinnedMesh|null;bones:THREE.Bone[];extras:THREE.Object3D[];pose(...args:A):void;dispose():void};
/** A cheap copy of a baked template: shared geometry, its own skeleton and materials. */
export function instantiateRig<A extends unknown[]>(template:RigTemplate<A>,materials:RigMaterials):RigInstance<A>{
 const root=new THREE.Group(),bones=template.joints.map(()=>new THREE.Bone());
 template.joints.forEach((j,i)=>{const b=bones[i];b.position.copy(j.position);b.quaternion.copy(j.quaternion);b.scale.copy(j.scale);(template.parents[i]<0?root:bones[template.parents[i]]).add(b);});
 const skeleton=new THREE.Skeleton(bones,template.inverses.map(m=>m.clone()));
 const sphere=template.geometry.boundingSphere!.clone();sphere.radius*=1.25;
 const skin=(geometry:THREE.BufferGeometry,m:THREE.Material)=>{const mesh=new THREE.SkinnedMesh(geometry,m);root.add(mesh);mesh.bind(skeleton,new THREE.Matrix4());mesh.boundingSphere=sphere.clone();return mesh;};
 const mesh=skin(template.geometry,materials.lit),metal=template.metal?skin(template.metal,materials.metal??materials.lit):null,glow=template.glow?skin(template.glow,materials.glow??materials.lit):null;
 const extras=template.extras.map(e=>{const o=e.object.clone();o.traverse(c=>{if((c as THREE.Mesh).isMesh)(c as THREE.Mesh).material=((c as THREE.Mesh).material as THREE.Material).clone();});bones[e.joint].add(o);return o;});
 return {root,mesh,metal,glow,bones,extras,
  pose(...args:A){template.animate(...args);template.joints.forEach((j,i)=>{const b=bones[i];b.position.copy(j.position);b.quaternion.copy(j.quaternion);b.scale.copy(j.scale);});},
  dispose(){skeleton.dispose();for(const o of extras)o.traverse(c=>{if((c as THREE.Mesh).isMesh)((c as THREE.Mesh).material as THREE.Material).dispose();});root.removeFromParent();}};
}
