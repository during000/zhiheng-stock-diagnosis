import {env} from 'cloudflare:workers';
export function workspace(req:Request){const match=req.headers.get('cookie')?.match(/(?:^|;\s*)event_workspace=([a-f0-9-]{36})(?:;|$)/);const id=match?.[1]||crypto.randomUUID();return {id,cookie:match?undefined:`event_workspace=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000${new URL(req.url).protocol==='https:'?'; Secure':''}`};}
export function db(){if(!env.DB)throw new Error('数据库暂不可用');return env.DB;}
export function response(body:unknown,status=200,cookie?:string){return Response.json(body,{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});}
