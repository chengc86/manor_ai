// Renderable geometry and stable-ID coverage, independent of live player data.
const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');
fs.mkdirSync('work/model-test',{recursive:true});
for(const name of ['hero-model','hero-kit','hero-features','hero-extras','hero-heads','hero-designs','hero-3d-catalogue','hero-catalogue','hero-outfit','clothing']){
 const output=ts.transpileModule(fs.readFileSync(`lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("\.\/(.*?)"\)/g,'require("./$1.cjs")');
 fs.writeFileSync(`work/model-test/${name}.cjs`,output);
}
const {HERO_3D_STUDIES}=require('../work/model-test/hero-3d-catalogue.cjs');
const {createHeroModel,outfitForWardrobe}=require('../work/model-test/hero-model.cjs');
const {CLOTHING,wear}=require('../work/model-test/clothing.cjs');
assert.equal(HERO_3D_STUDIES.length,114);
assert.deepEqual(HERO_3D_STUDIES.map(h=>h.id),Array.from({length:116},(_,i)=>i).filter(i=>![7,8].includes(i)));
const presets=[{}, {top:'shirt',bottom:'trousers',feet:'school-shoes'}, {top:'dress',feet:'trainers',head:'silver-crown',back:'ruby-cape',neck:'sun-scarf',badge:'star-badge',wrist:'mint-band'}];
let total=0;
for(const hero of HERO_3D_STUDIES)for(const wardrobe of presets){
 const model=createHeroModel(hero.skin,outfitForWardrobe(wardrobe),wardrobe);
 for(const motion of ['idle','walk','attack']){model.animate(.5,motion);model.root.updateMatrixWorld(true);}
 let meshes=0;model.root.traverse(o=>{assert(o.matrixWorld.elements.every(Number.isFinite));if(o.isMesh){meshes++;assert([...o.geometry.attributes.position.array].every(Number.isFinite),hero.name);assert(Number.isFinite(o.material.color.r));}});
 assert(meshes>10,hero.name);model.dispose();total++;
}
for(const item of CLOTHING){const wardrobe=wear({},item.id),model=createHeroModel('rabbit',outfitForWardrobe(wardrobe),wardrobe);model.dispose();}
assert.deepEqual(outfitForWardrobe({}),{top:'none',bottom:'none',hat:false,scarf:false});
assert.equal(outfitForWardrobe({top:'dress'}).bottom,'dress');
console.log(`PASS: ${total} hero/outfit models, all 114 stable IDs and all ${CLOTHING.length} clothing items.`);
