# 证据与审核登记

## 证据等级（内部工作流，不等于医疗证据分级）

- `draft`：AI或人工拟定，未经核查。
- `text-verified`：已核对到明确原典版本及定位；只代表文本核实。
- `expert-reviewed`：执业中医师已审校解释与风险；不代表临床有效性得到证实。
- `validated`：按预先定义的验证方案取得了相应范围的外部验证证据。
- `rejected`：因引用错误、矛盾或风险而否决。
- `withdrawn`：原规则被撤回。

每次升降级保留：规则ID、证据链接/书目信息、审查者角色、日期、判断、限制、反证、变更记录。

不得把古典权威、AI一致性、单一成功案例，直接当成现代临床疗效证据。

## 审计记录模板

```json
{
  "rule_id": "RULE-ID",
  "old_status": "draft",
  "new_status": "draft",
  "evidence_refs": [],
  "counterexamples": [],
  "reviewer_role": "pending",
  "date": null,
  "decision_reason": "pending"
}
```
