import {test} from 'node:test';
import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5173';
const post=(body)=>fetch(origin+'/api/diagnose',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
test('健康接口真实数据版本与日期',async()=>{const r=await fetch(origin+'/api/health');assert.equal(r.status,200);const x=await r.json();assert.equal(x.sourceMode,'verified-public-snapshot');assert.equal(x.marketAsOf,'2026-09-30');});
test('非法维度和超长问题返回400',async()=>{assert.equal((await post({question:'测试',dimensions:['错误']})).status,400);assert.equal((await post({question:'a'.repeat(601)})).status,400);});
test('合规边界不调用模型并返回可查证据',async()=>{const r=await post({question:'现在能买茅台吗'});assert.equal(r.status,200);const x=await r.json();assert.equal(x.ai.status,'blocked');assert.ok(x.evidence.length>0);});
test('数据接口异常保留财报，阻断行情结论',async()=>{const r=await post({question:'完整诊断',scenario:'failure'});const x=await r.json();assert.equal(x.ai.status,'unavailable');assert.equal(x.metrics.pe,null);assert.ok(x.evidence.some(e=>e.id==='F01'));});
test('实时 AI 可用且每个引用来自当前证据',async()=>{const r=await post({question:'收入、利润与现金流的变化一致吗？'});const x=await r.json();assert.equal(x.ai.status,'live',x.ai.message);assert.ok(x.ai.insights.length>0);const ids=x.evidence.map(e=>e.id);for(const row of x.ai.insights){assert.ok(row.evidenceIds.every(id=>ids.includes(id)));assert.ok(!/\d/.test(row.text));}});
