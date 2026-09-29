'use client';
import {useEffect,useRef,useState} from 'react';
import type {RigOutfit} from './rigged-hero';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

/** Procedural art study. Production roster models will use separately authored GLB assets. */
export default function Hero3D({skin,outfit,motion}:{skin:'fox'|'bear'|'rabbit';outfit:RigOutfit;motion:'idle'|'walk'|'attack'}) {
  const host=useRef<HTMLDivElement>(null);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const container=host.current;if(!container)return;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setFailed(true);return;}
    setFailed(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-label',`${skin} 3D outfit preview. Drag to rotate; scroll to zoom.`);
    renderer.domElement.setAttribute('role','img');container.appendChild(renderer.domElement);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(35,1,.1,30);camera.position.set(3,2.7,6);
    const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.35,0);controls.enablePan=false;controls.minDistance=3.8;controls.maxDistance=8;controls.maxPolarAngle=Math.PI*.56;controls.update();
    scene.add(new THREE.HemisphereLight(0xe5f5ff,0x55775b,2.5));
    const key=new THREE.DirectionalLight(0xffefdc,3.2);key.position.set(3,6,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
    const rim=new THREE.DirectionalLight(0xc2ddff,2);rim.position.set(-3,3,-2);scene.add(rim);
    const root=new THREE.Group();scene.add(root);
    const fur=skin==='fox'?0xd9873e:skin==='bear'?0xa87852:0xe8dfd4;
    const cream=0xffedda,green=0x216652,navy=0x263d50;
    const materials:THREE.Material[]=[];
    const mat=(color:number,metalness=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness:metalness?.3:.72,metalness});materials.push(m);return m;};
    function piece(parent:THREE.Object3D,geometry:THREE.BufferGeometry,color:number,pos:number[],scale=[1,1,1],metalness=0){const mesh=new THREE.Mesh(geometry,mat(color,metalness));mesh.position.set(pos[0],pos[1],pos[2]);mesh.scale.set(scale[0],scale[1],scale[2]);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
    const ball=(p:THREE.Object3D,c:number,pos:number[],scale:number[])=>piece(p,new THREE.SphereGeometry(1,32,24),c,pos,scale);
    const body=new THREE.Group();root.add(body);
    ball(body,fur,[0,1.2,0],[.39,.5,.26]);
    // Child-appropriate base shorts remain when no purchased bottom is selected.
    ball(body,navy,[0,.92,0],[.35,.23,.255]);
    if(outfit.top!=='none')ball(body,outfit.top==='shirt'?0xfffaf0:green,[0,1.25,0],[.404,.43,.278]);
    if(outfit.top==='shirt'){
      for(const x of [-1,1]){const collar=piece(body,new THREE.ConeGeometry(.105,.18,3),0xffffff,[x*.09,1.57,.24]);collar.rotation.z=x*.4;}
      for(const y of [1.15,1.3,1.44])ball(body,0xc1b79c,[0,y,.281],[.018,.018,.012]);
    }
    const legs:THREE.Group[]=[];const arms:THREE.Group[]=[];
    for(const side of [-1,1]){
      const leg=new THREE.Group();leg.position.set(side*.18,.92,0);body.add(leg);legs.push(leg);
      piece(leg,new THREE.CapsuleGeometry(.125,.35,8,16),outfit.bottom==='trousers'?navy:fur,[0,-.26,0]);
      ball(leg,0x243332,[0,-.58,.065],[.15,.105,.23]);
      const arm=new THREE.Group();arm.position.set(side*.38,1.48,0);body.add(arm);arms.push(arm);arm.rotation.z=side*.15;
      piece(arm,new THREE.CapsuleGeometry(.115,.23,8,16),outfit.top==='none'?fur:outfit.top==='shirt'?0xfffaf0:green,[0,-.18,0]);
      ball(arm,fur,[0,-.4,.01],[.12,.13,.12]);
    }
    if(outfit.bottom==='dress'){
      // A closed, pleated 3D shell around hips, with a broad hem clear of the legs.
      const geo=new THREE.CylinderGeometry(.345,.57,.52,64,8,false);
      const positions=geo.attributes.position;
      for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i),y=positions.getY(i);const r=Math.hypot(x,z);if(r>.1){const pleat=1+.035*Math.cos(Math.atan2(z,x)*16);positions.setXYZ(i,x*pleat,y,z*pleat);}}
      geo.computeVertexNormals();piece(body,geo,green,[0,.88,0],[1,1,.78]);
      piece(body,new THREE.TorusGeometry(.35,.025,8,64),0x173e34,[0,1.14,0],[1,.78,1]).rotation.x=Math.PI/2;
    }
    const head=new THREE.Group();head.position.y=1.92;body.add(head);
    ball(head,fur,[0,0,0],[.48,.44,.37]);
    for(const side of [-1,1]){
      if(skin==='rabbit'){
        const ear=ball(head,fur,[side*.23,.58,-.035],[.13,.43,.115]);ear.rotation.z=-side*.13;
        const inner=ball(head,0xeeb6ad,[side*.23,.6,.061],[.073,.32,.035]);inner.rotation.z=-side*.13;
      }else if(skin==='fox'){
        const ear=piece(head,new THREE.ConeGeometry(.22,.45,3),fur,[side*.3,.39,-.02]);ear.rotation.z=-side*.22;
        const inner=piece(head,new THREE.ConeGeometry(.13,.28,3),cream,[side*.3,.4,.085]);inner.rotation.z=-side*.22;
      }else{ball(head,fur,[side*.36,.35,-.035],[.2,.21,.11]);ball(head,cream,[side*.36,.35,.065],[.115,.125,.04]);}
      ball(head,cream,[side*.14,-.14,.29],[.195,.15,.14]);
      ball(head,0x26332e,[side*.17,.055,.336],[.048,.065,.027]);
      ball(head,0xffffff,[side*.17-.012,.076,.36],[.014,.018,.01]);
    }
    ball(head,skin==='rabbit'?0xcd8b8c:0x303531,[0,-.08,.425],[.065,.045,.045]);
    ball(head,0x5b423d,[0,-.18,.419],[.026,.021,.009]);
    if(outfit.hat){piece(head,new THREE.CylinderGeometry(.235,.235,.11,32),0xe8bd50,[0,.41,.025],[1,1,1],.65);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;piece(head,new THREE.ConeGeometry(.075,.18,4),0xf0c967,[Math.cos(a)*.2,.54,Math.sin(a)*.2+.025],[1,1,1],.65);}}
    if(outfit.scarf){piece(body,new THREE.TorusGeometry(.235,.07,12,40),0x57a9c8,[0,1.61,0],[1,.85,1]).rotation.x=Math.PI/2;piece(body,new THREE.CapsuleGeometry(.07,.26,8,12),0x57a9c8,[.16,1.4,.3],[1,1,.5]).rotation.z=-.18;}
    const floor=piece(scene,new THREE.CylinderGeometry(1,1.04,.12,64),0x47695d,[0,.1,0]);floor.receiveShadow=true;
    const resize=new ResizeObserver(()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});resize.observe(container);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');const start=performance.now();
    renderer.setAnimationLoop(()=>{const t=(performance.now()-start)/1000;const animate=!reduced.matches;
      body.position.y=animate?.012*Math.sin(t*2):0;
      legs.forEach((leg,i)=>{leg.rotation.x=animate&&motion==='walk'?Math.sin(t*5+i*Math.PI)*.27:0;});
      arms.forEach((arm,i)=>{arm.rotation.x=animate&&motion==='walk'?Math.sin(t*5+i*Math.PI+Math.PI)*.3:animate&&motion==='attack'&&i===1?-.8+Math.sin(t*5)*.7:0;});
      renderer.render(scene,camera);
    });
    return()=>{renderer.setAnimationLoop(null);resize.disconnect();controls.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
  },[skin,outfit.top,outfit.bottom,outfit.hat,outfit.scarf,motion]);
  return <div><div ref={host} style={{height:420,width:'100%',minWidth:220,background:'radial-gradient(ellipse at center, #42695c, #132f28)',borderRadius:20,touchAction:'none'}}/>{failed?<p>3D preview is unavailable on this device. Your hero and items are unchanged.</p>:<p>Drag to turn · scroll or pinch to zoom</p>}</div>;
}
