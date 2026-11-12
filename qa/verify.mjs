// Original Compendium source and persistence-contract checks. No dependencies.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {Script,runInNewContext} from "node:vm";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const names=["Causeway","Unpick","Longhand","Reckoner","Skein","Winnow","Cyphr"];
const match=/^const DOCS = (.+);$/m.exec(html);
assert.ok(match,"Embedded volume manifest must exist");
const docs=JSON.parse(match[1]);
assert.deepEqual(Object.keys(docs),names,"Exactly the seven original games, in order");
const volumes=JSON.parse(/^const VOLS = (.+);$/m.exec(html)?.[1]??"null");
assert.deepEqual(volumes.map(v=>v.name),names,"Seven clickable original launcher entries");
assert.ok(volumes.every(v=>v.has===true),"Every original game must remain enabled");

const shellStart=html.indexOf("<script>\nconst DOCS = ");
const shellEnd=html.indexOf("\n</script>",shellStart);
assert.ok(shellStart>0&&shellEnd>shellStart,"Host JavaScript boundary");
new Script(html.slice(shellStart+8,shellEnd),{filename:"compendium-shell.js"});
let compiled=1;
for(const [name,doc] of Object.entries(docs)){
  const tag=/<script([^>]*)>/.exec(doc);
  const end=doc.lastIndexOf("</script>");
  assert.ok(tag&&end>tag.index,name+" retains runnable script");
  const js=doc.slice(tag.index+tag[0].length,end);
  if(/\btype\s*=\s*["']module["']/.test(tag[1])){
    const checked=spawnSync(process.execPath,["--check","--input-type=module"],{input:js,encoding:"utf8"});
    assert.equal(checked.status,0,name+" module syntax: "+checked.stderr);
  }else new Script(js,{filename:name+".js"});
  compiled++;
  assert.ok(!/<script[^>]+src\s*=/.test(doc),name+" remains self-contained");
}
assert.equal(compiled,8,"Host and all seven volume scripts compile");
assert.ok(!/<script[^>]+src\s*=/.test(html),"No external scripts");
assert.ok(!/<link[^>]+href\s*=\s*["']https?:\/\//i.test(html),"No remote stylesheet");
assert.ok(!/\bfetch\s*\(/.test(html),"No fetch dependency");

for(const name of ["Causeway","Reckoner","Skein","Winnow"]){
  const doc=docs[name],key="cmp.v1."+name.toLowerCase()+".session";
  assert.ok(doc.includes(key),name+" has separate versioned session");
  assert.ok(doc.includes("Resume()"),name+" has state validation/restore entrypoint");
  assert.ok(doc.includes("pagehide"),name+" saves on interruption");
}
assert.ok(docs.Causeway.includes("wl_seen_"),"Causeway legacy history retained");
assert.ok(docs.Reckoner.includes("rk_seen_"),"Reckoner legacy history retained");
assert.ok(docs.Skein.includes("sk_seen_"),"Skein legacy history retained");
assert.ok(docs.Winnow.includes("wn_streak"),"Winnow historical streak retained");
assert.ok(docs.Unpick.includes("unpick.v1"),"Unpick existing progress key retained");
assert.ok(docs.Longhand.includes("lh.daily"),"Longhand daily state retained");
assert.ok(docs.Cyphr.includes("localStorage.getItem('cyphr')"),"Cyphr progress retained");
assert.ok(!html.includes("localStorage.clear("),"No blanket storage deletion");

// The library status reader must never mutate localStorage, legacy or sequel values.
const statusSrc=html.slice(html.indexOf("function saved(k)"),html.indexOf("function renderRoll()"));
assert.ok(statusSrc.startsWith("function saved(k)"),"Status classifier available");
const map=new Map();
const localStorage={getItem:k=>map.has(k)?map.get(k):null,
  setItem:()=>{throw Error("status must be read-only");},
  removeItem:()=>{throw Error("status must be read-only");}};
const status=runInNewContext(statusSrc+";statusFor;",{localStorage});
const set=(k,v)=>map.set(k,JSON.stringify(v));
let checks=0;
for(const name of names){assert.equal(status(name),"Play",name+" starts clean");checks++;}
set("cmp.v1.causeway.session",{v:1,finished:false});
assert.equal(status("Causeway"),"Continue");checks++;
set("cmp.v1.causeway.session",{v:1,finished:true});
assert.equal(status("Causeway"),"Played");checks++;
set("cmp.v1.winnow.session",{v:1,over:false});
assert.equal(status("Winnow"),"Continue");checks++;
set("lh.daily",{done:false,guesses:["a"]});
assert.equal(status("Longhand"),"Continue");checks++;
set("unpick.v1",{solved:4});
assert.equal(status("Unpick"),"Played");checks++;
set("cyphr",{prog:{"1:standard":{"12":"a"}}});
assert.equal(status("Cyphr"),"Continue");checks++;
set("c2.v.fell.state",{v:1,d:{correct:true}});
assert.equal(status("Reckoner"),"Play","Sequel data cannot change original status");checks++;
assert.deepEqual(JSON.parse(map.get("c2.v.fell.state")),{v:1,d:{correct:true}});
console.log("PASS: 7 original volumes, 8 scripts, original save-key contracts, "+checks+" status scenarios.");
console.log("Reminder: static checks do not prove browser end-to-end solves.");
