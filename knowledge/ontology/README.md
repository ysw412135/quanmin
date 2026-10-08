# 术语本体层

把民间用语转成可追溯、可撤销的结构化症状事实。

## 核心实体

`PatientExpression` 原始用户表述；`SymptomConcept` 症状概念；`TemporalPattern` 时间与持续时长；`BodyLocation` 部位；`Qualifier` 程度和诱因；`NegatedFinding` 明确否认；`UnknownFinding` 未问到；`SafetyFlag` 危险征象；`ClassicalTerm` 典籍术语；`FrameworkHypothesis` 六经八纲分析假说。

## 最低原则

- “无汗”与“没问出汗”不是同一事实。
- 民间“有痰感”不能直接视为已观察到的痰。
- 同义词映射应存来源、适用地区/语言和冲突备注。
- 原话永远可追溯，不覆盖原始表述。
- “六经八纲”只是结构化学术框架，不把机器推断直接写成患者诊断。

## 示例（虚构，仅说明结构）

```json
{
  "expression": "晚上容易咳",
  "concept": "cough",
  "timing": "night",
  "duration": null,
  "observed": "user_report",
  "certainty": "reported",
  "red_flags_screened": false
}
```
