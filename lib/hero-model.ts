import * as THREE from 'three';
import {heroModelProfile,type Hero3DSkin} from './hero-3d-catalogue';
import type {Wardrobe} from './clothing';
import {type RigOutfit} from './hero-outfit';
export {outfitForWardrobe,type RigOutfit} from './hero-outfit';
export function createHeroModel(skin:Hero3DSkin,outfit:RigOutfit,wardrobe?:Wardrobe){
 const profile=heroModelProfile(skin);
    const root=new THREE.Group();
    const fur=({fox:0xd9873e,bear:0xa87852,rabbit:0xe8dfd4,capybara:0xa67c52,penguin:0x293d4d,deer:0xbb7746,raccoon:0x8c9294,panda:0xf5eee1,lion:0xd7a04f,tiger:0xe59a43,pig:0xeeb1ad,cat:0x839fbc,owl:0xe9e8df,dragon:0x79a64c,hedgehog:0xb99773,squirrel:0xb66a39,otter:0x88634e,duck:0xf5d77b,redpanda:0xb95936,meerkat:0xc6a773,corgi:0xcf9257,snowleopard:0xc9d3d6,cinder:0xb86762,guardian:0x64804f} as Record<string,number>)[skin]??profile.colour;
    const bird=['penguin','owl','duck','kiwi-bird','parrot','toucan','griffin'].includes(skin);
    const dragon=['dragon','cinder'].includes(skin);
    const masked=['panda','raccoon','meerkat','redpanda'].includes(skin);
    const cream=0xffedda,green=0x216652,navy=0x263d50;
    const topColour=wardrobe?(wardrobe.outer?green:wardrobe.top==='sports-top'?0x247d64:wardrobe.top==='dress'?0x8fc5a5:0xfffaf0):(outfit.top==='jumper'?green:0xfffaf0);
    const bottomColour=wardrobe?(['sports-shorts','skort'].includes(wardrobe.bottom??'')?0x205e4d:0x535e65):navy;
    const skirtColour=wardrobe?(wardrobe.top==='dress'?0x8fc5a5:bottomColour):green;
    const hatColour=wardrobe?.head==='silver-crown'?0xcbd6dc:0xe8bd50;
    const scarfColour=wardrobe?.neck==='sun-scarf'?0xedbd54:0x57a9c8;
    const shaped=profile.robot||profile.plant||profile.toy||['axolotl','tortoise','frog','seahorse','seal','dolphin','honeybee','ladybird','butterfly','crocodile','alien','glass-robot','crystal-golem','pebble-golem'].includes(skin);

    const materials:THREE.Material[]=[];
    const mat=(color:number,metalness=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness:metalness?.3:.72,metalness});materials.push(m);return m;};
    function piece(parent:THREE.Object3D,geometry:THREE.BufferGeometry,color:number,pos:number[],scale=[1,1,1],metalness=0){const mesh=new THREE.Mesh(geometry,mat(color,metalness));mesh.position.set(pos[0],pos[1],pos[2]);mesh.scale.set(scale[0],scale[1],scale[2]);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
    const ball=(p:THREE.Object3D,c:number,pos:number[],scale:number[])=>piece(p,new THREE.SphereGeometry(1,32,24),c,pos,scale);
    const body=new THREE.Group();root.add(body);root.position.y=-.08;
    ball(body,fur,[0,1.2,0],[.39,.5,.26]);
    // Child-appropriate base shorts remain when no purchased bottom is selected.
    ball(body,wardrobe?.bottom?bottomColour:navy,[0,.92,0],[.35,.23,.255]);
    if(outfit.top!=='none'){
      ball(body,topColour,[0,1.25,0],[.404,.43,.278]);
      piece(body,new THREE.CylinderGeometry(.35,.35,.17,40),topColour,[0,1.02,0],[1,1,.76]);
    }
    if(wardrobe?.outer==='cardigan'){piece(body,new THREE.BoxGeometry(.025,.4,.014),0x154937,[0,1.25,.28]);for(const y of [1.1,1.22,1.34])ball(body,0xd6cba0,[0,y,.29],[.014,.014,.01]);}
    if(outfit.top==='shirt'){
      for(const x of [-1,1]){if(wardrobe?.top==='blouse')ball(body,0xffffff,[x*.085,1.55,.25],[.09,.06,.025]);else {const collar=piece(body,new THREE.ConeGeometry(.105,.18,3),0xffffff,[x*.09,1.57,.24]);collar.rotation.z=x*.4;}}
      for(const y of (['polo','sports-top'].includes(wardrobe?.top??'')?[1.39,1.46]:[1.15,1.3,1.44]))ball(body,0xc1b79c,[0,y,.281],[.018,.018,.012]);
    }
    const legs:THREE.Group[]=[];const arms:THREE.Group[]=[];
    for(const side of [-1,1]){
      const leg=new THREE.Group();leg.position.set(side*.18,.92,0);body.add(leg);legs.push(leg);
      piece(leg,new THREE.CapsuleGeometry(.125,.35,8,16),outfit.bottom==='trousers'?bottomColour:fur,[0,-.26,0]);
      ball(leg,wardrobe?(wardrobe.feet?(wardrobe.feet==='trainers'?0xe4e7df:0x243332):fur):0x243332,[0,-.58,.065],[.15,.105,.23]);
      if(wardrobe?.bottom?.includes('shorts'))piece(leg,new THREE.CapsuleGeometry(.139,.1,8,16),bottomColour,[0,-.1,0]);
      if(wardrobe?.feet==='trainers')ball(leg,0x668f85,[0,-.585,.225],[.125,.025,.026]);
      const arm=new THREE.Group();arm.position.set(side*.38,1.48,0);body.add(arm);arms.push(arm);arm.rotation.z=side*(outfit.bottom==='dress'?.3:.15);
      piece(arm,new THREE.CapsuleGeometry(.115,.23,8,16),outfit.top==='none'?fur:topColour,[0,-.18,0]);
      ball(arm,skin==='panda'?0x293333:fur,[0,-.4,.01],[.12,.13,.12]);
    }
    if(outfit.bottom==='dress'){
      // A closed, pleated 3D shell around hips, with a broad hem clear of the legs.
      const geo=new THREE.CylinderGeometry(.345,.57,.52,64,8,false);
      const positions=geo.attributes.position;
      for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i),y=positions.getY(i);const r=Math.hypot(x,z);if(r>.1){const pleat=1+.035*Math.cos(Math.atan2(z,x)*16);positions.setXYZ(i,x*pleat,y,z*pleat);}}
      geo.computeVertexNormals();piece(body,geo,skirtColour,[0,.88,0],[1,1,.78]);
      piece(body,new THREE.TorusGeometry(.35,.025,8,64),0x173e34,[0,1.14,0],[1,.78,1]).rotation.x=Math.PI/2;
    }
    const head=new THREE.Group();head.position.y=1.92;body.add(head);
    if(profile.robot&&skin!=='round-robot'||profile.toy&&!['patchwork-bear','fabric-rabbit','plush-bat','rice-cake-sprite'].includes(skin)){
      const mesh=piece(head,new THREE.BoxGeometry(.79,.72,.57,2,2,2),fur,[0,0,0]);mesh.geometry.computeVertexNormals();
      ball(head,0xdfe9d9,[0,-.025,.286],[.36,.29,.047]);
    }else ball(head,fur,[0,0,0],skin==='capybara'?[.5,.38,.4]:[.48,.44,.37]);
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

    // Species and toy details are part of the model, so all outfits share their anchors.
    if(profile.robot){
      piece(head,new THREE.CylinderGeometry(.02,.02,.22,8),0x71888e,[0,.48,0]);ball(head,0xf3c969,[0,.62,0],[.07,.07,.07]);
      for(const x of [-.3,.3])ball(head,0x778991,[x,-.24,.29],[.025,.025,.014]);
      if(skin.includes('screen'))piece(head,new THREE.BoxGeometry(.62,.37,.04),0x193f4b,[0,.02,.31]);
      if(skin.includes('box'))piece(head,new THREE.BoxGeometry(.9,.1,.65),0x607a87,[0,.37,0]);
      if(skin.includes('astronaut'))piece(head,new THREE.TorusGeometry(.4,.05,8,32),0xe4e9e5,[0,0,.32],[1,.86,1]);
      if(skin.includes('wind-up')||skin.includes('clockwork')){
        piece(body,new THREE.CylinderGeometry(.035,.035,.25,8),0xe4c16d,[0,1.27,-.4]).rotation.x=Math.PI/2;
        for(const x of [-.1,.1])piece(body,new THREE.TorusGeometry(.08,.025,8,16),0xe4c16d,[x,1.27,-.53]);
      }
      if(skin.includes('polka'))for(const [x,y] of [[-.22,.2],[.22,.2],[0,-.25]])ball(head,0xf0ce74,[x,y,.3],[.045,.045,.018]);
      if(skin.includes('lighthouse')){piece(head,new THREE.ConeGeometry(.32,.2,8),0xba675a,[0,.44,0]);piece(head,new THREE.CylinderGeometry(.12,.12,.18,8),0xf0da87,[0,.37,0]);}
      if(skin.includes('kitchen')){const spout=piece(head,new THREE.ConeGeometry(.09,.3,10),0x9faeb3,[.46,.07,0]);spout.rotation.z=-1.2;}
      if(skin.includes('dice'))for(const x of [-.22,.22])ball(head,0x445563,[x,.23,.3],[.04,.04,.01]);
      if(skin.includes('garden')||skin.includes('wooden'))for(const x of [-.2,.2])ball(head,0x86ac64,[x,.4,0],[.1,.19,.03]);
      if(skin.includes('unicorn'))piece(head,new THREE.ConeGeometry(.08,.42,12),0xe8c58d,[0,.53,.12]);
    }
    if(['axolotl','frog','tortoise','crocodile','dolphin','seahorse','seal'].includes(skin)){
      if(skin==='axolotl')for(const side of [-1,1])for(let i=0;i<3;i++){
        const gill=piece(head,new THREE.CapsuleGeometry(.035,.2,5,8),0xd986a6,[side*.48,.18-i*.16,0]);gill.rotation.z=side*(.8+i*.35);ball(head,0xebadc5,[side*.6,.23-i*.2,0],[.06,.055,.04]);
      }
      if(skin==='tortoise')ball(body,0x4a7150,[0,1.15,-.25],[.42,.49,.2]);
      if(skin==='frog')for(const x of [-.24,.24])ball(head,fur,[x,.3,.1],[.19,.2,.16]);
      if(skin==='crocodile'||skin==='dolphin'||skin==='seahorse')ball(head,fur,[0,-.12,.34],[skin==='seahorse'?.085:.22,.1,.29]);
      if(skin==='dolphin')piece(head,new THREE.ConeGeometry(.15,.3,3),fur,[0,.39,-.12]);
      if(skin==='seal')for(const x of [-.12,.12])ball(head,cream,[x,-.13,.32],[.16,.13,.12]);
    }
    if(['honeybee','ladybird','butterfly','plush-bat'].includes(skin)){
      for(const side of [-1,1]){
        ball(body,skin==='ladybird'?0xcc514e:skin==='butterfly'?0xb994d1:0xc6e0df,[side*.42,1.3,-.22],[.32,.42,.05]);
        if(skin!=='plush-bat')tube(head,[[side*.2,.29,0],[side*.25,.55,0],[side*.34,.61,0]],.018,0x4f504a);
      }
      if(skin==='ladybird')for(const x of [-.45,.45])for(const y of [1.12,1.42])ball(body,0x333837,[x,y,-.27],[.06,.06,.012]);
    }
    if(skin==='hippo')ball(head,fur,[0,-.16,.3],[.33,.19,.18]);
    if(skin==='mouse'||skin==='koala')for(const x of [-.39,.39]){ball(head,fur,[x,.3,0],[.24,.24,.12]);ball(head,0xe0b9b0,[x,.3,.1],[.16,.16,.025]);}
    if(skin==='alpaca')for(const x of [-.22,.22])ball(head,fur,[x,.5,0],[.09,.28,.09]);
    if(skin==='sloth')for(const x of [-.2,.2])ball(head,0x795c46,[x,.045,.315],[.15,.1,.04]);
    if(skin==='fennec-fox'||skin==='wolf'||skin==='badger'||skin==='red-squirrel')for(const side of [-1,1]){
      const ear=piece(head,new THREE.ConeGeometry(.15,skin==='fennec-fox'?.58:.3,3),fur,[side*.3,.4,0]);ear.rotation.z=-side*.2;
    }
    if(skin==='toucan'||skin==='kiwi-bird')ball(head,skin==='toucan'?0xe8aa42:0xb29260,[0,-.12,.46],[.12,.1,.3]);
    if(skin==='parrot')for(let i=0;i<3;i++)ball(head,0xe9b74e,[(i-1)*.09,.42,0],[.045,.2,.07]);
    if(skin==='alien')for(const x of [-.28,.28]){tube(head,[[x,.25,0],[x,.48,0],[x*1.2,.57,0]],.022,fur);ball(head,0xb5e7b1,[x*1.2,.57,0],[.07,.07,.07]);}
    if(skin==='crystal-golem'||skin==='pebble-golem')for(let i=0;i<5;i++)piece(head,new THREE.OctahedronGeometry(.16),fur,[(i-2)*.17,.34,-.04]);
    if(skin==='friendly-yeti'||skin==='fluffy-monster')for(let i=0;i<9;i++){const a=i/9*Math.PI*2;ball(head,fur,[Math.cos(a)*.43,Math.sin(a)*.39,-.04],[.14,.14,.14]);}
    if(profile.plant){
      if(/pumpkin|strawberry|orange|coconut|pepper/.test(skin)){
        for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const leaf=ball(head,0x60854f,[Math.cos(a)*.13,.4,Math.sin(a)*.12],[.08,.025,.17]);leaf.rotation.y=-a;}
        if(skin.includes('strawberry'))for(const side of [-1,1])for(let i=0;i<3;i++)ball(head,0xe7c78c,[side*.31,.2-i*.12,.27],[.012,.02,.01]);
      }

      if(/flower|sun|dandelion/.test(skin))for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const petal=ball(head,skin.includes('sun')?0xf1c95a:0xd994b6,[Math.cos(a)*.46,Math.sin(a)*.43,-.07],[.1,.2,.055]);petal.rotation.z=-a+Math.PI/2;}
      else if(skin.includes('mushroom'))ball(head,0xc56c61,[0,.35,-.015],[.58,.22,.42]);
      else if(skin.includes('cloud'))for(let i=0;i<5;i++)ball(head,0xe2e9ed,[(i-2)*.16,.32,0],[.2,.17,.2]);
      else if(skin.includes('star')){const shape=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=i%2?.4:.59;if(i===0)shape.moveTo(Math.sin(a)*r,Math.cos(a)*r);else shape.lineTo(Math.sin(a)*r,Math.cos(a)*r);}shape.closePath();piece(head,new THREE.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:false}),0xecc779,[0,0,-.23]);}
      else if(/moon|snowflake|opal/.test(skin))piece(head,new THREE.TorusGeometry(.45,.06,8,24),0xd5e7eb,[0,0,-.13]);
      else if(/raindrop/.test(skin))piece(head,new THREE.ConeGeometry(.25,.45,24),0x8dcbd8,[0,.4,0]);
      else for(const x of [-.2,.2]){const leaf=ball(head,0x8eb461,[x,.42,0],[.11,.22,.035]);leaf.rotation.z=x*2;}
    }
    if(profile.toy){
      if(/pencil|crayon|chalk|pen/.test(skin)){piece(head,new THREE.ConeGeometry(.28,.38,6),skin.includes('pencil')?0xd9be93:fur,[0,.52,0]);piece(head,new THREE.ConeGeometry(.09,.14,6),0x4a5157,[0,.74,0]);}
      if(/book/.test(skin))for(const x of [-.4,.4])piece(head,new THREE.BoxGeometry(.065,.79,.67),0x546f98,[x,0,0]);
      if(/dice|domino/.test(skin))for(const [x,y] of [[-.23,.22],[.23,-.22],[.23,.22],[-.23,-.22]])ball(head,0x42515d,[x,y,.3],[.03,.03,.01]);
      if(/train|boat|rocket/.test(skin)){piece(head,new THREE.ConeGeometry(.22,.3,4),0xc87756,[0,.48,0]);for(const x of [-.36,.36])ball(head,0x4c6571,[x,-.27,0],[.12,.12,.12]);}
      if(/bell|drum|music/.test(skin))piece(head,new THREE.TorusGeometry(.2,.025,8,24),0xe6bc62,[0,.45,0]);
      if(/backpack/.test(skin))piece(head,new THREE.TorusGeometry(.16,.035,8,24),0x7a8eac,[0,.42,0]);
      if(/waffle/.test(skin))for(let i=0;i<4;i++)piece(head,new THREE.BoxGeometry(.68,.018,.02),0x976a3c,[0,-.26+i*.16,.3]);
      if(/patchwork|quilt|fabric/.test(skin))for(let i=0;i<5;i++)piece(head,new THREE.BoxGeometry(.025,.012,.02),0xeacda1,[-.24+i*.12,.26,.32]);
      if(/pretzel/.test(skin))for(const x of [-.17,.17])piece(head,new THREE.TorusGeometry(.19,.06,8,24),0xb48957,[x,.35,0]);
      if(/yo-yo/.test(skin))piece(head,new THREE.TorusGeometry(.38,.05,8,24),0xe6c573,[0,0,.3]);
      if(/jigsaw/.test(skin))ball(head,fur,[0,.43,0],[.13,.13,.13]);
    }
    for(const side of [-1,1]){
      if(skin==='rabbit'||skin==='fabric-rabbit'){
        const ear=ball(head,fur,[side*.23,.58,-.035],[.13,.43,.115]);ear.rotation.z=-side*.13;
        const inner=ball(head,0xeeb6ad,[side*.23,.6,.061],[.073,.32,.035]);inner.rotation.z=-side*.13;
      }else if(['fox','pig','deer','cat','corgi'].includes(skin)){
        const ear=piece(head,new THREE.ConeGeometry(.22,.45,3),fur,[side*.3,.39,-.02]);ear.rotation.z=-side*.22;
        const inner=piece(head,new THREE.ConeGeometry(.13,.28,3),cream,[side*.3,.4,.085]);inner.rotation.z=-side*.22;
      }else if((!bird&&!dragon&&skin!=='guardian'&&!shaped)||skin==='patchwork-bear'){
        const small=['capybara','otter','meerkat','hedgehog'].includes(skin)?.65:1;
        ball(head,skin==='panda'?0x293333:fur,[side*.36,.35,-.035],[.18*small,.19*small,.11]);
        ball(head,cream,[side*.36,.35,.065],[.10*small,.11*small,.04]);
      }
      if(skin==='deer'){
        const antler=piece(head,new THREE.CapsuleGeometry(.033,.35,5,8),0x765339,[side*.22,.54,-.12]);antler.rotation.z=-side*.28;
        const branch=piece(head,new THREE.CapsuleGeometry(.025,.15,5,8),0x765339,[side*.33,.6,-.12]);branch.rotation.z=-side*.9;
      }
      if(masked||skin==='badger')ball(head,0x30383a,[side*.18,.06,.327],[.13,.13,.047]);
      if(skin==='tiger')for(let stripe=0;stripe<3;stripe++){
        const mark=ball(head,0x553b2d,[side*(.36-stripe*.022),.12-stripe*.11,.258+stripe*.012],[.115,.026,.025]);mark.rotation.z=side*.4;
      }
      if(!bird&&!shaped&&!['pig','capybara'].includes(skin))ball(head,cream,[side*.14,-.14,.29],[.195,.15,.14]);
      const eyeZ=bird?.402:masked?.391:.353;
      ball(head,0xfffcf1,[side*.17,.055,eyeZ],[.075,.09,.038]);
      ball(head,skin==='cat'?0x368cab:skin==='owl'?0xb98b31:0x725444,[side*.17,.055,eyeZ+.03],[.05,.065,.023]);
      ball(head,0x202f30,[side*.17,.055,eyeZ+.048],[.033,.046,.012]);
      ball(head,0xffffff,[side*.17-.012,.079,eyeZ+.062],[.014,.018,.01]);
    }
    if(!bird&&!shaped&&!['pig','capybara'].includes(skin))ball(head,skin==='rabbit'?0xcd8b8c:0x303531,[0,-.08,.425],[.065,.045,.045]);
    if(skin==='capybara')for(const side of [-1,1])ball(head,0x705538,[side*.12,-.105,.525],[.025,.016,.008]);
    if(!bird)ball(head,0x5b423d,[0,-.23,.419],[.026,.021,.009]);
    if(outfit.hat&&!['explorer-hat','star-cap'].includes(wardrobe?.head??'')){piece(head,new THREE.CylinderGeometry(.235,.235,.11,32),hatColour,[0,.41,.025],[1,1,1],.65);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;piece(head,new THREE.ConeGeometry(.075,.18,4),hatColour,[Math.cos(a)*.2,.54,Math.sin(a)*.2+.025],[1,1,1],.65);}}
    if(outfit.scarf){piece(body,new THREE.TorusGeometry(.235,.07,12,40),scarfColour,[0,1.61,0],[1,.85,1]).rotation.x=Math.PI/2;piece(body,new THREE.CapsuleGeometry(.07,.26,8,12),scarfColour,[.16,1.4,.3],[1,1,.5]).rotation.z=-.18;}

    if(wardrobe?.head==='explorer-hat'||wardrobe?.head==='star-cap'){
      const colour=wardrobe.head==='star-cap'?0x577eac:0xb9a477;
      ball(head,colour,[0,.35,0],[.34,.15,.28]);
      ball(head,colour,[0,.33,wardrobe.head==='star-cap'?.22:0],[.4,.025,.36]);
    }
    if(wardrobe?.tie){piece(body,new THREE.ConeGeometry(.052,.31,4),0x1d5743,[0,1.33,.285]).rotation.z=Math.PI;ball(body,0x2e7659,[0,1.51,.278],[.047,.04,.02]);}
    if(wardrobe?.back){const cape=piece(body,new THREE.CylinderGeometry(.25,.52,.88,32,1,true,Math.PI*.25,Math.PI*1.5),wardrobe.back==='ruby-cape'?0x953f57:0x414c8a,[0,1.12,-.12],[1,1,.72]);(cape.material as THREE.MeshStandardMaterial).side=THREE.DoubleSide;cape.rotation.y=Math.PI;}
    if(wardrobe?.badge){piece(body,wardrobe.badge==='star-badge'?new THREE.OctahedronGeometry(.07):new THREE.SphereGeometry(.055,16,12),0xe8c971,[-.2,1.38,.259],[1,1,.32],.5);}
    if(wardrobe?.wrist)for(const arm of arms)piece(arm,new THREE.CylinderGeometry(.122,.122,.055,16),wardrobe.wrist==='mint-band'?0x89d1b4:0xe3ac77,[0,-.34,.01]);

 return {root,animate(t:number,motion:'idle'|'walk'|'attack',enabled=true){
 body.position.y=enabled?.012*Math.sin(t*2):0;
 legs.forEach((leg,i)=>{leg.rotation.x=enabled&&motion==='walk'?Math.sin(t*5+i*Math.PI)*.27:0;});
 arms.forEach((arm,i)=>{arm.rotation.x=enabled&&motion==='walk'?Math.sin(t*5+i*Math.PI+Math.PI)*.3:enabled&&motion==='attack'&&i===1?-.8+Math.sin(t*5)*.7:0;});
 },dispose(){root.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());}};
}
