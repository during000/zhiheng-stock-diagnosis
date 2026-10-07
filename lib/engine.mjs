export const dimensions = ['经营质量','财务趋势','估值','行情特征','行业位置','事件与风险'];
export function ratio(a,b){return Number.isFinite(a)&&Number.isFinite(b)&&b!==0?a/b:null;}
export function growth(a,b){const r=ratio(a,b);return r===null||b<=0?null:(r-1)*100;}
export function pct(v){return v===null?'无法计算':`${v>=0?'+':''}${v.toFixed(2)}%`;}
export function yi(v){return (v/1e8).toFixed(2);}
export function valuation(price,profit,shares){const eps=ratio(profit,shares);return price>0&&eps>0?price/eps:null;}
export function marketStats(bars){
 if(!Array.isArray(bars)||bars.length<2||bars.some(b=>!Number.isFinite(b.close)||b.close<=0))return null;
 let peak=bars[0].close,drawdown=0;const returns=[];
 for(let i=0;i<bars.length;i++){peak=Math.max(peak,bars[i].close);drawdown=Math.min(drawdown,bars[i].close/peak-1);if(i)returns.push(Math.log(bars[i].close/bars[i-1].close));}
 const avg=returns.reduce((a,b)=>a+b,0)/returns.length;
 const variance=returns.length>1?returns.reduce((a,b)=>a+(b-avg)**2,0)/(returns.length-1):0;
 return {start:bars[0].date,end:bars.at(-1).date,count:bars.length,change:(bars.at(-1).close/bars[0].close-1)*100,drawdown:drawdown*100,volatility:Math.sqrt(variance*252)*100,last:bars.at(-1).close};
}
export function selectDimensions(question){
 const tests=[/经营|质量|毛利|渠道|直销|生意|现金|回款/,/财务|现金|利润|收入|增长|回款/,/估值|贵|便宜|市盈率|PE|价格/i,/行情|波动|走势|回撤|股价/,/同行|行业|五粮液|老窖|比较/,/风险|事件|合同负债|改革|预收|传闻/];
 const found=dimensions.filter((d,i)=>tests[i].test(question));return found.length?found:dimensions;
}
export function isAdvice(q){return /买入|卖出|买不买|能买|该买|该卖|买点|卖点|荐股|涨多少|跌多少|保证收益|稳赚|目标价|buy|sell|稳赚|抄底|建仓|清仓|收益承诺/i.test(q);}
export function freshness(date,now=new Date()){const days=Math.floor((now.getTime()-new Date(date).getTime())/86400000);return {days,state:days<0?'future':days>7?'stale':'snapshot'};}
export function buildDiagnosis(data,question='',selected=dimensions,scenario='normal'){
 if(!Array.isArray(selected)||selected.some(d=>!dimensions.includes(d)))throw new Error('诊断维度无效');
 const cur=data.periods.find(p=>p.id==='2026H1'),prev=data.periods.find(p=>p.id==='2025H1');
 const g=growth(cur.revenue,prev.revenue),pg=growth(cur.profit,prev.profit),cg=growth(cur.cfo,prev.cfo);
 const gross=(1-cur.cost/cur.revenue)*100,oldgross=(1-prev.cost/prev.revenue)*100;
 const stats=scenario==='missing'||scenario==='failure'?null:marketStats(data.market.bars);
 const ttm=data.periods.find(p=>p.id==='2025FY').profit+cur.profit-prev.profit;
 const pe=stats?valuation(stats.last,ttm,cur.shares):null;
 const direct=data.raw.directSalesWan/(data.raw.directSalesWan+data.raw.wholesaleWan)*100;
 const contract=growth(data.raw.contractLiabilities,data.raw.previousContractLiabilities);
 const evidence=[
 {id:'F01',dimension:'财务趋势',type:'事实',stance:'正面',title:'营业收入小幅增长',text:`营业收入 ${yi(cur.revenue)} 亿元，同比 ${pct(g)}。`,source:'H26',page:5,field:'营业收入',values:[cur.revenue,prev.revenue],formula:'(本期营业收入 / 上年同期营业收入 − 1) × 100%',scope:'合并报表；2026 / 2025 上半年；人民币元，不含利息收入'},
 {id:'F02',dimension:'财务趋势',type:'事实',stance:'负面',title:'收入与利润方向不一致',text:`归母净利润 ${yi(cur.profit)} 亿元，同比 ${pct(pg)}。`,source:'H26',page:5,field:'归属于上市公司股东的净利润',values:[cur.profit,prev.profit],formula:'(本期归母净利润 / 上年同期归母净利润 − 1) × 100%',scope:'合并归母口径；同比；不是环比'},
 {id:'F03',dimension:'经营质量',type:'事实',stance:'负面',title:'毛利率仍高，但同比收窄',text:`营业收入口径毛利率 ${gross.toFixed(2)}%，同比变化 ${(gross-oldgross).toFixed(2)} 个百分点。`,source:'H26',page:7,field:'营业收入 / 营业成本',values:[cur.revenue,cur.cost,prev.revenue,prev.cost],formula:'(营业收入 − 营业成本) / 营业收入 × 100%',scope:'合并营业收入口径；不含财务子公司利息收入，非归母净利率'},
 {id:'F04',dimension:'经营质量',type:'事实',stance:'矛盾',title:'现金流增长需要拆解来源',text:`经营现金流净额 ${yi(cur.cfo)} 亿元，同比 ${pct(cg)}。公告将增量主要归因于财务子公司存款业务变化。`,source:'H26',page:5,field:'经营活动产生的现金流量净额及变动说明',values:[cur.cfo,prev.cfo],formula:'(本期经营现金流净额 / 上年同期经营现金流净额 − 1) × 100%',scope:'含财务子公司的合并口径；不等于酒类经营现金流'},
 {id:'F05',dimension:'经营质量',type:'事实',stance:'正面',title:'直销构成重要渠道',text:`酒类主营收入中直销占比 ${direct.toFixed(2)}%。渠道占比本身不能证明终端需求改善。`,source:'H26',page:8,field:'按销售渠道：直销 / 批发代理',values:[data.raw.directSalesWan,data.raw.wholesaleWan],formula:'直销 / (直销 + 批发代理) × 100%',scope:'原始单位万元；酒类主营业务口径，不是合并营业收入分母'},
 {id:'F06',dimension:'事件与风险',type:'事实',stance:'矛盾',title:'预收货款政策改变可比性',text:`合同负债期末 ${yi(data.raw.contractLiabilities)} 亿元，较年末 ${pct(contract)}。公司解释涉及销售模式和预收货款政策调整。`,source:'H26',page:9,field:'合同负债及情况说明',values:[data.raw.contractLiabilities,data.raw.previousContractLiabilities],formula:'(本期末 / 上年末 − 1) × 100%',scope:'2026-06-30 对比 2025-12-31；期末环比，不能称同比'},
 {id:'F07',dimension:'事件与风险',type:'事实',stance:'中性',title:'营销体系处于市场化改革中',text:'公司披露调整产品、动态定价和多渠道布局；实施效果仍需后续财报与终端数据验证。',source:'H26',page:7,field:'管理层讨论与分析：改革转型',values:[],formula:'定性披露；公司陈述，不代表效果已获独立验证',scope:'2026 上半年；经营计划与实际成效分开'},
 {id:'F08',dimension:'行业位置',type:'事实',stance:'中性',title:'同业表现存在明显分化',text:`同口径营业收入：茅台 ${yi(cur.revenue)} 亿元、五粮液 ${yi(data.peers[0].revenue)} 亿元、泸州老窖 ${yi(data.peers[1].revenue)} 亿元。`,source:'H26',page:5,relatedSources:['W26','L26'],field:'三家公司合并营业收入',values:[cur.revenue,...data.peers.map(p=>p.revenue)],formula:'同为 2026 上半年合并营业收入；不做样本外排名',scope:'仅选取两家白酒同业，不能代表行业整体或市场份额'},
 {id:'F09',dimension:'估值',type:pe===null?'未知':'事实',stance:pe===null?'未知':'中性',title:pe===null?'估值暂不可计算':'用可复算口径理解估值',text:pe===null?'行情缺失，停止计算市盈率。':`以 ${stats.end} 收盘价与最新已披露利润计算，市盈率约 ${pe.toFixed(2)} 倍。`,source:'A25',page:6,relatedSources:['H26'],field:'TTM 归母净利润 / 最新期末股本 / 行情收盘价',values:pe===null?[]:[stats.last,ttm,cur.shares],formula:'PE = 收盘价 × 最新期末股本 / (2025全年归母净利润 + 2026H1 − 2025H1)',scope:'期末股本近似估值口径；不采用加权EPS；非盈利预测；非历史估值分位'},
 {id:'F10',dimension:'行情特征',type:stats?'事实':'未知',stance:stats?'中性':'未知',title:stats?'波动与回撤描述历史路径':'行情源不可用',text:stats?`${stats.start} 至 ${stats.end}，前复权收盘收益 ${pct(stats.change)}，最大收盘回撤 ${pct(stats.drawdown)}。`:'缺少有效行情序列，不能计算波动或回撤。',source:'MARKET',page:0,field:'前复权日线收盘价',values:stats?[stats.count,stats.volatility]:[],formula:'区间收益 = 末值/首值 − 1；回撤 = min(当日收盘 / 此前最高收盘 − 1)；波动率 = 日对数收益样本标准差 × √252',scope:'前复权收盘价；不代表未来走势；非盘中最大回撤'},
 {id:'I01',dimension:'经营质量',type:'推断',stance:'矛盾',title:'不能把现金流跳升直接当成主业改善',text:'合并现金流受财务子公司资金往来影响；判断酒类回款质量，需要进一步拆解销售收现和财务业务流量。',source:'H26',page:5,field:'基于 F04 的分析推断',values:[],formula:'证据 F04 → 公司类型修正 → 待验证问题；无因果保证',scope:'分析推断，需分部现金流验证'},
 {id:'U01',dimension:'事件与风险',type:'未知',stance:'未知',title:'终端动销与渠道库存尚未独立验证',text:'现有公告无法验证经销商库存、真实终端成交价与消费需求是否改善，不能将渠道改革等同于需求复苏。',source:'H26',page:7,field:'现有材料覆盖边界',values:[],formula:'缺少独立渠道数据；暂不生成定量结论',scope:'待验证问题，不是负面事实'},
 {id:'U02',dimension:'估值',type:'未知',stance:'未知',title:'历史估值分位与盈利预期未接入',text:'缺少同口径历史估值序列及一致预期，无法判定当前估值在历史上的位置，也不能给出合理目标价。',source:'A25',page:6,field:'数据缺口',values:[],formula:'无历史序列，不生成分位数字',scope:'当前 PE 不能单独证明贵或便宜'}
 ];
 if(scenario==='conflict')evidence.push({id:'X01',dimension:'财务趋势',type:'未知',stance:'矛盾',title:'异常演练：同一字段出现冲突',text:'模拟另一来源给出不同收入值；该值不是公司真实数据。停止合并冲突字段，保留已核验公告及冲突提示。',source:'H26',page:5,field:'营业收入：模拟冲突',values:[],formula:'冲突来源隔离，不覆盖已核验数据',scope:'测试模拟，不纳入真实分析'});
 if(scenario==='stale')evidence.push({id:'X02',dimension:'行情特征',type:'未知',stance:'未知',title:'异常演练：行情过期',text:'模拟行情超过有效期；历史数据仍可查，暂停当前估值判断。',source:'MARKET',page:0,field:'模拟过期',values:[],formula:'过期状态阻断当前判断',scope:'测试模拟'});
 const suppressed=scenario==='stale'?evidence.map(e=>['F09','F10'].includes(e.id)?{...e,type:'未知',stance:'未知',text:'行情已在异常演练中标记过期，仅可查看历史样本，暂停当前判断。',values:[]}:e):evidence;
 return {question,selected,scenario,evidence:suppressed.filter(e=>selected.includes(e.dimension)),allEvidence:suppressed,metrics:{revenueGrowth:g,profitGrowth:pg,cfoGrowth:cg,gross,direct,ttm,pe:scenario==='stale'?null:pe,stats},adviceBlocked:isAdvice(question)};
}
export function validateInterpretation(value,allowedIds){
 if(!value||typeof value.reason!=='string'||value.reason.length>500||!Array.isArray(value.insights)||value.insights.length>5)throw new Error('模型返回结构不符合要求');
 for(const row of value.insights){if(!['推断','未知'].includes(row.type))throw new Error('模型类别无效');if(typeof row.text!=='string'||row.text.length>500)throw new Error('模型文本无效');if(/\d/.test(row.text))throw new Error('模型文本含数字');if(/(?:直销|渠道)占比.{0,6}(?:提升|提高|增长|增加|下降)/.test(row.text))throw new Error('模型无依据推断占比变化');if(isAdvice(row.text))throw new Error('模型文本触发合规词');if(!Array.isArray(row.evidenceIds)||!row.evidenceIds.length||row.evidenceIds.some(id=>!allowedIds.includes(id)))throw new Error('模型引用ID无效');}
 if(/\d/.test(value.reason)||isAdvice(value.reason))throw new Error('诊断规划未通过校验');
 return value;
}
