// Live release checks. Sends only constructed/public research text, no user data.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const base=process.env.RELEASE_ORIGIN;
if(!base||!/^https?:\/\//.test(base))throw Error('Set RELEASE_ORIGIN to the release URL');
const checks=[];
async function get(path){const r=await fetch(base+path,{redirect:'manual',signal:AbortSignal.timeout(35000)});return r;}
async function post(path,body){const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(35000)});assert.equal(r.status,200,await r.clone().text());return r.json();}
for(const path of ['/','/screen','/events']){const r=await get(path);assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/html/);assert.match(await r.text(),/研究工作台/);checks.push({path,status:r.status,anonymous:true});}
const v=await get('/media/event-demo.mp4');assert.equal(v.status,200);assert.match(v.headers.get('content-type'),/video\/mp4/);const bytes=await v.arrayBuffer();assert.ok(bytes.byteLength>1000000);checks.push({path:'/media/event-demo.mp4',status:200,type:'video/mp4',bytes:bytes.byteLength,anonymous:true});
const screen=await post('/api/screen/parse',{text:'经营改善、估值合理、走势相对稳定'});assert.equal(screen.status,'live');assert.equal(screen.plan.conditions.length,4);assert.ok(screen.plan.conditions.every(c=>c.assumption));checks.push({path:'/api/screen/parse',status:screen.status,model:screen.model,conditions:screen.plan.conditions.map(c=>({field:c.field,op:c.op,value:c.value,assumption:c.assumption}))});
const events=await post('/api/events/analyze',{text:'贵州茅台（600519）原始回购方案披露日为2024-09-21。本评论认为，回购若完成或改善每股指标，但尚不能证明经营需求改善。'});assert.equal(events.status,'live');assert.equal(events.extracted.kind,'观点');assert.equal(events.extracted.anchor,'2024-09-21');checks.push({path:'/api/events/analyze',status:events.status,model:events.model,extracted:events.extracted});
const record={verifiedAt:new Date().toISOString(),origin:base,authorization:'none; public requests without Sites login or bypass headers',checks};
await writeFile('docs/production-validation.json',JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify({passed:checks.length,record:'docs/production-validation.json'}));
