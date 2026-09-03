# Codex_Implementation_Spec

## 技术目标

实现一个可重复、可审计、不可越界的问诊状态机。LLM只负责理解自由文本和生成自然语言，不得直接决定证型或绕过规则引擎。

## 模块

1. `complaint-router`：把原话召回到1–3个主诉类；低置信度先澄清。
2. `safety-gate`：独立规则，任何时候均可中断进入 urgent_handoff。
3. `fact-normalizer`：输出 value、source、confidence、time_scope；unknown ≠ no。
4. `hypothesis-store`：内部多候选及来源框架；默认不序列化到用户摘要。
5. `question-ranker`：按 EIG×可靠度×决策作用÷负担排序，并执行硬约束。
6. `contradiction-resolver`：优先澄清“之前/现在”“偶尔/持续”“用户/家属观察”。
7. `stop-controller`：覆盖度、边际价值、矛盾和负担上限共同决定。
8. `summary-composer`：严格按 Visit_Summary_Schema 输出。
9. `audit-log`：记录每轮候选问题、分数、未选原因、规则版本。

## API

### POST /v1/interviews
输入：`{ opening_utterance, patient_context? }`
输出：`{ interview_id, question, status }`

### POST /v1/interviews/:id/answers
输入：`{ question_id, option?, free_text?, time_scope? }`
输出：`{ next_question?, status, progress }`

### GET /v1/interviews/:id/summary
输出必须通过 `Visit_Summary_Schema.json` 校验；不得包含 hypothesis 概率、方剂、剂量。

## 数据约束

- 每个事实保存 `raw_text`、`normalized_value`、`source=user_report|clinician|device`、`confidence`、`time_scope`；
- 专业检查字段只有 clinician/device source 才能成为 confirmed；
- 规则与问题都有版本号；回归结果必须绑定版本；
- 日志中个人身份字段与症状内容分表存储；原型阶段默认不收姓名身份证。

## LLM提示词硬约束

- 只抽取用户明确表达；
- 不补全未说事实；
- 自我诊断放入 `user_interpretation`，不可转为 confirmed_fact；
- 含混时返回澄清槽位，不猜；
- 禁止生成方名、药名、剂量、证型结论。

## 验收命令

`npm run verify`

输出：120主诉、1680患者、96 Golden cases，并生成 `reports/verification-report.json`。
