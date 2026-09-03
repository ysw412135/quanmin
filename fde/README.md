# 全民中医 FDE 第一阶段底层引擎

本资产包实现的是“中医症状表达 / 预问诊助手”的底层，不是诊断、辨证或开方工具。

## 核心流水线

`模糊主诉 → 安全门 → 多个竞争假设 → 动态选择下一问 → 事实归一化 → 生成就诊前摘要`

系统始终区分：

- `reported_facts`：用户明确报告的事实；
- `normalized_facts`：系统对用户原话的结构化转写；
- `working_hypotheses`：只用于选下一问的内部竞争假设；
- `clinician_to_verify`：必须由医生检查或确认的项目；
- `uncertainties`：缺失、矛盾、无法可靠回答的信息。

## 资产

- `assets/Common_Complaints.json`：120 类模糊主诉；
- `assets/Reasoning_Framework.md`：三套框架及证据边界；
- `assets/Question_Engine.md`：下一问评分、更新与停止规则；
- `assets/Synthetic_Patients.jsonl`：1680 个固定虚拟患者（含240个独立的跨主诉/题库外样本）；
- `assets/Failure_Cases.json`：三轮对抗测试聚合与代表案例；
- `assets/Golden_Test_Set.json`：96 个固定发布回归用例；
- `assets/Symptom_Language_Map.json`：生活语言到专业症状表达映射；
- `assets/Visit_Summary_Schema.json`：《中医就诊前症状摘要》JSON Schema；
- `assets/Product_PRD.md`：冻结范围与验收标准；
- `assets/Codex_Implementation_Spec.md`：可直接开发的技术规格；
- `src/question-engine.mjs`：可运行的动态选问核心；
- `reports/verification-report.json`：构建与测试结果。

## 验证

```bash
npm run verify
```

合成测试通过只证明规则与数据约束按预期运行，不等于临床有效性已经得到验证。真实用户阶段开始前，必须完成原文锚点复核和执业中医师盲审。

## 本地落地版

本目录已补齐可运行原型层：

- `server/app.mjs`：本地 API 与静态页面服务；
- `server/start.mjs`：启动入口；
- `client/`：移动端优先的预问诊界面；
- `tests/api-smoke.mjs`：API 烟测，覆盖普通问答、红旗中断、入口澄清和摘要边界。

启动：

```bash
npm run start
```

打开：

```text
http://127.0.0.1:8787
```

iPhone 同一 Wi-Fi 下访问：

```text
http://192.168.1.33:8787
```

iOS 说明：

- Safari 可以直接使用预问诊问答和摘要页；
- “分享给家人/朋友”在 HTTPS 正式部署后可拉起 iOS 系统分享面板；
- 局域网 HTTP 下，iOS 可能限制系统分享或剪贴板权限，页面会退回到复制文本/手动转发。

接口：

- `POST /v1/interviews`
- `POST /v1/interviews/:id/answers`
- `GET /v1/interviews/:id/summary`
- `GET /v1/complaints`
- `GET /v1/verification-report`

落地版仍然坚持第一阶段边界：只整理症状表达和就诊前摘要，不输出证型、方剂、剂量或疗效承诺。
