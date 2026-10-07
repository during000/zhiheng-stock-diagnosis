import json,datetime,hashlib,pathlib,urllib.request
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
base='https://www.moutaichina.com/mtgf/articleFileDir/'
sources=[
 {'id':'H26','title':'贵州茅台2026年半年度报告','url':base+'2026-08/17/277c9b776bff4ae89dde75e987437760.pdf','publishedAt':'2026-08-15','period':'2026-01-01 / 2026-06-30','publisher':'贵州茅台 · 公司官网','audit':'未经审计','file':'/tmp/maotai-2026h1.pdf'},
 {'id':'A25','title':'贵州茅台2025年年度报告','url':base+'2026-04/17/1b9fae59825c41bf9a776892a00565f7.pdf','publishedAt':'2026-04-17','period':'2025-01-01 / 2025-12-31','publisher':'贵州茅台 · 公司官网','audit':'标准无保留意见','file':'/tmp/maotai-2025.pdf'},
 {'id':'W26','title':'五粮液2026年半年度报告','url':'https://static.cninfo.com.cn/finalpage/2026-08-29/1225531252.PDF','publishedAt':'2026-08-29','period':'2026-01-01 / 2026-06-30','publisher':'巨潮资讯 · 公司定期报告','audit':'未经审计','file':'/tmp/wuliangye.pdf'},
 {'id':'L26','title':'泸州老窖2026年半年度报告','url':'https://static.cninfo.com.cn/finalpage/2026-08-26/1225501255.PDF','publishedAt':'2026-08-26','period':'2026-01-01 / 2026-06-30','publisher':'巨潮资讯 · 公司定期报告','audit':'未经审计','file':'/tmp/luzhou.pdf'}]
for s in sources:
 p=pathlib.Path(s.pop('file'))
 if not p.exists():
  p.write_bytes(urllib.request.urlopen(s['url'],timeout=30).read())
 s['fetchedAt']=now;s['sha256']=hashlib.sha256(p.read_bytes()).hexdigest()
# 精确保留原始字段；展示与派生指标由 engine 计算。
periods=[
 {'id':'2023FY','label':'2023 年度','revenue':147693604994.14,'profit':74734071550.75,'cfo':66593247721.09,'eps':59.49,'source':'A25','page':6},
 {'id':'2024FY','label':'2024 年度','revenue':170899152276.34,'profit':86228146421.62,'cfo':92463692168.43,'eps':68.64,'source':'A25','page':6},
 {'id':'2025FY','label':'2025 年度','revenue':168838102514.79,'profit':82320067101.68,'cfo':61522204989.35,'eps':65.66,'source':'A25','page':6},
 {'id':'2025H1','label':'2025 上半年','revenue':89389354416.84,'profit':45402962298.10,'cfo':13119061031.33,'cost':7777491083.93,'eps':36.18,'source':'H26','page':5},
 {'id':'2026H1','label':'2026 上半年','revenue':90703260964.48,'profit':44516880421.86,'cfo':70690750119.06,'cost':9473762565.88,'eps':35.57,'shares':1250081601,'source':'H26','page':5}]
peers=[{'name':'五粮液','code':'000858.SZ','revenue':28416674541.77,'previousRevenue':23509972048.65,'profit':8752942991.31,'source':'W26','page':6},{'name':'泸州老窖','code':'000568.SZ','revenue':10472224575.78,'previousRevenue':16453732904.65,'profit':4339264086.33,'source':'L26','page':7}]
kpath=pathlib.Path('/tmp/maotai-kline.json')
if not kpath.exists():
 kpath.write_bytes(urllib.request.urlopen('https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=sh600519,day,,,65,qfq',timeout=30).read())
k=json.loads(kpath.read_text())['data']['sh600519']['qfqday']
market={'source':'腾讯财经公开行情','url':'https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=sh600519,day,,,65,qfq','fetchedAt':now,'adjustment':'前复权（供应商口径）','bars':[{'date':r[0],'open':float(r[1]),'close':float(r[2]),'high':float(r[3]),'low':float(r[4]),'volumeLots':float(r[5])} for r in k], 'note':'非官方稳定接口，仅保留诊断用字段；非实时行情。不对接口可用性、复权算法作保证。'}
json.dump({'version':'2026-10-07.1','fetchedAt':now,'company':{'name':'贵州茅台','code':'600519.SH','type':'品牌消费 / 白酒，含财务子公司'},'sources':sources,'periods':periods,'peers':peers,'market':market,'raw':{'directSalesWan':5196204.70,'wholesaleWan':3869657.74,'contractLiabilities':3177561597.07,'previousContractLiabilities':8006739780.94}},open('data/evidence.json','w'),ensure_ascii=False,indent=2)
