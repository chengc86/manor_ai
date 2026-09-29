import * as THREE from 'three';
/**
 * Collects many small coloured primitives into one vertex-coloured geometry, so a whole
 * character or a whole backdrop costs one draw call. Optionally records a joint per vertex
 * for rigid skinning.
 */
const tmpV=new THREE.Vector3(),tmpN=new THREE.Vector3(),tmpC=new THREE.Color(),normalMatrix=new THREE.Matrix3();
export type Tint=THREE.ColorRepresentation|((position:THREE.Vector3,normal:THREE.Vector3,out:THREE.Color)=>void);
export class GeometryBatch{
 positions:number[]=[];normals:number[]=[];colors:number[]=[];joints:number[]=[];indices:number[]=[];
 get vertexCount(){return this.positions.length/3;}
 get triangleCount(){return this.indices.length/3;}
 add(geometry:THREE.BufferGeometry,matrix:THREE.Matrix4,tint:Tint,joint=0,doubleSide=false){
  const position=geometry.attributes.position,normal=geometry.attributes.normal,base=this.vertexCount;
  const flip=matrix.determinant()<0,colour=typeof tint==='function'?null:tmpC.set(tint).clone();
  normalMatrix.getNormalMatrix(matrix);
  for(let i=0;i<position.count;i++){
   tmpV.fromBufferAttribute(position,i).applyMatrix4(matrix);
   if(normal)tmpN.fromBufferAttribute(normal,i).applyMatrix3(normalMatrix).normalize();else tmpN.set(0,1,0);
   this.positions.push(tmpV.x,tmpV.y,tmpV.z);this.normals.push(tmpN.x,tmpN.y,tmpN.z);
   if(colour)this.colors.push(colour.r,colour.g,colour.b);else{(tint as Exclude<Tint,THREE.ColorRepresentation>)(tmpV,tmpN,tmpC);this.colors.push(tmpC.r,tmpC.g,tmpC.b);}
   this.joints.push(joint);
  }
  const index=geometry.index,count=index?index.count:position.count,at=(k:number)=>base+(index?index.getX(k):k);
  for(let k=0;k+2<count;k+=3){
   // A mirrored transform reverses winding; swap two corners so faces still point outwards.
   if(flip)this.indices.push(at(k),at(k+2),at(k+1));else this.indices.push(at(k),at(k+1),at(k+2));
  }
  if(doubleSide){
   const back=this.vertexCount;
   for(let i=0;i<position.count;i++){const p=(base+i)*3;this.positions.push(this.positions[p],this.positions[p+1],this.positions[p+2]);this.normals.push(-this.normals[p],-this.normals[p+1],-this.normals[p+2]);this.colors.push(this.colors[p],this.colors[p+1],this.colors[p+2]);this.joints.push(joint);}
   for(let k=0;k+2<count;k+=3){const a=back+(at(k)-base),b=back+(at(k+1)-base),c=back+(at(k+2)-base);if(flip)this.indices.push(a,b,c);else this.indices.push(a,c,b);}
  }
  return this;
 }
 /** Adds a primitive placed by position, rotation (Euler, radians) and scale. */
 place(geometry:THREE.BufferGeometry,tint:Tint,position:ArrayLike<number>,rotation:ArrayLike<number>=[0,0,0],scale:ArrayLike<number>=[1,1,1],joint=0){
  const m=new THREE.Matrix4().compose(new THREE.Vector3(position[0],position[1],position[2]),new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation[0],rotation[1],rotation[2])),new THREE.Vector3(scale[0],scale[1],scale[2]));
  return this.add(geometry,m,tint,joint);
 }
 build(skinned=false){
  const g=new THREE.BufferGeometry(),n=this.vertexCount;
  g.setAttribute('position',new THREE.Float32BufferAttribute(this.positions,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(this.normals,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(this.colors,3));
  if(skinned){
   const index=new Uint16Array(n*4),weight=new Float32Array(n*4);
   for(let i=0;i<n;i++){index[i*4]=this.joints[i];weight[i*4]=1;}
   g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(index,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weight,4));
  }
  g.setIndex(n>65535?new THREE.Uint32BufferAttribute(this.indices,1):new THREE.Uint16BufferAttribute(this.indices,1));
  g.computeBoundingSphere();g.computeBoundingBox();
  return g;
 }
}
