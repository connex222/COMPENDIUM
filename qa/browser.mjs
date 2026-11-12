// Review-only browser tests for the original seven games. No publishing.
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createServer} from "node:http";
import {chromium} from "playwright-core";
const names=["Causeway","Unpick","Longhand","Reckoner","Skein","Winnow","Cyphr"];
const html=readFileSync(new URL("../index.html",import.meta.url));
const chrome=[process.env.CHROME_BIN,"/usr/bin/google-chrome","/usr/bin/google-chrome-stable","/usr/bin/chromium"].find(p=>p&&existsSync(p));
assert.ok(chrome,"Chrome/Chromium executable required; set CHROME_BIN");
const server=createServer((req,res)=>{if(["/","/index.html"].includes((req.url||"").split("?")[0])){
 res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Content-Length":html.length,"Cache-Control":"no-store"});res.end(html);
}else{res.writeHead(404);res.end("Not found");}});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const url="http://127.0.0.1:"+server.address().port+"/";
let browser;const checks=[],errors=[];
try{
 browser=await chromium.launch({executablePath:chrome,headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"});
 await ctx.route("**/*",route=>route.request().url().startsWith(url)?route.continue():route.abort());
 const page=await ctx.newPage();
 page.on("pageerror",err=>errors.push(err.message));
 const f=()=>page.frameLocator("#frame");
 const frame=async()=>{const handle=await page.locator("#frame").elementHandle();assert.ok(handle,"missing iframe");return handle.contentFrame();};
 const key=async k=>page.evaluate(k=>{const s=localStorage.getItem(k);return s?JSON.parse(s):null;},k);
 async function roll(){
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.locator("#vols .vol").first().waitFor();
 }
 async function open(name){
  await page.locator("#vols .vol").nth(names.indexOf(name)).click();
  await page.waitForFunction(n=>{
   const f=document.querySelector("#frame");
   return !!f?.contentDocument?.title?.toLowerCase().includes(n.toLowerCase());
  },name,{timeout:20000});
  assert.ok(page.url().endsWith("#"+name.toLowerCase()),name+" hash");
 }
 async function back(){
  await f().locator("#cmp-home").evaluate(el=>el.click());
  await page.waitForFunction(()=>!document.querySelector("#home").classList.contains("hide"),null,{timeout:10000});
 }
 await roll();
 assert.equal(await page.locator("#vols .vol:not(.soon)").count(),7);
 checks.push("Seven working original collection entries");
 await page.evaluate(()=>localStorage.setItem("c2.v.fell.state",JSON.stringify({v:1,d:{sentinel:"DO-NOT-TOUCH"}})));
 for(const name of names){
  await open(name);
  await page.reload({waitUntil:"domcontentloaded"});
  await page.waitForFunction(n=>{
   const f=document.querySelector("#frame");
   return !!f?.contentDocument?.title?.toLowerCase().includes(n.toLowerCase());
  },name,{timeout:20000});
  await back();
  checks.push(name+": open, URL refresh, return to collection");
 }
 assert.deepEqual((await key("c2.v.fell.state")).d,{sentinel:"DO-NOT-TOUCH"});
 checks.push("Compendium II saved-state isolation");

 // Focused control regression checks on the original three flagship candidates.
 await roll();await open("Causeway");let focusGame=await frame();
 await focusGame.evaluate(()=>start(false));
 assert.match(await f().locator("#crossing-guide").innerText(),/valid step|One valid change|blocked/i,"Causeway explains remaining steps");
 await f().locator('#kb .key[data-k="a"]').click();
 await page.keyboard.press("Escape");
 assert.equal(await focusGame.evaluate(()=>S.typed),"","Causeway Escape clears unfinished text");
 await back();
 await open("Winnow");focusGame=await frame();
 await focusGame.evaluate(()=>start(false));
 const word=await focusGame.evaluate(()=>S.order[0].w);
 const tile=f().locator('#grid .tile').filter({hasText:new RegExp("^"+word+"$")});
 await tile.focus();
 await page.keyboard.press("Space");
 assert.match(await f().locator("#selection-guide").innerText(),/1 of 4 selected/,"Winnow explains selection progress");
 assert.equal(await tile.getAttribute("aria-pressed"),"true","Winnow announces selection");
 assert.equal(await tile.evaluate(el=>document.activeElement===el),true,"Winnow restores focus after re-render");
 await back();
 await open("Reckoner");focusGame=await frame();
 await focusGame.evaluate(()=>start(false));
 const editableCell=await focusGame.evaluate(()=>{for(let r=0;r<S.p.n;r++)for(let c=0;c<S.p.n;c++)if(!isGiven(r,c))return {r,c};});
 const keyboardCell=f().locator('#board .cell[data-r="'+editableCell.r+'"][data-c="'+editableCell.c+'"]');
 await keyboardCell.focus();
 await page.keyboard.press("Enter");
 assert.match(await f().locator("#constraint-guide").innerText(),/no visible rule conflicts/,"Reckoner explains current constraints");
 assert.equal(await keyboardCell.getAttribute("aria-pressed"),"true","Reckoner supports keyboard cell selection");
 // Entering a duplicate in a row should explain a conflict, not silently fail.
 const duplicate=await focusGame.evaluate(()=>{
   for(let r=0;r<S.p.n;r++){
     const editable=[];
     for(let c=0;c<S.p.n;c++)if(!isGiven(r,c))editable.push(c);
     if(editable.length>=2)return {r,c1:editable[0],c2:editable[1],v:1};
   }
   return null;
 });
 assert.ok(duplicate,"Reckoner puzzle has two editable cells in a row");
 for(const c of [duplicate.c1,duplicate.c2]){
   await f().locator('#board .cell[data-r="'+duplicate.r+'"][data-c="'+c+'"]').click();
   await f().locator('#pad-row .num[data-v="'+duplicate.v+'"]').click();
 }
 assert.match(await f().locator("#constraint-guide").innerText(),/rule conflicts/,"Reckoner explicitly reports duplicate conflict");
 await back();
 checks.push("Causeway Escape, Winnow focus/selection semantics and Reckoner keyboard selection");

 // Causeway: typed letter, interruption, then a genuine solution through virtual keys.
 await roll();await open("Causeway");
 let game=await frame();
 await game.evaluate(()=>start(false));
 const before=await game.evaluate(()=>({a:S.puzzle.a,b:S.puzzle.b,path:shortestPath(S.mode,S.puzzle.a,S.puzzle.b)}));
 assert.ok(before.path?.length>1,"Causeway has a valid route");
 await f().locator('#kb .key[data-k="a"]').click();
 assert.equal((await key("cmp.v1.causeway.session"))?.typed,"a");
 await page.reload({waitUntil:"domcontentloaded"});
 game=await frame();
 assert.equal(await game.evaluate(()=>S.typed),"a","Causeway typed entry survives refresh");
 await f().locator('#kb .key[data-k="del"]').click();
 for(const word of before.path.slice(1)){
  for(const letter of word)await f().locator('#kb .key[data-k="'+letter+'"]').click();
  await f().locator('#kb .key[data-k="go"]').click();
 }
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem("cmp.v1.causeway.session")||"null")?.finished===true,null,{timeout:12000});
 checks.push("Causeway: typed input restore and real word-ladder completion");
 await back();

 // Winnow: preserve a solved group and exact order, then finish through game controls.
 await open("Winnow");game=await frame();await game.evaluate(()=>start(false));
 let groups=await game.evaluate(()=>S.p.g.map(g=>g.w));
 for(const word of groups[0])await f().locator("#grid .tile").filter({hasText:new RegExp("^"+word+"$")}).click();
 await f().locator("#btn-submit").click();
 assert.equal((await key("cmp.v1.winnow.session"))?.done?.length,1);
 const ordered=(await key("cmp.v1.winnow.session")).order;
 await page.reload({waitUntil:"domcontentloaded"});game=await frame();
 assert.deepEqual(await game.evaluate(()=>S.order.map(t=>t.w)),ordered);
 for(const words of groups.slice(1)){
  for(const word of words)await f().locator("#grid .tile").filter({hasText:new RegExp("^"+word+"$")}).click();
  await f().locator("#btn-submit").click();
 }
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem("cmp.v1.winnow.session")||"null")?.over===true,null,{timeout:12000});
 checks.push("Winnow: correct groups, saved shuffled order, recovery and result");
 await back();

 // Reckoner and Skein: interactive state mutations and reload recovery.
 await open("Reckoner");game=await frame();await game.evaluate(()=>start(false));
 const editable=await game.evaluate(()=>{for(let r=0;r<S.p.n;r++)for(let c=0;c<S.p.n;c++)if(!isGiven(r,c))return {r,c,v:S.p.sol[r][c]};});
 await f().locator('.cell[data-r="'+editable.r+'"][data-c="'+editable.c+'"]').click();
 await f().locator('#pad-row .num[data-v="'+editable.v+'"]').click();
 assert.equal((await key("cmp.v1.reckoner.session")).grid[editable.r][editable.c],editable.v);
 await page.reload({waitUntil:"domcontentloaded"});game=await frame();
 assert.equal(await game.evaluate(({r,c})=>S.grid[r][c],editable),editable.v);
 checks.push("Reckoner: entered number and exact-grid recovery");
 await back();
 await open("Skein");game=await frame();await game.evaluate(()=>start(false));
 await f().locator("#btn-hint").click();
 const skein=(await key("cmp.v1.skein.session"));
 assert.ok(skein?.hints>0);
 await page.reload({waitUntil:"domcontentloaded"});game=await frame();
 assert.equal(await game.evaluate(()=>S.hints),skein.hints);
 checks.push("Skein: hint, board selection and state recovery");
 await back();


 // Complete Reckoner using actual number pad and board controls after restoring a partial grid.
 await open("Reckoner");game=await frame();
 const reck=await game.evaluate(()=>({sol:S.p.sol,grid:S.grid,n:S.p.n,given:S.p.g}));
 assert.ok(reck?.sol?.length>0,"Reckoner has solution data");
 for(let r=0;r<reck.n;r++)for(let c=0;c<reck.n;c++){
  if(reck.given.some(v=>v[0]===r&&v[1]===c)||reck.grid[r][c]===reck.sol[r][c])continue;
  const cell=f().locator('#board .cell[data-r="'+r+'"][data-c="'+c+'"]');
  if(await cell.evaluate(el=>el.classList.contains("sel")))await cell.click({force:true});
  await cell.click({force:true});
  await f().locator('#pad-row .num[data-v="'+reck.sol[r][c]+'"]').click();
 }
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem("cmp.v1.reckoner.session")||"null")?.done===true,null,{timeout:15000});
 await page.reload({waitUntil:"domcontentloaded"});
 assert.equal((await key("cmp.v1.reckoner.session")).done,true,"Reckoner completion kept after refresh");
 checks.push("Reckoner: complete board via number pad, verified result and refresh");
 await back();

 // Complete Skein using pointer drags that follow the in-game word paths.
 await open("Skein");game=await frame();
 const trace=await game.evaluate(()=>S.spans.filter(sp=>!S.found.has(sp.w)).map(sp=>sp.cells));
 assert.ok(trace.length>1,"Skein has unsolved word paths");
 for(const cells of trace){
  const centers=[];
  for(const i of cells){
   const bounds=await f().locator('#cells .cell[data-i="'+i+'"]').boundingBox();
   assert.ok(bounds,"Skein cell exists");
   centers.push({x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2});
  }
  await page.mouse.move(centers[0].x,centers[0].y);
  await page.mouse.down();
  for(const p of centers.slice(1))await page.mouse.move(p.x,p.y);
  await page.mouse.up();
 }
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem("cmp.v1.skein.session")||"null")?.done===true,null,{timeout:15000});
 await page.reload({waitUntil:"domcontentloaded"});
 assert.equal((await key("cmp.v1.skein.session")).done,true);
 checks.push("Skein: all word paths via real pointer tracing, completed result and reload");
 await back();

 // Unpick: interrupt an answer and finish through the original on-screen keyboard.
 await open("Unpick");game=await frame();
 await f().locator("#p-daily .kb button").first().waitFor({timeout:20000});
 if(await f().locator("#welcome").evaluate(e=>!e.hidden))await f().locator("#wSkip").click();
 const unpickAnswer=await game.evaluate(()=>daily.ans);
 assert.ok(/^[A-Z]+$/.test(unpickAnswer),"Unpick has answer");
 await f().locator('#p-daily .kb button[data-k="'+unpickAnswer[0]+'"]').click();
 assert.equal((await key("cmp.v1.unpick.session"))?.daily?.fill?.[0],unpickAnswer[0]);
 await page.reload({waitUntil:"domcontentloaded"});
 game=await frame();await f().locator("#p-daily .kb button").first().waitFor({timeout:20000});
 assert.equal(await game.evaluate(()=>daily.fill[0]),unpickAnswer[0],"Unpick restores answer input");
 for(const letter of unpickAnswer.slice(1))await f().locator('#p-daily .kb button[data-k="'+letter+'"]').click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem("unpick.v1")||"null")?.solved>=1,null,{timeout:12000});
 await page.reload({waitUntil:"domcontentloaded"});
 assert.ok((await key("unpick.v1")).solved>=1);
 checks.push("Unpick: interrupted answer, real daily solve and existing statistics");
 await back();


 // Longhand: calculate the deterministic daily answer from its own bundled deck,
 // then enter the answer exclusively using the on-screen keyboard.
 await open("Longhand");game=await frame();
 const docs=JSON.parse(html.toString("utf8").match(/^const DOCS = (.+);$/m)[1]);
 const marker="const ANSWERS = "+String.fromCharCode(96);
 const begin=docs.Longhand.indexOf(marker);
 const end=docs.Longhand.indexOf(String.fromCharCode(96)+'.split("\\n")',begin);
 assert.ok(begin>0&&end>begin,"Longhand daily word list present");
 const answers=docs.Longhand.slice(begin+marker.length,end).split("\n");
 const epoch=Date.UTC(2026,7,12),now=new Date();
 const day=Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())-epoch)/86400000)+1;
 const dailyAnswer=answers[((day-1)%answers.length+answers.length)%answers.length];
 assert.match(dailyAnswer,/^[a-z]{7}$/,"Longhand has valid deterministic daily answer");
 await f().locator("#t-play").click();
 await f().locator("#kb .key[data-k]").first().waitFor({timeout:20000});
 await page.waitForTimeout(700);
 if(await f().locator("#scrim").evaluate(e=>e.classList.contains("open")))
  await f().locator('#sheet [data-close]').click();
 await f().locator('#kb .key[data-k="'+dailyAnswer[0]+'"]').click();
 assert.equal((await key("lh.daily"))?.cur?.[0],dailyAnswer[0]);
 await page.reload({waitUntil:"domcontentloaded"});
 await f().locator("#t-play").click();
 await f().locator("#kb .key[data-k]").first().waitFor({timeout:20000});
 await page.waitForTimeout(650);
 if(await f().locator("#scrim").evaluate(e=>e.classList.contains("open")))
  await f().locator('#sheet [data-close]').click();
 assert.equal((await key("lh.daily"))?.cur?.[0],dailyAnswer[0],"Longhand restores typed entry");
 for(const letter of dailyAnswer.slice(1))await f().locator('#kb .key[data-k="'+letter+'"]').click();
 await f().locator('#kb .key[data-k="enter"]').click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem("lh.daily")||"null")?.won===true,null,{timeout:15000});
 await page.reload({waitUntil:"domcontentloaded"});
 assert.equal((await key("lh.daily")).won,true,"Longhand solved result survives refresh");
 checks.push("Longhand: saved daily input, actual keyboard solve and restored result");
 await back();

 // Cyphr: real cell-to-keyboard number mapping, recovery and full completion.
 await open("Cyphr");game=await frame();
 if(await f().locator("#guideSheet").evaluate(e=>e.classList.contains("on")))
  await f().locator("#guideClose").click();
 await f().locator("#plist .plink").first().click();
 const cipher=await game.evaluate(()=>({mapping:cur.k,given:{...given}}));
 assert.ok(Object.keys(cipher.mapping).length>0,"Cyphr letter map exists");
 const codes=Object.keys(cipher.mapping).filter(n=>!Object.prototype.hasOwnProperty.call(cipher.given,n));
 assert.ok(codes.length,"Cyphr has numbers to resolve");
 const first=codes[0],letter=cipher.mapping[first];
 await f().locator('#board .cell[data-num="'+first+'"]').first().click();
 await f().locator('#pad .key[data-l="'+letter+'"]').click();
 assert.equal((await key("cyphr"))?.prog?.["1:standard"]?.[first],letter,"Cyphr saves number mapping");
 await page.reload({waitUntil:"domcontentloaded"});
 game=await frame();
 if(await f().locator("#guideSheet").evaluate(e=>e.classList.contains("on")))await f().locator("#guideClose").click();
 await f().locator("#plist .plink").first().click();
 assert.equal(await game.evaluate(n=>assign[n],first),letter,"Cyphr restores number mapping");
 for(const n of codes.slice(1)){
  await f().locator('#board .cell[data-num="'+n+'"]').first().click();
  await f().locator('#pad .key[data-l="'+cipher.mapping[n]+'"]').click();
 }
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem("cyphr")||"null")?.done?.["1:standard"]===true,null,{timeout:15000});
 await page.reload({waitUntil:"domcontentloaded"});
 assert.equal((await key("cyphr")).done["1:standard"],true,"Cyphr solved record survives refresh");
 checks.push("Cyphr: number assignments, reload, full solution and results");
 await back();

 assert.equal(await page.locator(".sibling").getAttribute("href"),"https://connex222.github.io/COMPENDIUM-2/");
 checks.push("Sequel has a separate, explicit, opt-in link");


 // Skein accessibility: the same puzzle can be played without pointer dragging.
 await open("Skein");game=await frame();
 await f().locator("#go").click();
 const keyboardWord=await game.evaluate(()=>({n:S.p.n,word:S.spans[0].w,cells:S.spans[0].cells}));
 assert.ok(keyboardWord.cells.length>=3);
 let previous=keyboardWord.cells[0];
 await f().locator('#cells .cell[data-i="'+previous+'"]').focus();
 await page.keyboard.press("Space");
 for(const next of keyboardWord.cells.slice(1)){
  let r=Math.floor(previous/keyboardWord.n),c=previous%keyboardWord.n;
  const destR=Math.floor(next/keyboardWord.n),destC=next%keyboardWord.n;
  while(c<destC){await page.keyboard.press("ArrowRight");c++;}
  while(c>destC){await page.keyboard.press("ArrowLeft");c--;}
  while(r<destR){await page.keyboard.press("ArrowDown");r++;}
  while(r>destR){await page.keyboard.press("ArrowUp");r--;}
  await page.keyboard.press("Space");
  previous=next;
 }
 await page.keyboard.press("Enter");
 assert.equal(await game.evaluate(w=>S.found.has(w),keyboardWord.word),true,"Skein keyboard word solved");
 checks.push("Skein: roving grid focus, arrow navigation, Space tracing and Enter submission");
 await back();

 assert.deepEqual((await key("c2.v.fell.state")).d,{sentinel:"DO-NOT-TOUCH"});
 assert.deepEqual(errors,[],"No console page errors in any volume");
 console.log("PASS: "+checks.length+" browser checks\n"+checks.map(x=>"  - "+x).join("\n"));
 console.log("Coverage limit: Safari iOS, Android WebView, invalid input and standalone repository compatibility still need manual QA.");
}finally{await browser?.close();await new Promise(r=>server.close(r));}
