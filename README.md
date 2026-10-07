# 知衡 · 证据研究工作台

一个可运行的 Web 产品，完成三份题目的核心任务：**自然语言选股 → 个股诊断 → 事件证据 → 返回修改条件**。选股使用三家白酒公司的真实数据；完整诊断和事件案例聚焦贵州茅台。所有数字来自公开核验快照，非实时行情。

- [打开产品](https://evidence-stock-diagnosis.eva000.chatgpt.site/)
- [源代码](https://github.com/during000/zhiheng-stock-diagnosis)
- [交付清单与三题验收入口](docs/DELIVERY.md)
- [事件题114秒操作视频](https://evidence-stock-diagnosis.eva000.chatgpt.site/media/event-demo.mp4)（必交）；[视频源文件](public/media/event-demo.mp4)

## 目标用户与设计

面向希望检查选股条件、理解公司状态、沿原始材料继续研究的个人投资者与研究人员。产品不给综合好坏评分或买卖建议；事实、推断、未知信息分别呈现。左侧仅一组模块导航；选股分三步逐步展开，维度设置、新材料导入、敏感性分析和详细边界按需展开。

### 自然语言选股

[意图选股](https://evidence-stock-diagnosis.eva000.chatgpt.site/#screen)：输入模糊想法，AI提取可修改条件。示例阈值单独标黄，用户确认后由确定性引擎执行。支持AND、上下限冲突检查、逐股逐条件的入选/排除/未知凭据、单条件放宽重算、多股比较、D1保存与恢复、JSON导出。茅台研究入口携带实际执行条件进入诊断，返回保留当前会话状态。

样本为贵州茅台、五粮液、泸州老窖，非全A市场。默认“经营改善”拆成收入与归母利润同比；PB≤8与波动≤35%只是可修改的示例，不能当作便宜或安全的结论。未支持意图需改写或明确移除，不能静默丢弃。缺少正TTM利润时PE保留未知。

### 个股多维诊断

[个股诊断](https://evidence-stock-diagnosis.eva000.chatgpt.site/#diagnosis)：选择贵州茅台600519.SH。根据品牌消费/白酒、含财务子公司的公司框架及用户问题选择六个维度；用户可覆盖选择。确定性指标配合LLM解读，表达正面、负面、矛盾与未知证据。支持财务期次、行情区间、估值情景、同行对比、证据抽屉、原始PDF页码、追问和导出。

### 投资事件情报

[事件证据](https://evidence-stock-diagnosis.eva000.chatgpt.site/#events)：回放茅台2024回购计划的五份真实公告。以标的、事件类型和原始方案日期识别同一事件；缺少锚点须人工复核。按披露时间合并，保留原证据、版本及前后差异；哈希去重。事实/观点/推测/传闻分类与权重分离，未核验用户材料权重始终为零。

发生、披露、原始采集、本工作区入库与结论更新时间分别展示。站内通知记录实质变化，重复导入不重复通知；可关注/取消、标记已读。真实进展与隔离模拟分开；模拟区验证传闻、否认、更正、冲突与过期。版本及通知由D1保存，刷新可恢复。

## AI、计算与数据的职责

|层|职责与约束|
|---|---|
|AI|OpenRouter调用`google/gemini-2.5-flash`；解释给定证据、提取选股条件和事件材料，提供可检查提案；不能获取或修改财报数字、确定来源权威性或做投资决策。|
|确定性引擎|`lib/engine.mjs`计算指标，`lib/screen.mjs`执行条件，`lib/events.mjs`处理去重、归并、版本、冲突和时效。|
|金融数据|`data/*.json`保存人工核验公开字段、原始链接、页码、单位、期次和SHA。财务、价格与复权口径分别保存。|
|校验与失败|检查输出结构、引用、阈值和部分合规模式；失败显式提示，保留证据/草稿，不伪造模型成功。引用存在不等于语义推断正确。|

研究问题和用户提交的材料会发往OpenRouter处理，界面在调用前说明。固定证据卡是开发时核验解读；仅模型请求成功的内容标为实时AI。

## 数据来源、口径与时点

- 财务：贵州茅台官网2025年报与2026半年报；巨潮资讯五粮液、泸州老窖2026半年报。最新财务期间2026H1，半年报未经审计。对比期及披露日期见证据。
- 行情：腾讯财经公开日线，截止2026-09-30；估值用未复权收盘价，走势用前复权序列。该替代接口不保证持续可用，前复权算法未独立审计。
- 事件：贵州茅台临2024-025、临2025-001/013/025/032；仅五个已收录节点，非全网最初来源或完整公告流。“拟注销”不等于已注销。
- 资料采集于2026-10-07。披露时间不以PDF路径日期代替，入库时间不代替发生或披露时间；日精度不补造时分秒。
- 年度和半年分别比较；合同负债相对上年末不称同比；营业收入不混入利息收入；直销占比以酒类主营业务收入为分母；合并现金流含财务子公司，不能直接等同酒类回款。
- 扶摇API、iFinD MCP没有可用授权，未连接。题目优先来源不可用时采用明确标注的公开材料，没有使用受限接口或伪称授权。

字段整理脚本是开发记录，不是自动财报解析器。生成诊断只刷新解释，不刷新行情或公告；本产品明确用于上述历史快照的研究。更换资料须重新核验字段、时间、SHA和测试。

## 本地启动

Node.js ≥22.13，npm。按顺序执行：

```sh
npm ci
cp .env.example .env
# 本机编辑.env，配置自己的OPENROUTER_API_KEY；不要提交密钥
npm run build
# 新建本地数据库时，按顺序执行以下两个迁移；已有库仅执行未应用的迁移
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_perpetual_kabuki.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_serious_grandmaster.sql
# 本地Worker用.dev.vars读取运行时secret，文件已加入gitignore
cp .env .dev.vars
npm start
```

打开终端打印的本地地址。修改页面开发可用`npm run dev`；数据库与模型接口的验收使用上述Worker方式。无模型密钥可查看核验数据与确定性功能，调用AI会明确提示未配置。

`OPENROUTER_API_KEY`仅服务端读取；`LLM_MODEL`默认`google/gemini-2.5-flash`。生产运行在Sites/Vinext/Cloudflare Workers，D1逻辑绑定为`DB`，发布时应用迁移。生产secret通过托管设置配置，不写入`.openai/hosting.json`或浏览器代码。

## 测试与验证材料

```sh
# Worker已启动，端口以终端实际输出为准
TEST_ORIGIN=http://127.0.0.1:8787 EVENT_BASE_URL=http://127.0.0.1:8787 SCREEN_ORIGIN=http://127.0.0.1:8787 node --test tests/*.test.mjs
npx tsc --noEmit
```

- 要求映射：[诊断](docs/REQUIREMENTS.md)、[事件](docs/EVENT_REQUIREMENTS.md)、[选股](docs/SCREEN_REQUIREMENTS.md)。
- AI使用、错误修正及真实调用记录：[诊断](docs/AI_USAGE.md)、[事件](docs/EVENT_AI_USAGE.md)、[选股](docs/SCREEN_AI_USAGE.md)。
- 主链路、数据/接口异常、极端与合规测试：[诊断](docs/TESTING.md)、[事件](docs/EVENT_TESTING.md)、[选股](docs/SCREEN_TESTING.md)。
- [前端验收](docs/WORKBENCH_VALIDATION.md)、[最终验收](docs/FINAL_VALIDATION.md)。历史验证与本次最终验证分别标注，部署成功不等同模型每次可用。
- 第一、第三题视频可选，未另录；第二题视频114秒，为实际产品操作画面剪辑，展示旧版布局，功能链路仍适用，非连续实时录屏。

## 已知边界与未做事项

只有三家样本，完整诊断与真实事件只覆盖茅台；无银行等其他公司框架、全市场检索、实时行情、完整行业排名、回测收益、交易执行或收益承诺。历史估值分位、一致预期、经销商库存、终端动销等缺失项保留未知。

没有后台公告采集、自动来源核验、研报全文授权、邮件/短信通知、跨设备账号同步。事件归并为可解释的简化锚点规则，不是任意复杂事件的通用聚类。冲突检测主要针对同披露日的确认字段；不同日相反陈述仍需人工判断是变化还是纠错。过期演练验证状态与通知，不宣称正在监控现实事件。

D1随机HttpOnly cookie隔离浏览器工作区，保存策略及事件；未保存草稿/诊断仅在单页会话保留，导出在本机。不是生产多租户权限系统。模型有外部服务失败与语义错误风险；未做全面金融合规、红队、负载或所有辅助技术审计。无服务端额度管理，公开链接用于有限评审体验。
