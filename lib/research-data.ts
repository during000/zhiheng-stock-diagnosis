import screen from '@/data/screen.json';import evidence from '@/data/evidence.json';import {env} from 'cloudflare:workers';import {loadFuyao} from './fuyao.mjs';
let cache:Awaited<ReturnType<typeof loadFuyao>>|null=null;let expiry=0;let pending:Promise<Awaited<ReturnType<typeof loadFuyao>>>|null=null;
export function fuyaoKey(){const runtime=env as unknown as Record<string,string>;return runtime.FUYAO_API_KEY||process.env.FUYAO_API_KEY;}
export async function researchData(){
 const key=fuyaoKey();if(!key)return {screen,evidence,provider:{name:'公开核验快照',status:'not_configured',note:'扶摇未配置；明确使用公开历史快照'}};
 if(!cache||Date.now()>expiry){pending??=loadFuyao(screen,key);try{cache=await pending;expiry=Date.now()+900000;}finally{pending=null;}}
 const mt=cache.stocks.find((x:{code:string})=>x.code==='600519.SH');
 return {screen:cache,evidence:{...evidence,version:evidence.version+'-fuyao',market:{...evidence.market,...mt.market}},provider:cache.provider};
}
