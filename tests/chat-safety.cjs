// Class chat stays suitable for children: rude words, links and personal details are blocked, with two warnings a week and then a 10-coin fine. Uses an on-disk SQL database, never live pupil data.
const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),Module=require('module');
const dir='work/chat-safety';fs.mkdirSync(dir,{recursive:true});
const compile=(src,out)=>fs.writeFileSync(`${dir}/${out}`,ts.transpileModule(fs.readFileSync(src,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("(?:@\/lib\/|\.\/)(.*?)"\)/g,'require("./$1.cjs")'));
for(const f of fs.readdirSync('lib').filter(f=>f.endsWith('.ts')))compile('lib/'+f,f.replace('.ts','.cjs'));
compile('app/api/chat/route.ts','chat.cjs');compile('app/api/game/route.ts','game.cjs');
const {checkMessage,weekOf}=require(`../${dir}/chat-filter.cjs`);

const rude=['fuck','FUCK!!','f u c k','f.u.c.k','fuuuuck','f*ck','f**k','fvck','sh1t','$hit','bullshit','motherfucker','b1tch','@ss','a**','a**hole','b***h','you are stupid','ur an idiot','shut up','SHUT UP!!!','shutup','kys','kill yourself','i hate you','you suck','wtf','stfu','sexy','send nudes','dickhead','piss off',"you're ugly",'crappy','retarded','dumbass','spaz','🖕'];
const links=['go to https://roblox.com','www.youtube.com','discord.gg/abc123','join bit.ly/xyz','google dot com','bbc.co.uk','youtu.be/dQw4','t.me/secret'];
const personal=['email me at fox@gmail.com','call me 07123 456789','my number is +44 7123 456789','020 7946 0958'];
const fine=['hello team','I am on the left path','Which path needs a hero?','class','pass the bridge','assassin hero','Scunthorpe United','shiitake mushrooms','that is swanky','thorny bushes','I live in Essex','Sussex','grapes','the therapist','Dickens','cocktail','peacock','cockpit','Mississippi','I have 455 coins','wave 3.5','it starts at 3:30','row 6 column 10','I have 1000000000 coins','99999999999','e.g. this','i.e. that','I went to the U.K. in summer','dumbbell','Dumbledore','assessment','this hit hard','booby trap','50%','3*4=12','*sigh*','cumin','Pakistan','gay','my hero died','I killed 12 slimes','hate your hero? no','I got an A* in maths','ok 👍','Great teamwork! 🎉','it is 27.09.2026','0.5 of the coins','what the h*ll'];
for(const t of rude)assert.equal(checkMessage(t),'rude',t);for(const t of links)assert.equal(checkMessage(t),'link',t);for(const t of personal)assert.equal(checkMessage(t),'personal',t);for(const t of fine)assert.equal(checkMessage(t),null,t);
assert.equal(weekOf(Date.UTC(2026,8,27,12)),'2026-09-21');assert.equal(weekOf(Date.UTC(2026,8,27,23,30)),'2026-09-28');assert.equal(weekOf(Date.UTC(2026,8,28,9)),'2026-09-28');
console.log(`PASS: ${rude.length} rude, ${links.length} link and ${personal.length} personal-detail messages blocked (including disguised spellings); ${fine.length} everyday messages allowed; weeks start on Monday, UK time.`);

const file=`${dir}/test-${Date.now()}.sqlite`;let sqlite=new DatabaseSync(file);
sqlite.exec('CREATE TABLE world(id TEXT PRIMARY KEY,revision INTEGER NOT NULL,data TEXT NOT NULL); CREATE TABLE sessions(token TEXT PRIMARY KEY,user_id TEXT,expires INTEGER);');
const DB={prepare(sql){return {bind(...values){return {async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}}},async first(){return sqlite.prepare(sql).get(...values)??null}}}}}};
const original=Module._load;Module._load=function(id,...args){if(id==='cloudflare:workers')return{env:{DB}};return original.call(this,id,...args)};
const W=require(`../${dir}/world.cjs`),CHAT=require(`../${dir}/chat.cjs`),GAME=require(`../${dir}/game.cjs`);
const request=(uid,body)=>new Request('https://game.test/api/chat',{method:body?'POST':'GET',headers:{cookie:'qg_session='+uid,origin:'https://game.test',host:'game.test','content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
const read=async r=>({status:r.status,body:await r.json()});
const say=(uid,text,id=crypto.randomUUID())=>CHAT.POST(request(uid,{action:'send',id,text})).then(read);
const room=uid=>CHAT.GET(request(uid)).then(read).then(r=>r.body);
const coins=async uid=>(await W.readWorld()).w.players[uid].coins;
(async()=>{
for(const uid of ['a','b','teacher']){sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha(uid),uid,Date.now()+30*86400000);if(uid!=='teacher')await W.mutate(w=>{w.players[uid]={...W.newPlayer(uid),coins:25};});}
const first=crypto.randomUUID();let r=await say('a','you are an idiot',first);assert.equal(r.status,422);assert.equal(r.body.blocked.reason,'rude');assert.equal(r.body.blocked.warning,1);assert.equal(r.body.blocked.coins,0);assert.match(r.body.blocked.message,/warning 1 of 2 this week/);
r=await say('a','you are an idiot',first);assert.equal(r.body.blocked.warning,1);assert.equal((await W.readWorld()).w.players.a.chatConduct.count,1);
r=await say('a','come to www.roblox.com');assert.equal(r.body.blocked.reason,'link');assert.equal(r.body.blocked.warning,2);assert.equal(await coins('a'),25);
r=await say('a','my number is 07123 456789');assert.equal(r.status,422);assert.equal(r.body.blocked.reason,'personal');assert.equal(r.body.blocked.warning,null);assert.equal(r.body.blocked.coins,10);assert.match(r.body.blocked.message,/You lost 10 coins/);assert.equal(await coins('a'),15);
r=await say('a','sh1t');assert.equal(r.body.blocked.coins,10);assert.equal(await coins('a'),5);
r=await say('a','f*ck');assert.equal(r.body.blocked.coins,5);assert.equal(await coins('a'),0);
r=await say('a','stfu');assert.equal(r.body.blocked.coins,0);assert.match(r.body.blocked.message,/teacher can see this/);assert.equal(await coins('a'),0);
console.log('PASS: the first two blocked messages each week are warnings; after that each costs 10 coins, never below zero; resending the same message is not counted twice.');

r=await say('a','Ready for the next wave!');assert.equal(r.status,200);r=await say('teacher','Revise with https://www.bbc.co.uk/bitesize tonight.');assert.equal(r.status,200);
let pupil=await room('a');assert.deepEqual(pupil.messages.map(m=>m.text),['Ready for the next wave!','Revise with https://www.bbc.co.uk/bitesize tonight.']);assert.equal(pupil.warnings,6);assert.equal(pupil.flags,undefined);
assert.equal((await room('b')).warnings,0);assert.equal((await room('b')).flags,undefined);
const teacher=await room('teacher');assert.equal(teacher.flags.length,6);assert.equal(teacher.flags[0].text,'stfu');assert.equal(teacher.flags[0].name,'a');assert.deepEqual(teacher.flags.map(f=>f.warning?`warning ${f.warning}`:`-${f.coins}`),['-0','-5','-10','-10','warning 2','warning 1']);assert.equal(teacher.warnings,undefined);
const view=await read(await GAME.GET(new Request('https://game.test/api/game',{headers:{cookie:'qg_session=b','X-Quest-Heroes':'7'}})));assert.equal(view.status,200);assert(view.body.players.every(p=>!('chatConduct' in p)));
console.log('PASS: blocked messages never reach the chat; the teacher is not filtered and sees every blocked message with its outcome; pupils see only their own warning count.');

const now=Date.now;Date.now=()=>now()+7*86400000;await W.mutate(w=>{w.players.a.coins=30});
r=await say('a','loser');assert.equal(r.body.blocked.warning,1);assert.equal(await coins('a'),30);assert.equal((await room('a')).warnings,1);Date.now=now;
console.log('PASS: warnings start again each week.');
const {countWords,chatDay,FREE_WORDS_PER_DAY,COINS_PER_WORD}=require(`../${dir}/chat-rules.cjs`);
assert.equal(countWords('  hello   team  '),2);assert.equal(countWords('wave!'),1);assert.equal(countWords(''),0);
assert.equal(FREE_WORDS_PER_DAY,200);assert.equal(COINS_PER_WORD,1);
assert.equal(chatDay(Date.UTC(2026,9,6,22,30)),'2026-10-06');assert.equal(chatDay(Date.UTC(2026,9,6,23,30)),'2026-10-07');
const realNow=Date.now;let clock=Date.UTC(2026,9,6,12);Date.now=()=>clock;const tick=()=>{clock+=4000};
const wordsOf=async uid=>(await W.readWorld()).w.players[uid].chatWords;
r=await say('b','one two three');assert.equal(r.status,200);assert.equal(r.body.charged,0);assert.equal(await coins('b'),25);assert.deepEqual(await wordsOf('b'),{day:'2026-10-06',used:3});assert.equal((await room('b')).allowance.left,197);
await W.mutate(w=>{w.players.b.chatWords={day:'2026-10-06',used:198}});tick();
r=await say('b','alpha beta gamma delta');assert.equal(r.status,200);assert.equal(r.body.charged,2);assert.equal(await coins('b'),23);assert.equal((await wordsOf('b')).used,202);assert.equal((await room('b')).messages.filter(m=>m.owner==='b'&&m.text==='alpha beta gamma delta').length,1);
await W.mutate(w=>{w.players.b.coins=1});tick();const short=crypto.randomUUID();
r=await say('b','five words here please now',short);assert.equal(r.status,402);assert.equal(r.body.paywall.cost,5);assert.equal(r.body.paywall.freeLeft,0);assert.match(r.body.paywall.message,/used today's 200 free words/);assert.match(r.body.paywall.message,/5 coins/);assert.match(r.body.paywall.message,/Answer questions/);assert.equal(await coins('b'),1);assert.equal((await wordsOf('b')).used,202);assert.equal((await room('b')).messages.some(m=>m.id===short),false);
await W.mutate(w=>{w.players.b.coins=5});tick();
r=await say('b','five words here please now',short);assert.equal(r.status,200);assert.equal(r.body.charged,5);assert.equal(await coins('b'),0);assert.equal((await wordsOf('b')).used,207);
r=await say('b','five words here please now',short);assert.equal(r.status,200);assert.equal(r.body.charged,undefined);assert.equal(await coins('b'),0);assert.equal((await wordsOf('b')).used,207);
tick();r=await say('b','you are an idiot');assert.equal(r.status,422);assert.equal((await wordsOf('b')).used,207);
await W.mutate(w=>{const before=w.chat.length;w.chat=w.chat.filter(m=>m.text!=='one two three');assert.equal(w.chat.length,before-1)});assert.equal((await wordsOf('b')).used,207);
clock=Date.UTC(2026,9,6,23,30);tick();
r=await say('b','hello again');assert.equal(r.status,200);assert.equal(r.body.charged,0);assert.equal((await wordsOf('b')).day,'2026-10-07');assert.equal((await wordsOf('b')).used,2);assert.equal(await coins('b'),0);
const teacherWords=(await W.readWorld()).w.players.teacher;tick();r=await say('teacher','plan the left path and the right path before the next wave starts please');assert.equal(r.status,200);assert.equal(r.body.charged,0);assert.equal((await W.readWorld()).w.players.teacher,teacherWords);
await W.mutate(w=>{w.players.c={...W.newPlayer('c'),coins:0,unlimitedCoins:true,chatWords:{day:'2026-10-07',used:200}}});sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha('c'),'c',Date.now()+30*86400000);tick();
r=await say('c','ten extra words go here for the test account only now');assert.equal(r.status,200);assert.equal(r.body.charged,0);assert.equal(await coins('c'),0);
const stillPlaying=await read(await GAME.POST(new Request('https://game.test/api/game',{method:'POST',headers:{cookie:'qg_session=b',origin:'https://game.test',host:'game.test','content-type':'application/json','X-Quest-Heroes':'7','X-Quest-Questions':'3'},body:JSON.stringify({action:'question',subject:'Maths'})})));
assert.equal(stillPlaying.status,200);assert.equal(stillPlaying.body.paywall,undefined);assert.ok(stillPlaying.body.question||stillPlaying.body.message);
const publicPlayers=(await read(await GAME.GET(new Request('https://game.test/api/game',{headers:{cookie:'qg_session=b','X-Quest-Heroes':'7'}})))).body.players;assert.ok(publicPlayers.every(p=>!('chatWords' in p)));
Date.now=realNow;
console.log('PASS: 200 free words per London day, then 1 coin per extra word; a short balance refuses the send; teacher and test accounts are not charged; questions stay open.');
sqlite.close();fs.unlinkSync(file);console.log('PASS: chat safety.');
})().catch(e=>{console.error(e);process.exitCode=1});
