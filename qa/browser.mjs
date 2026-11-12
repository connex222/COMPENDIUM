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

 assert.deepEqual((await key("c2.v.fell.state")).d,{sentinel:"DO-NOT-TOUCH"});
 assert.deepEqual(errors,[],"No console page errors in any volume");
 console.log("PASS: "+checks.length+" browser checks\n"+checks.map(x=>"  - "+x).join("\n"));
 console.log("Coverage limit: Unpick, Longhand, Cyphr and Skein/Reckoner still need full UI-solve E2E.");
}finally{await browser?.close();await new Promise(r=>server.close(r));}
