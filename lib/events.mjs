export const weights={事实:5,观点:2,推测:1,传闻:0};
export function eventKey(d){return `${d.company}-${d.eventType}-${d.anchor}`;}
export function emptyState(){return {docs:[],versions:[],notifications:[],watch:true,asOf:null};}
export function sandboxDocs(){const base={company:'SIM001',eventType:'扩建',anchor:'2026-01-01',eventId:'SIM001-扩建-2026-01-01',verified:false,simulation:true,weight:0,url:null,page:null,announcement:'模拟材料',occurredAt:null,source:'隔离演练数据 · 不是现实公司公告',collectedAt:null,note:'仅用于验证状态演化。',relation:'direct'};return [
 {...base,id:'S01',title:'传闻：可能扩建',disclosedAt:'2026-01-01',kind:'传闻',claims:{扩建计划:'可能启动'},validUntil:'2026-01-05'},
 {...base,id:'S02',title:'模拟权威否认',disclosedAt:'2026-01-02',kind:'事实',weight:5,verified:true,denies:'S01',claims:{扩建计划:'否认：未启动'}},
 {...base,id:'S03',title:'模拟更正：否认措辞更正',disclosedAt:'2026-01-03',kind:'事实',weight:5,verified:true,corrects:'S02',claims:{扩建计划:'尚在论证，未作投资决定'}},
 {...base,id:'S04',title:'模拟研究观点',disclosedAt:'2026-01-03',kind:'观点',weight:2,claims:{研究判断:'扩建若落地，或增加资本开支'},validUntil:'2026-01-05'},
 {...base,id:'S05',title:'模拟冲突：同期另一份已核验材料',disclosedAt:'2026-01-03',kind:'事实',weight:5,verified:true,claims:{扩建计划:'已经作出投资决定'}},
 {...base,id:'S06',title:'模拟推测：扩建可能影响行业供给',disclosedAt:'2026-01-04',kind:'推测',weight:1,relation:'indirect',claims:{行业影响:'若投产，可能增加供给'}}];}
