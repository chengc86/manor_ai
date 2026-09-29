// Every shop item has a picture, a child-friendly description and at least one "get better at" group.
const fs=require('fs'),ts=require('typescript'),assert=require('assert/strict');
fs.mkdirSync('work/shop',{recursive:true});
for(const n of ['hero-catalogue','builds','item-guide','equipment','clothing'])fs.writeFileSync(`work/shop/${n}.cjs`,ts.transpileModule(fs.readFileSync(`lib/${n}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("\.\/(.*?)"\)/g,'require("./$1.cjs")'));
const {ITEMS}=require('../work/shop/builds.cjs'),{ITEM_BLURBS,ITEM_GOALS,itemArt,itemGoals,modAmount}=require('../work/shop/item-guide.cjs'),{EQUIPMENT}=require('../work/shop/equipment.cjs'),{CLOTHING,clothingArt}=require('../work/shop/clothing.cjs');
assert.deepEqual(Object.keys(ITEM_BLURBS).sort(),ITEMS.map(i=>i.id).sort());
for(const it of ITEMS){const file='public'+itemArt(it.id),svg=fs.readFileSync(file,'utf8');assert(/^<svg [^>]*viewBox="0 0 120 120"/.test(svg),file);assert(svg.trim().endsWith('</svg>'),file);assert(ITEM_BLURBS[it.id].length<=70,it.id);assert(itemGoals(it.id).length>0,it.id);}
for(const g of ITEM_GOALS)assert(ITEMS.some(it=>itemGoals(it.id).includes(g.id)),g.id);
assert.deepEqual(itemGoals('icepack'),['freeze']);assert.equal(modAmount('speed',.15),'+15%');assert.equal(modAmount('str',-2),'−2');assert.equal(modAmount('range',.6),'+0.6 squares');
assert(fs.existsSync('public/items/backpack.svg'));for(const w of EQUIPMENT)assert(fs.existsSync(`public/weapons/${w.art}.png`),w.id);for(const c of CLOTHING)assert(fs.existsSync('public'+clothingArt(c)),c.id);
console.log(`PASS: all ${ITEMS.length} items have pictures, short descriptions and goal groups; every goal has items; weapon and clothing pictures exist.`);
