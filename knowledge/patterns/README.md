# 方证规则层

一个 Pattern 是**可反驳的候选假说**，而不是处方指令。

最低字段：`pattern_id`、`source_refs`、`supporting_findings`、`missing_findings`、`contradicting_findings`、`safety_exclusions`、`review_status`、`review_log`。

不得仅凭单一症状自动锁定经方；候选匹配必须显示尚未确认的信息与反证。合方思路应单独登记其来源和验证等级，不应把现代临床合方解释写作古籍原文。

规则晋级：`draft → text-verified → expert-reviewed → validated`；发现新的反例时需要降级或撤回，记录原因。

### 空白模板

见 [pattern-template.json](pattern-template.json)。