export function summarize(state){
 const groups={};
 for(const d of state.docs){const k=eventKey(d);(groups[k]??=[]).push(d);}
 return Object.entries(groups).map(([id,docs])=>{
  docs.sort((a,b)=>(a.disclosedAt||'9999').localeCompare(b.disclosedAt||'9999')||a.id.localeCompare(b.id));
  const superseded=new Set(docs.flatMap(d=>[d.corrects,d.denies].filter(Boolean)));
  const fields={};const evidence=docs.map(d=>({...d,evidenceStatus:superseded.has(d.id)?'已被更正或否认':d.validUntil&&state.asOf&&d.validUntil<state.asOf?'已过期':'有效'}));
  for(const d of evidence){if(d.evidenceStatus!=='有效'||d.kind!=='事实'||!d.verified)continue;
   for(const [key,value] of Object.entries(d.claims)){const old=fields[key];if(!old||d.disclosedAt>old.disclosedAt)fields[key]={value,ids:[d.id],disclosedAt:d.disclosedAt,conflict:false};else if(d.disclosedAt===old.disclosedAt){old.ids.push(d.id);if(old.value!==value){old.conflict=true;old.value='证据冲突，暂不定论';}}}
  }
  const conflict=Object.values(fields).some(f=>f.conflict);
  const hasDenial=evidence.some(d=>d.denies&&d.evidenceStatus==='有效');
  const active=evidence.filter(d=>d.evidenceStatus==='有效');
  const status=conflict?'证据冲突':hasDenial?'已有否认':fields['阶段']?.value|| (Object.keys(fields).length?'事实已更新':active.length?'待核验':'时效已失效');
  return {id,company:docs[0].company,anchor:docs[0].anchor,eventType:docs[0].eventType,first:docs[0].disclosedAt||'未知',earliestSourceId:docs[0].id,status,fields,evidence,conflict,conclusion:conflict?'存在同披露日相互矛盾的已核验材料，保留双方，等待更正。':Object.keys(fields).length?'以下事实仅在已收录材料范围内成立；观点、推测与传闻未用于确认事实。':'尚无可确认事实；不能以转载数量或模型回答替代原始凭据。'};
 });
}
export function applyDoc(state,doc,now=new Date().toISOString()){
 if(state.docs.some(d=>d.id===doc.id||d.sha256&&d.sha256===doc.sha256))return {state,duplicate:true,changed:false};
 if(state.docs.length>=100)throw new Error('证据包已达上限');
 const before=summarize(state);const next=structuredClone(state);const d={...doc,fetchedAt:now};next.docs.push(d);
 const after=summarize(next);const id=eventKey(d);const old=before.find(e=>e.id===id);const current=after.find(e=>e.id===id);
 const diff=[];for(const key of new Set([...Object.keys(old?.fields||{}),...Object.keys(current.fields)])){const a=old?.fields[key],b=current.fields[key];if(a?.value!==b?.value)diff.push({field:key,before:a?.value??'未知',after:b?.value??'未知',evidenceIds:b?.ids||[]});}
 if(old?.status!==current.status)diff.push({field:'当前状态',before:old?.status||'未建档',after:current.status,evidenceIds:[d.id]});
 const version={id:next.versions.length+1,eventId:id,sourceId:d.id,at:now,diff,summary:current.status,snapshot:current};next.versions.push(version);
 if(next.watch&&diff.length)next.notifications.unshift({id:`v${version.id}`,at:now,eventId:id,version:version.id,read:false,title:`${d.company} · ${current.status}`,diff});
 return {state:next,duplicate:false,changed:diff.length>0,eventId:id};
}
export function expire(state,asOf,now=new Date().toISOString()){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(asOf)||!Number.isFinite(Date.parse(asOf)))throw new Error('评估日期无效');
 if(state.asOf&&asOf<state.asOf)throw new Error('评估日期不能倒退');
 const next=structuredClone(state),before=summarize(state);next.asOf=asOf;const after=summarize(next);
 for(const e of after){const old=before.find(x=>x.id===e.id);const expired=e.evidence.filter(d=>d.evidenceStatus==='已过期'&&old?.evidence.find(x=>x.id===d.id)?.evidenceStatus!=='已过期');if(!expired.length)continue;
  const diff=[{field:'时效',before:'有效',after:`${expired.map(d=>d.id).join('、')} 已过期；撤出当前判断`,evidenceIds:expired.map(d=>d.id)}];
  const v={id:next.versions.length+1,eventId:e.id,sourceId:'expiry',at:now,diff,summary:e.status,snapshot:e};next.versions.push(v);if(next.watch)next.notifications.unshift({id:`v${v.id}`,at:now,eventId:e.id,version:v.id,read:false,title:'证据过期 · 请重新核验',diff});
 }return next;
}
export function identify(d,events){if(!d.company||!d.eventType||!/^\d{4}-\d{2}-\d{2}$/.test(d.anchor||''))return {decision:'review',reason:'缺少标的、事件类型或原始计划日期，不自动合并。',eventId:null};const id=eventKey(d);const found=events.find(e=>e.id===id);return {decision:found?'merge':'new',eventId:id,reason:found?'标的、类型和原始方案日期一致，可并入现有事件。':'没有完全一致的事件锚点，另建事件；仅同一标的不够。'};}
export function validateExtraction(x,text){
 if(!x||!['事实','观点','推测','传闻'].includes(x.kind)||!['回购','扩建','其他'].includes(x.eventType)||!/^\d{6}$/.test(x.company||''))throw new Error('模型结构无效');
 if(!text.includes(x.company))throw new Error('代码缺少原文依据');
 if(x.anchor!==null&&(!/^\d{4}-\d{2}-\d{2}$/.test(x.anchor)||!text.includes(x.anchor)))throw new Error('锚点必须逐字出现在输入');
 if(typeof x.quote!=='string'||x.quote.length<2||x.quote.length>240||!text.includes(x.quote))throw new Error('原文引用无效');
 if(typeof x.summary!=='string'||x.summary.length>240||/买入|卖出|目标价|稳赚|必涨/.test(x.summary))throw new Error('摘要不符合研究边界');
 // Do not let an LLM introduce new numbers into summaries.
 for(const n of x.summary.match(/\d+(?:\.\d+)?/g)||[])if(!text.includes(n))throw new Error('摘要引入无来源数字');
 return {company:x.company,eventType:x.eventType,anchor:x.anchor,kind:x.kind,quote:x.quote,summary:x.summary};
}
