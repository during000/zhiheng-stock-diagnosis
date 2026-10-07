# 交付清单

- 产品：知衡 · 个股证据诊断，贵州茅台600519.SH。
- 网站：https://evidence-stock-diagnosis.eva000.chatgpt.site 。托管平台确认发布succeeded；当前默认私有，外部评审前需授权公开。
- 源码：https://github.com/during000/zhiheng-stock-diagnosis （公开源码，不含密钥）。
- 主链路：研究问题 → 可改诊断维度 → 实时AI解释与确定性指标 → 事实/推断/未知与正负矛盾证据 → 原始字段/PDF/期次/行情/同行 → 追问/导出。
- README、题目对应、AI使用记录、测试说明、真实模型调用样例、测试结果、演示脚本已提供。
- 演示视频：本题可选，未录制。
- 数据服务：无扶摇/iFinD访问凭据；采用公开原始财报与明确标注的腾讯历史行情替代，非实时服务。


第二题新增 /events，详见EVENT_REQUIREMENTS.md；视频docs/media/event-demo.mp4（114秒），AI记录EVENT_AI_USAGE.md及event-validation.json，测试EVENT_TESTING.md。真实公告五节点与异常演练隔离。网站当前访问限制仍需所有者决定是否向评审开放。

第三题新增 `/screen`，三家公司真实样本选股，AI解析/条件编辑/冲突阻断/三值结果/原始凭据/单条件敏感性/比较/D1保存恢复/导出/诊断衔接已实现。README及SCREEN_REQUIREMENTS.md、SCREEN_AI_USAGE.md、SCREEN_TESTING.md、screen-validation.json齐备；44项自动化检查通过。第三题附件视频为可选，本次未另录视频。
