'use client';
import {useEffect,useRef,useState} from 'react';
import type {Hero3DSkin} from '../lib/hero-3d-catalogue';
import type {RigOutfit} from './rigged-hero';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

/** Procedural art study. Production roster models will use separately authored GLB assets. */
export default function Hero3D({skin,outfit,motion}:{skin:Hero3DSkin;outfit:RigOutfit;motion:'idle'|'walk'|'attack'}) {
  const host=useRef<HTMLDivElement>(null);
  const viewpoint=useRef<[number,number,number]>([1.8,2.5,5.8]);
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
    const camera=new THREE.PerspectiveCamera(35,1,.1,30);camera.position.set(...viewpoint.current);
    const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.35,0);controls.enablePan=false;controls.minDistance=3.8;controls.maxDistance=8;controls.maxPolarAngle=Math.PI*.56;controls.update();
    scene.add(new THREE.HemisphereLight(0xe5f5ff,0x55775b,2.5));
    const key=new THREE.DirectionalLight(0xffefdc,3.2);key.position.set(3,6,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
    const rim=new THREE.DirectionalLight(0xc2ddff,2);rim.position.set(-3,3,-2);scene.add(rim);
    const root=new THREE.Group();scene.add(root);
    const fur=({fox:0xd9873e,bear:0xa87852,rabbit:0xe8dfd4,capybara:0xa67c52,penguin:0x293d4d,deer:0xbb7746,raccoon:0x8c9294,panda:0xf5eee1,lion:0xd7a04f,tiger:0xe59a43,pig:0xeeb1ad,cat:0x839fbc,owl:0xe9e8df,dragon:0x79a64c,hedgehog:0xb99773,squirrel:0xb66a39,otter:0x88634e,duck:0xf5d77b,redpanda:0xb95936,meerkat:0xc6a773,corgi:0xcf9257,snowleopard:0xc9d3d6,cinder:0xb86762,guardian:0x64804f})[skin];
    const bird=['penguin','owl','duck'].includes(skin);
    const dragon=['dragon','cinder'].includes(skin);
    const masked=['panda','raccoon','meerkat','redpanda'].includes(skin);
    const cream=0xffedda,green=0x216652,navy=0x263d50;
    const materials:THREE.Material[]=[];
    const mat=(color:number,metalness=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness:metalness?.3:.72,metalness});materials.push(m);return m;};
    function piece(parent:THREE.Object3D,geometry:THREE.BufferGeometry,color:number,pos:number[],scale=[1,1,1],metalness=0){const mesh=new THREE.Mesh(geometry,mat(color,metalness));mesh.position.set(pos[0],pos[1],pos[2]);mesh.scale.set(scale[0],scale[1],scale[2]);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
    const ball=(p:THREE.Object3D,c:number,pos:number[],scale:number[])=>piece(p,new THREE.SphereGeometry(1,32,24),c,pos,scale);
    const body=new THREE.Group();root.add(body);root.position.y=-.08;
    ball(body,fur,[0,1.2,0],[.39,.5,.26]);
    // Child-appropriate base shorts remain when no purchased bottom is selected.
    ball(body,navy,[0,.92,0],[.35,.23,.255]);
    if(outfit.top!=='none'){
      ball(body,outfit.top==='shirt'?0xfffaf0:green,[0,1.25,0],[.404,.43,.278]);
      piece(body,new THREE.CylinderGeometry(.35,.35,.17,40),outfit.top==='shirt'?0xfffaf0:green,[0,1.02,0],[1,1,.76]);
    }
    if(outfit.top==='shirt'){
      for(const x of [-1,1]){const collar=piece(body,new THREE.ConeGeometry(.105,.18,3),0xffffff,[x*.09,1.57,.24]);collar.rotation.z=x*.4;}
      for(const y of [1.15,1.3,1.44])ball(body,0xc1b79c,[0,y,.281],[.018,.018,.012]);
    }
    const legs:THREE.Group[]=[];const arms:THREE.Group[]=[];
    for(const side of [-1,1]){
      const leg=new THREE.Group();leg.position.set(side*.18,.92,0);body.add(leg);legs.push(leg);
      piece(leg,new THREE.CapsuleGeometry(.125,.35,8,16),outfit.bottom==='trousers'?navy:fur,[0,-.26,0]);
      ball(leg,0x243332,[0,-.58,.065],[.15,.105,.23]);
      const arm=new THREE.Group();arm.position.set(side*.38,1.48,0);body.add(arm);arms.push(arm);arm.rotation.z=side*(outfit.bottom==='dress'?.3:.15);
      piece(arm,new THREE.CapsuleGeometry(.115,.23,8,16),outfit.top==='none'?fur:outfit.top==='shirt'?0xfffaf0:green,[0,-.18,0]);
      ball(arm,skin==='panda'?0x293333:fur,[0,-.4,.01],[.12,.13,.12]);
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
    ball(head,fur,[0,0,0],skin==='capybara'?[.5,.38,.4]:[.48,.44,.37]);
    if(skin==='lion'){
      for(let i=0;i<14;i++){const a=i*Math.PI*2/14;ball(head,0x8c4b2d,[Math.cos(a)*.43,Math.sin(a)*.43,-.1],[.19,.2,.2]);}
      ball(head,fur,[0,0,.05],[.43,.4,.34]);
    }
    if(bird){
      for(const side of [-1,1])ball(head,cream,[side*.16,-.025,.275],[.21,.3,.12]);
      if(skin==='duck')ball(head,0xe7a444,[0,-.135,.405],[.18,.065,.17]);
      else {const beak=piece(head,new THREE.ConeGeometry(.11,.23,4),skin==='owl'?0x7f6545:0xf1b346,[0,-.12,.45]);beak.rotation.x=Math.PI/2;}
    }
    if(skin==='capybara')ball(head,0xbc9568,[0,-.13,.32],[.34,.21,.21]);
    if(skin==='pig'){
      ball(head,0xd98e93,[0,-.1,.38],[.18,.115,.095]);
      for(const x of [-.065,.065])ball(head,0x96545d,[x,-.1,.469],[.027,.038,.01]);
      const curl=new THREE.CurvePath<THREE.Vector3>();
      const pts=Array.from({length:49},(_,i)=>{const t=i/48*Math.PI*3;return new THREE.Vector3(Math.cos(t)*.075,.87+Math.sin(t)*.075,-.25-i/48*.18)});
      curl.add(new THREE.CatmullRomCurve3(pts));piece(body,new THREE.TubeGeometry(curl,48,.025,8,false),fur,[0,0,0]);
    }
    if(skin==='raccoon'||skin==='redpanda'){
      const tail=ball(body,skin==='redpanda'?0xb95936:0x767c80,[0,1,-.43],[.15,.16,.47]);tail.rotation.x=-.35;
      for(let i=0;i<4;i++)ball(body,0x343b40,[0,.88+i*.06,-.35-i*.16],[.155,.14,.055]);
    }
    function tube(parent:THREE.Object3D,points:number[][],radius:number,color:number){
      return piece(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p as [number,number,number]))),24,radius,8,false),color,[0,0,0]);
    }
    if(['cat','snowleopard','otter','squirrel','meerkat'].includes(skin)){
      tube(body,[[0,.9,-.22],[.18,.8,-.48],[.43,1,-.57],[.45,1.38,-.46]],skin==='squirrel'?.19:skin==='otter'?.11:.085,fur);
    }
    if(skin==='otter')for(const side of [-1,1])for(let i=0;i<3;i++){
      tube(head,[[side*.18,-.13-i*.025,.408],[side*.31,-.12-i*.035,.415],[side*.38,-.1-i*.045,.4]],.004,0xe8daca);
    }
    if(skin==='owl')for(let i=0;i<7;i++)ball(head,0xa9a599,[(i-3)*.065,.335+Math.cos(i)*.022,.22],[.015,.029,.012]);
    if(skin==='corgi'||skin==='redpanda')ball(head,cream,[0,.19,.337],[.07,.21,.032]);
    if(skin==='snowleopard'){
      for(const side of [-1,1])for(let i=0;i<5;i++){
        const a=i*.45;ball(head,0x637076,[side*(.29+.075*Math.sin(a)),.22-i*.075,.25],[.028,.037,.018]);
      }
      for(let i=0;i<4;i++)ball(head,0x637076,[(i-1.5)*.09,.365,.205],[.025,.02,.025]);
    }
    if(skin==='hedgehog'){
      for(let row=0;row<3;row++)for(let i=0;i<9;i++){
        const a=i/8*Math.PI, x=Math.cos(a)*(.43-row*.055), y=Math.sin(a)*.38;
        const spike=piece(head,new THREE.ConeGeometry(.085,.23,5),0x6c4833,[x,y,-.14-row*.09]);spike.rotation.z=a-Math.PI/2;
      }
    }
    if(dragon){
      for(const side of [-1,1]){
        const horn=piece(head,new THREE.ConeGeometry(.08,.32,12),0xe9d6a2,[side*.29,.43,-.08]);horn.rotation.z=-side*.28;
        const shape=new THREE.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(.2,.52,.65,.57);shape.lineTo(.52,.23);shape.lineTo(.65,.03);shape.lineTo(.33,.12);shape.lineTo(.18,-.06);shape.closePath();
        const wing=piece(body,new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSize:.02,bevelThickness:.015,bevelSegments:2,steps:1}),skin==='cinder'?0xddb17d:0xb6ce79,[side*.27,1.03,-.28],[side,1,1]);wing.rotation.y=side*.25;
      }
      tube(body,[[0,.9,-.25],[.12,.7,-.58],[.42,.72,-.74],[.58,1.02,-.64]],.09,fur);
      ball(head,fur,[0,-.15,.32],[.24,.15,.18]);
      for(const x of [-.09,.09])ball(head,0x476345,[x,-.075,.477],[.02,.013,.012]);
    }
    if(skin==='guardian'){
      for(let i=0;i<9;i++){const a=i/9*Math.PI*2;ball(head,i%2?0x49623b:0x809854,[Math.cos(a)*.42,Math.sin(a)*.39,-.08],[.16,.15,.16]);}
      for(const side of [-1,1]){
        const leaf=ball(head,0x94ba58,[side*.27,.44,0],[.105,.25,.04]);leaf.rotation.z=-side*.5;
        tube(head,[[side*.28,.25,.24],[side*.35,.1,.27],[side*.29,-.06,.3]],.015,0x466037);
      }
      ball(head,0xe9c77b,[0,.3,.29],[.045,.055,.02]);
    }
    for(const side of [-1,1]){
      if(skin==='rabbit'){
        const ear=ball(head,fur,[side*.23,.58,-.035],[.13,.43,.115]);ear.rotation.z=-side*.13;
        const inner=ball(head,0xeeb6ad,[side*.23,.6,.061],[.073,.32,.035]);inner.rotation.z=-side*.13;
      }else if(['fox','pig','deer','cat','corgi'].includes(skin)){
        const ear=piece(head,new THREE.ConeGeometry(.22,.45,3),fur,[side*.3,.39,-.02]);ear.rotation.z=-side*.22;
        const inner=piece(head,new THREE.ConeGeometry(.13,.28,3),cream,[side*.3,.4,.085]);inner.rotation.z=-side*.22;
      }else if(!bird&&!dragon&&skin!=='guardian'){
        const small=['capybara','otter','meerkat','hedgehog'].includes(skin)?.65:1;
        ball(head,skin==='panda'?0x293333:fur,[side*.36,.35,-.035],[.18*small,.19*small,.11]);
        ball(head,cream,[side*.36,.35,.065],[.10*small,.11*small,.04]);
      }
      if(skin==='deer'){
        const antler=piece(head,new THREE.CapsuleGeometry(.033,.35,5,8),0x765339,[side*.22,.54,-.12]);antler.rotation.z=-side*.28;
        const branch=piece(head,new THREE.CapsuleGeometry(.025,.15,5,8),0x765339,[side*.33,.6,-.12]);branch.rotation.z=-side*.9;
      }
      if(masked)ball(head,0x30383a,[side*.18,.06,.327],[.13,.13,.047]);
      if(skin==='tiger')for(let stripe=0;stripe<3;stripe++){
        const mark=ball(head,0x553b2d,[side*(.36-stripe*.022),.12-stripe*.11,.258+stripe*.012],[.115,.026,.025]);mark.rotation.z=side*.4;
      }
      if(!['penguin','owl','duck','pig','capybara'].includes(skin))ball(head,cream,[side*.14,-.14,.29],[.195,.15,.14]);
      const eyeZ=bird?.402:masked?.391:.353;
      ball(head,0xfffcf1,[side*.17,.055,eyeZ],[.075,.09,.038]);
      ball(head,skin==='cat'?0x368cab:skin==='owl'?0xb98b31:0x725444,[side*.17,.055,eyeZ+.03],[.05,.065,.023]);
      ball(head,0x202f30,[side*.17,.055,eyeZ+.048],[.033,.046,.012]);
      ball(head,0xffffff,[side*.17-.012,.079,eyeZ+.062],[.014,.018,.01]);
    }
    if(!['penguin','owl','duck','pig','capybara'].includes(skin))ball(head,skin==='rabbit'?0xcd8b8c:0x303531,[0,-.08,.425],[.065,.045,.045]);
    if(skin==='capybara')for(const side of [-1,1])ball(head,0x705538,[side*.12,-.105,.525],[.025,.016,.008]);
    if(!bird)ball(head,0x5b423d,[0,-.23,.419],[.026,.021,.009]);
    if(outfit.hat){piece(head,new THREE.CylinderGeometry(.235,.235,.11,32),0xe8bd50,[0,.41,.025],[1,1,1],.65);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;piece(head,new THREE.ConeGeometry(.075,.18,4),0xf0c967,[Math.cos(a)*.2,.54,Math.sin(a)*.2+.025],[1,1,1],.65);}}
    if(outfit.scarf){piece(body,new THREE.TorusGeometry(.235,.07,12,40),0x57a9c8,[0,1.61,0],[1,.85,1]).rotation.x=Math.PI/2;piece(body,new THREE.CapsuleGeometry(.07,.26,8,12),0x57a9c8,[.16,1.4,.3],[1,1,.5]).rotation.z=-.18;}
    const floor=piece(scene,new THREE.CylinderGeometry(1,1.04,.12,64),0x47695d,[0,.1,0]);floor.receiveShadow=true;
    const resize=new ResizeObserver(()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});resize.observe(container);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');const start=performance.now();
    renderer.setAnimationLoop(()=>{const t=(performance.now()-start)/1000;const animate=!reduced.matches&&!document.hidden;
      body.position.y=animate?.012*Math.sin(t*2):0;
      legs.forEach((leg,i)=>{leg.rotation.x=animate&&motion==='walk'?Math.sin(t*5+i*Math.PI)*.27:0;});
      arms.forEach((arm,i)=>{arm.rotation.x=animate&&motion==='walk'?Math.sin(t*5+i*Math.PI+Math.PI)*.3:animate&&motion==='attack'&&i===1?-.8+Math.sin(t*5)*.7:0;});
      renderer.render(scene,camera);
    });
    return()=>{viewpoint.current=camera.position.toArray() as [number,number,number];renderer.setAnimationLoop(null);resize.disconnect();controls.dispose();key.shadow.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
  },[skin,outfit.top,outfit.bottom,outfit.hat,outfit.scarf,motion]);
  return <div><div ref={host} style={{height:420,width:'100%',minWidth:220,background:'radial-gradient(ellipse at center, #42695c, #132f28)',borderRadius:20,touchAction:'none'}}/>{failed?<p>3D preview is unavailable on this device. Your hero and items are unchanged.</p>:<p>Drag to turn · scroll or pinch to zoom</p>}</div>;
}
