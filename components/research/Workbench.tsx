'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {PanelLeftClose,PanelLeftOpen,Search,ChartNoAxesCombined,GitBranch,Layers3,ShieldCheck,BookOpen,ChevronRight,CornerDownLeft} from 'lucide-react';
import Screen from './Screen';import Diagnosis from './Diagnosis';import Events from './Events';
import {Research,type View,type ScreenSummary} from './workspace-context';
const modes=[{id:'screen' as View,label:'意图选股',hint:'把想法变成条件',icon:Search},{id:'diagnosis' as View,label:'个股诊断',hint:'理解公司当前状态',icon:ChartNoAxesCombined},{id:'events' as View,label:'事件证据',hint:'追踪事实如何变化',icon:GitBranch}];
const questions:Record<string,string>={screen:'筛选条件中的收入、利润与估值，是否足以证明经营改善？还缺少哪些证据？',buyback:'回购涉及的资金使用与股本变化，应如何结合财务资料继续核验？'};
export default function Workbench({initialView}:{initialView:View}){
 const [view,setView]=useState<View>(initialView),[visited,setVisited]=useState<View[]>([initialView]),[collapsed,setCollapsed]=useState(false),[screen,setScreen]=useState<ScreenSummary|null>(null),[event,setEvent]=useState(''),[request,setRequest]=useState<{question:string;id:number}|null>(null);
 const scroller=useRef<HTMLDivElement>(null),positions=useRef<Partial<Record<View,number>>>({});
 const updateScreen=useCallback((s:ScreenSummary)=>setScreen(s),[]),updateEvent=useCallback((s:string)=>setEvent(s),[]);
 function switchView(next:View,research?:string,history=true){positions.current[view]=scroller.current?.scrollTop||0;setView(next);setVisited(v=>v.includes(next)?v:[...v,next]);if(research&&questions[research])setRequest({question:research==='screen'&&screen?`当前筛选条件为：${screen.rules}。这些条件是否足以证明贵州茅台经营改善？还缺少哪些证据？`:questions[research],id:Date.now()});if(history)window.history.pushState(null,'',`#${next}`);}
 useEffect(()=>{const sync=()=>{const hash=window.location.hash.slice(1) as View;const research=new URLSearchParams(window.location.search).get('research');const next=modes.some(m=>m.id===hash)?hash:research?'diagnosis':initialView;setView(next);setVisited(v=>v.includes(next)?v:[...v,next]);if(research&&questions[research])setRequest({question:questions[research],id:Date.now()});};sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);},[initialView]);
 useEffect(()=>{if(scroller.current)scroller.current.scrollTop=positions.current[view]||0;},[view]);
 function route(e:React.MouseEvent){const a=(e.target as HTMLElement).closest('a');if(!a||a.target==='_blank'||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;const href=a.getAttribute('href');if(!href||!/^\/(?:\?|$|screen(?:\?|$)|events(?:\?|$))/.test(href))return;e.preventDefault();const u=new URL(href,window.location.origin);const next=u.pathname==='/screen'?'screen':u.pathname==='/events'?'events':'diagnosis';switchView(next,u.searchParams.get('research')||undefined);}
 return <Research.Provider value={{screen,event,request,updateScreen,updateEvent}}><div className={`research-workspace ${collapsed?'rail-collapsed':''}`} onClick={route}>
 <aside className="workspace-rail" aria-label="研究工作台导航"><div className="workspace-logo"><span className="logo-mark"><Layers3 size={24}/></span><strong>知衡<span>AI 研究工作台</span></strong><button className="rail-toggle" onClick={()=>setCollapsed(!collapsed)} aria-label={collapsed?'展开侧边栏':'收起侧边栏'}>{collapsed?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}</button></div>
 <div className="rail-group-label">研究空间</div><nav className="workspace-nav" aria-label="研究模块">{modes.map(m=><button key={m.id} className={view===m.id?'is-current':''} onClick={()=>switchView(m.id)} aria-current={view===m.id?'page':undefined} title={m.label}><m.icon size={19}/><span><b>{m.label}</b><small>{m.hint}</small></span>{view===m.id&&<ChevronRight size={14}/>}</button>)}</nav>
 <div className="rail-group-label">当前研究</div><div className="research-company"><span className="company-avatar">茅</span><div><b>贵州茅台</b><small>600519.SH · 白酒</small></div></div>
 <div className="workspace-context"><div className="context-item"><span>选股条件</span><p>{screen?screen.intent:'尚未执行筛选'}</p>{screen&&<small>{screen.conditions} 项条件 · 入选 {screen.counts.included} · 排除 {screen.counts.excluded} · 未知 {screen.counts.unknown}</small>}</div><div className="context-item"><span>事件进展</span><p>{event||'进入事件证据后查看已归档进展'}</p></div><button className="return-screen" onClick={()=>switchView('screen')}><CornerDownLeft size={14}/>返回条件继续验证</button></div>
 <div className="rail-bottom"><ShieldCheck size={17}/><div>每个判断，都有依据<small>事实 · 推断 · 未知</small></div></div></aside>
 <div className="workspace-body"><header className="workspace-topbar"><div><span>研究工作台</span><ChevronRight size={13}/><b>{modes.find(m=>m.id===view)?.label}</b></div><div className="workspace-snapshot"><BookOpen size={14}/><span>公开证据 · 历史快照</span></div></header>
 <nav className="workspace-tabs" aria-label="研究步骤">{modes.map((m,i)=><button key={m.id} className={view===m.id?'is-current':''} aria-pressed={view===m.id} onClick={()=>switchView(m.id)}><span>0{i+1}</span>{m.label}</button>)}</nav>
 <div className="workspace-scroll" ref={scroller}>
 {modes.map(m=><section key={m.id} className={`workspace-module module-${m.id}`} hidden={view!==m.id} aria-label={m.label}>{visited.includes(m.id)&&(m.id==='screen'?<Screen/>:m.id==='diagnosis'?<Diagnosis/>:<Events/>)}</section>)}
 </div></div></div></Research.Provider>;
}
