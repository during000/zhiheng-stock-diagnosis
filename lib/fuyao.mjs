const origin='https://fuyao.aicubes.cn';
export const chinaDay=ms=>new Date(ms+8*3600000).toISOString().slice(0,10);
export async function fuyaoRequest(path,key,fetcher=fetch){
 if(!key)throw Error('扶摇密钥未配置');
 let r;try{r=await fetcher(origin+path,{headers:{'X-api-key':key},signal:AbortSignal.timeout(25000)});}catch{throw Error('扶摇连接失败或超时；未切换为正常结果');}
 if(!r.ok)throw Error(r.status===429?'扶摇请求限流，请稍后重试':'扶摇HTTP调用失败');
 let x;try{x=await r.json();}catch{throw Error('扶摇返回非JSON数据');}
 if(x.code!==0)throw Error(x.code===2001||x.code===2003?'扶摇鉴权或数据权限不足':x.code===4001?'扶摇请求限流，请稍后重试':`扶摇业务错误（${Number(x.code)||'未知'}）`);
 if(!x.data||!Array.isArray(x.data.item))throw Error('扶摇响应结构异常');
 return {...x.data,requestId:x.request_id,endpoint:origin+path,fetchedAt:new Date().toISOString()};
}
async function mapLimited(items,fn){const result=[];for(let i=0;i<items.length;i+=2){const chunk=await Promise.all(items.slice(i,i+2).map(fn));result.push(...chunk);}return result;}
export function verifiedFinancials(stock,income,cash){
 const period=(xs,year)=>xs.find(x=>x.thscode===stock.code&&x.currency==='CNY'&&x.fiscal_year===year&&x.fiscal_period==='Q2'&&chinaDay(x.period_end_ms)===`${year}-06-30`);
 const now=period(income.item,2026),prev=period(income.item,2025),cf=period(cash.item,2026);
 const values={revenue:now?.operating_income,profit:now?.parent_holder_net_profit,previousRevenue:prev?.operating_income,previousProfit:prev?.parent_holder_net_profit,cfo:cf?.act_cash_flow_net};
 for(const [field,value] of Object.entries(values)){if(!Number.isFinite(value))throw Error(`${stock.name}扶摇财务字段缺失：${field}`);if(Math.abs(value-stock.raw[field])>0.011)throw Error(`${stock.name}扶摇与公告字段冲突：${field}，停止合并`);}
 return {values,reportDate:chinaDay(now.report_date_ms),periodEnd:'2026-06-30',currency:'CNY',basis:'上半年合并累计值；与公告人民币元字段逐项核对',sources:[income,cash].map(({requestId,endpoint,fetchedAt,timestamp})=>({requestId,endpoint,fetchedAt,timestamp})),status:'matched'};
}
export function verifiedBars(data,code,asOf){
 const seen=new Set();const bars=data.item.map(x=>({date:chinaDay(x.date_ms),close:x.close_price})).sort((a,b)=>a.date.localeCompare(b.date));
 if(bars.length<65||bars.at(-1)?.date!==asOf||bars.some(x=>!Number.isFinite(x.close)||x.close<=0||x.date>asOf||seen.has(x.date)||!seen.add(x.date)))throw Error(`${code}扶摇行情缺失、重复或时点不一致`);
 return bars.slice(-65);
}
export async function loadFuyao(base,key,fetcher=fetch){
 const codes=base.stocks.map(s=>s.code).join(',');
 const request=path=>fuyaoRequest(path,key,fetcher);
 const end=Date.parse(base.asOf+'T23:59:59+08:00'),start=Date.parse('2026-06-01T00:00:00+08:00');
 const stocks=await mapLimited(base.stocks,async stock=>{
  const [income,cash]=await Promise.all(['income-statements','cash-flow-statements'].map(kind=>request(`/api/a-share/financials/${kind}?thscode=${stock.code}&period=quarterly&limit=8`)));
  const financial=verifiedFinancials(stock,income,cash);
  const path=`/api/a-share/prices/historical?thscode=${stock.code}&interval=1d&start=${start}&end=${end}`;
  const [forward,raw]=await Promise.all(['forward','none'].map(adjust=>request(path+'&adjust='+adjust)));
  const bars=verifiedBars(forward,stock.code,base.asOf),unadjusted=verifiedBars(raw,stock.code,base.asOf);
  const payload=JSON.stringify({forward:forward.item,raw:raw.item});const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  return {...stock,raw:{...stock.raw,...financial.values},fuyaoFinancial:financial,market:{...stock.market,bars,rawClose:unadjusted.at(-1).close,url:forward.endpoint,rawUrl:raw.endpoint,sha256:hash,fetchedAt:forward.fetchedAt,provider:'扶摇',requestIds:[forward.requestId,raw.requestId]}};
 });
 const [prices,valuations]=await Promise.all([request('/api/a-share/prices/snapshot?thscodes='+codes),request('/api/a-share/valuations/snapshot?thscodes='+codes)]);
 return {...base,version:base.version+'-fuyao',stocks,provider:{name:'扶摇',status:'connected',fetchedAt:new Date().toISOString(),marketAsOf:base.asOf,cacheSeconds:900,note:'筛选使用固定历史窗口；最新行情与供应商估值仅作独立核验，不混入历史筛选。财务逐项对照公告；股本及净资产仍取公告。',latest:{prices,valuations}}};
}
