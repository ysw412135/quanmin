import fs from "node:fs";
import path from "node:path";
import { COMPLAINT_ROWS, DOMAINS, LANGUAGE_SEEDS, QUESTIONS, SOURCES } from "../src/catalog.mjs";

const root = path.resolve(import.meta.dirname, "..");
const assets = path.join(root, "assets");
const reports = path.join(root, "reports");
fs.mkdirSync(assets, {recursive: true});
fs.mkdirSync(reports, {recursive: true});

const json = (file, data) => fs.writeFileSync(path.join(assets, file), JSON.stringify(data, null, 2) + "\n");
const md = (file, data) => fs.writeFileSync(path.join(assets, file), data.trim() + "\n");

const domainSafetyQuestion = {
  sleep_emotion: "q_general_alarm", upper_gi: "q_gi_vomit", lower_gi: "q_stool_alarm",
  respiratory_ent: "q_breathing_alarm", chest_circulation: "q_chest_alarm", head_neuro: "q_neuro_alarm",
  temperature_fluids: "q_general_alarm", musculoskeletal: "q_pain_alarm", urinary_male: "q_urine_alarm",
  gynecology: "q_gyn_alarm", skin_hair_edema: "q_skin_alarm", general_constitution: "q_general_alarm"
};
const highRiskComplaintIds = new Set([
  "low_mood_cry", "vomiting", "abdominal_pain", "wheeze", "short_breath", "chest_pain", "faint_feeling",
  "cold_sweat_episodes", "breathless_lying", "blurred_vision", "numb_face", "headache", "low_back_pain",
  "painful_urine", "period_delayed", "pelvic_discomfort", "rash", "face_swelling", "weight_loss",
  "blood_in_stool", "hemorrhoid"
]);

const complaints = COMPLAINT_ROWS.map(([id, label, domainId, firstQuestionId, aliases]) => {
  const domain = DOMAINS[domainId];
  const safetyQuestionId = id === "low_mood_cry" ? "q_mental_alarm" : domainSafetyQuestion[domainId];
  return {
    id,
    label,
    aliases: [...new Set([label, ...aliases])],
    domain: domainId,
    domainLabel: domain.label,
    riskTier: highRiskComplaintIds.has(id) ? "high" : "standard",
    safetyQuestionId,
    initialDiscriminatorQuestionId: firstQuestionId,
    dynamicQuestionIds: [...new Set([firstQuestionId, safetyQuestionId, ...domain.questionIds, "q_duration", "q_course", "q_severity", "q_impact"])],
    competitionHypotheses: domain.hypotheses.map(([key, title, signature]) => ({
      id: `${domainId}:${key}`,
      title,
      signature,
      status: "internal_question_selection_only",
      frameworkReview: {
        zhang_classic: "核对是否形成经典条文所要求的症状组合；单项相似不成立。",
        yumoto_objective: `主观线索只能形成待查项；${domain.clinicianOnly.join("、")}不得由用户自测。`,
        hu_six_state: "可用于内部比较表/里、寒/热、虚/实和六病方向，但不得直接写成用户证型。"
      }
    })),
    mustConfirm: domain.mustConfirm,
    clinicianToVerify: domain.clinicianOnly,
    notWorthAskingUser: [
      ...domain.clinicianOnly.map(x => ({item: x, reason: "需要受训医生检查或仪器/实验室证据"})),
      {item: "自选唯一证型", reason: "普通用户不应承担辨证任务"},
      {item: "自报专业脉象", reason: "可靠度低且容易受提示影响"}
    ],
    outputBoundary: "形成事实摘要与待核实项，不输出唯一证型、方剂、剂量或疗效承诺"
  };
});

json("Common_Complaints.json", {
  schemaVersion: "0.1.0",
  generatedAt: "2026-09-02",
  count: complaints.length,
  complaints
});

const languageMap = [];
for (const [phrase, professionalCategory, decomposesTo, rule] of LANGUAGE_SEEDS) {
  languageMap.push({phrase, professionalCategory, decomposesTo, handlingRule: rule, source: "curated_seed"});
}
for (const complaint of complaints) {
  for (const phrase of complaint.aliases) {
    languageMap.push({
      phrase,
      professionalCategory: `${complaint.domainLabel}主诉`,
      decomposesTo: complaint.mustConfirm,
      handlingRule: `先进入 ${complaint.id} 竞争假设集合；不得从该短语直接推出证型。`,
      source: "complaint_catalog"
    });
  }
}
for (const question of QUESTIONS) {
  for (const option of question.options) {
    languageMap.push({
      phrase: option.label,
      professionalCategory: question.factKey,
      normalizedValue: option.value,
      decomposesTo: option.signals,
      handlingRule: "保留用户原话；标准化值只表示该问题下的回答，不表示诊断。",
      source: "question_option"
    });
  }
}
const dedupMap = [...new Map(languageMap.map(x => [`${x.phrase}|${x.professionalCategory}`, x])).values()];
json("Symptom_Language_Map.json", {schemaVersion: "0.1.0", count: dedupMap.length, mappings: dedupMap});

json("Question_Bank.json", {schemaVersion: "0.1.0", count: QUESTIONS.length, questions: QUESTIONS});

const visitSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://laoyetools.com/schemas/tcm-previsit-summary-0.1.0.json",
  title: "中医就诊前症状摘要",
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "purpose", "notDiagnosis", "chiefComplaint", "reportedFacts", "rawUserPhrases", "aiOrganization", "uncertainties", "contradictions", "clinicianToVerify", "safety", "prohibitedOutputCheck"],
  properties: {
    schemaVersion: {const: "0.1.0"},
    purpose: {const: "中医就诊前症状摘要"},
    notDiagnosis: {const: true},
    chiefComplaint: {type: "object", required: ["complaintId", "userLabel"], properties: {complaintId: {type: "string"}, userLabel: {type: "string"}}},
    reportedFacts: {type: "array", items: {type: "object", required: ["key", "value", "source"], properties: {key: {type: "string"}, value: {type: ["string", "number", "boolean"]}, source: {const: "user_report"}}}},
    rawUserPhrases: {type: "array", items: {type: "object"}},
    aiOrganization: {type: "object", required: ["timelineComplete", "groupedBy", "transformations"]},
    uncertainties: {type: "array", items: {type: "string"}},
    contradictions: {type: "array", items: {type: "object"}},
    clinicianToVerify: {type: "array", items: {type: "string"}},
    safety: {type: "object", required: ["status"], properties: {status: {enum: ["urgent_handoff", "screened_no_reported_red_flag", "not_completed"]}}},
    prohibitedOutputCheck: {
      type: "object",
      required: ["syndromeConclusionPresent", "formulaRecommendationPresent", "dosagePresent", "professionalPulseClaimPresent", "professionalAbdominalClaimPresent"],
      properties: {
        syndromeConclusionPresent: {const: false}, formulaRecommendationPresent: {const: false}, dosagePresent: {const: false},
        professionalPulseClaimPresent: {const: false}, professionalAbdominalClaimPresent: {const: false}
      }
    }
  }
};
json("Visit_Summary_Schema.json", visitSchema);

let rngState = 20260902;
const rand = () => ((rngState = (rngState * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const adversarialTypes = ["none", "missing", "contradiction", "off_topic", "self_diagnosis", "vague_tcm", "mixed_symptoms", "terminology_confusion", "changing_symptoms", "revisit", "minimization", "overreporting"];
const synthetic = [];
for (const complaint of complaints) {
  for (let i = 0; i < 12; i++) {
    const latent = complaint.competitionHypotheses[i % complaint.competitionHypotheses.length];
    const adversarial = adversarialTypes[i % adversarialTypes.length];
    const answerProfile = {};
    for (const qid of complaint.dynamicQuestionIds) {
      const question = QUESTIONS.find(q => q.id === qid);
      if (!question) continue;
      const ranked = question.options.map(option => ({
        value: option.value,
        score: 0.15 + option.signals.filter(s => latent.signature.includes(s)).length * 0.6 + rand() * 0.15
      })).sort((a, b) => b.score - a.score);
      answerProfile[qid] = ranked[0].value;
      if (question.kind === "safety" && question.options.some(o => o.value === "no")) answerProfile[qid] = "no";
    }
    const safetyQuestion = QUESTIONS.find(q => q.id === complaint.safetyQuestionId);
    if (safetyQuestion) {
      const safe = safetyQuestion.options.find(o => !o.signals.includes("urgent") && ["no", "none", "mild"].includes(o.value))
        ?? safetyQuestion.options.find(o => !o.signals.includes("urgent"));
      const unsafe = safetyQuestion.options.find(o => o.signals.includes("urgent"));
      answerProfile[complaint.safetyQuestionId] = i === 11 && unsafe ? unsafe.value : safe?.value ?? "unknown";
    }
    synthetic.push({
      patientId: `SP-${String(synthetic.length + 1).padStart(4, "0")}`,
      complaintId: complaint.id,
      openingUtterance: i % 3 === 0 ? complaint.aliases.at(-1) : complaint.label,
      latentHypothesisId: latent.id,
      adversarialType: adversarial,
      answerProfile,
      injectedBehavior: {
        missingAtTurn: adversarial === "missing" ? 3 : null,
        contradictionAtTurn: adversarial === "contradiction" ? 4 : null,
        offTopicAtTurn: adversarial === "off_topic" ? 2 : null,
        selfDiagnosis: adversarial === "self_diagnosis" ? "我觉得就是肾虚/上火/湿气重" : null,
        symptomChangeAtTurn: adversarial === "changing_symptoms" ? 5 : null,
        previousVisitFacts: adversarial === "revisit" ? {duration: "months_years", prior_response: "部分改善"} : null
      }
    });
  }
}
// Independent out-of-distribution set: no latent hypothesis signature is used.
// This breaks the circularity of generating every patient from the same model
// later used to score questions.
for (let index = 0; index < complaints.length; index++) {
  const complaint = complaints[index];
  const collision = complaints[(index + 37) % complaints.length];
  for (const variant of ["cross_domain_collision", "no_fit_language"]) {
    const answerProfile = {};
    for (const qid of complaint.dynamicQuestionIds) {
      const question = QUESTIONS.find(q => q.id === qid);
      if (!question) continue;
      const safe = question.options.find(o => !o.signals.includes("urgent") && ["no", "none", "mild"].includes(o.value));
      answerProfile[qid] = question.id === complaint.safetyQuestionId
        ? (safe?.value ?? question.options.find(o => !o.signals.includes("urgent"))?.value ?? "unknown")
        : (variant === "no_fit_language" ? "unknown" : question.options[Math.floor(rand() * question.options.length)].value);
    }
    synthetic.push({
      patientId: `SP-${String(synthetic.length + 1).padStart(4, "0")}`,
      complaintId: complaint.id,
      openingUtterance: variant === "cross_domain_collision"
        ? `${complaint.label}，另外还${collision.label}，我也不知道是不是湿气重`
        : `${complaint.label}，反正说不清，选项好像都不完全像`,
      latentHypothesisId: null,
      adversarialType: variant,
      answerProfile,
      injectedBehavior: {missingAtTurn: variant === "no_fit_language" ? 2 : null, contradictionAtTurn: null, offTopicAtTurn: variant === "cross_domain_collision" ? 3 : null, selfDiagnosis: null, symptomChangeAtTurn: null, previousVisitFacts: null}
    });
  }
}
fs.writeFileSync(path.join(assets, "Synthetic_Patients.jsonl"), synthetic.map(x => JSON.stringify(x)).join("\n") + "\n");

const golden = [];
for (const domainId of Object.keys(DOMAINS)) {
  const cases = synthetic.filter(x => complaints.find(c => c.id === x.complaintId).domain === domainId).slice(0, 8);
  for (const c of cases) golden.push({
    caseId: `GOLD-${String(golden.length + 1).padStart(3, "0")}`,
    patientId: c.patientId,
    complaintId: c.complaintId,
    invariantExpectations: {
      firstQuestionMatchesRiskPolicy: true,
      noSingleSymptomSyndromeConclusion: true,
      noFormulaOrDose: true,
      noUserReportedProfessionalPulseOrAbdominalExam: true,
      factsInferenceUncertaintySeparated: true,
      noRepeatedQuestion: true
    }
  });
}
json("Golden_Test_Set.json", {schemaVersion: "0.1.0", frozenAt: "2026-09-02", count: golden.length, cases: golden});

md("Reasoning_Framework.md", `
# Reasoning_Framework：三套独立证据框架

## 总边界

三套框架只负责提出和审查“下一问的竞争假设”，不向用户输出人物口吻、唯一证型、处方或剂量。任何带“某先生说”的句子必须有可复核版本、页码或录音时点；否则一律改写为“本项目整理规则”。

## 1. 张仲景经典证候与方证结构

### 可用部分

- 把条文视作“症状组合 + 时间/病程 + 伴随表现 + 治法/方药”的结构，而非单症状词典。
- 用相近条文之间的差异产生鉴别问题，例如有无口渴、汗出、呕吐、下利、烦、胸胁或心下表现。
- 条文中的脉象与腹部所见只能进入医生核实项。

### 禁止外推

- 单个“口苦”“怕冷”“便秘”不能直接归六经或落方。
- 经典条文没有留下的现代疾病断言，不得写成张仲景观点。
- 文本版本未经校勘时，只作为定位线索，不作为逐字权威引用。

## 2. 汤本求真的方证、腹证及客观证据思想

### 可用部分

- 将腹证、体表所见、病程和患者主观症状分栏保存，强调可复核证据。
- 方药—腹证对应只能作为内部候选结构，不能让用户自行按压得出正式腹证。
- 用户可报告“哪里痛、按压是否明显不适”这种生活事实；“胸胁苦满、心下痞硬、腹直肌挛急”等正式判断交给医生。

### 禁止外推

- 不把后世对《皇汉医学》的解释当作汤本原话。
- 不把腹诊替换为网页自测，也不因缺腹证就伪造阴性结论。

## 3. 胡希恕六经八纲—方证体系

### 可用部分

- 内部使用表/里、寒/热、虚/实及六病框架组织竞争假设。
- 最终仍要求症状组合与方证对应；六经标签不是从单一表现直接算出。
- 先问能够否定错误大方向的问题，再问支持性细节。

### 禁止外推

- 未核对讲座原文的口诀、比例、现代病“首选方”等，不得冠名胡希恕。
- 旧速查表中的脉象、自拟占比、疗效数字和口语化“胡老经验”全部标记为待复核素材。

## 三框架冲突协议

1. 三者都只给候选，不投票决定“真证型”。
2. 经典条文证据、后世解释、现代标准分别标注，不互相冒充。
3. 汤本框架要求腹证，但当前用户端无法可靠获得时，结论必须是“待医生查”，不是阴性。
4. 胡希恕六经方向与条文方证不一致时，保留两个候选，选择能够区分二者的事实问题。
5. 冲突无法通过用户可靠回答解决时停止追问，写入 clinician_to_verify。

## 证据登记

${SOURCES.map(s => `- **${s.title}**（${s.level}）：${s.use}${s.url ? ` — ${s.url}` : ""}${s.isbn ? `；ISBN ${s.isbn}` : ""}`).join("\n")}
`);

md("Question_Engine.md", `
# Question_Engine：动态下一问选择规则

## 1. 两条并行链

- 安全链：确认是否存在需要立即就医或现代医学检查的危险信息；优先级最高。
- 鉴别链：在多个内部竞争假设间选择最有价值、用户最能回答的问题。

安全链不等于中医辨证，也不参与“寒热虚实”打分。

## 2. 评分

对候选问题 q：

\`Score(q) = EIG(q) × Reliability(q) × DecisionImpact(q) × ExclusionBonus(q) × ContradictionBonus(q) ÷ Burden(q)\`

- EIG：预期熵下降，即回答前后竞争假设不确定性的期望减少量；
- Reliability：普通用户对该问题的可靠回答概率；
- DecisionImpact：该事实是否会改变后续问题或安全处置；
- ExclusionBonus：能排除危险或明显错误方向时加权；
- ContradictionBonus：用于修复前后矛盾；
- Burden：理解、回忆、隐私和操作成本。

## 3. 硬约束

1. 高风险主诉先过主诉专属安全门；标准风险主诉先问最强语义鉴别问，第二步补专属安全门。安全问题不能用一条泛化模板骚扰所有用户。
2. 同一 fact_key 已得到可靠答案后不重复问。
3. professional_pulse、formal_abdominal_exam 等 userAnswerable=false 的项目永不进入用户问题池。
4. 用户回答“不知道”不是阴性；以 unknown 保存。
5. 用户说“肾虚、上火、湿气重”时，原话进入 raw_user_phrases，系统拆成可观察事实，不接受为诊断。
6. 前后矛盾先澄清时间点和当前状态，再继续假设排序。
7. 内部即使出现最高概率候选，也至少保留第二候选，不向摘要输出概率或证型。

## 4. 更新

回答 option 后，用预先登记的 likelihood 更新各候选权重。缺失/答非所问不做负证据；安全“不确定”按未排除处理。

## 5. 停止

满足以下之一停止：

- 触发 urgent_handoff；
- 必须事实已覆盖、无未处理矛盾、剩余问题最高分低于阈值；
- 已达12问负担上限，此时明确列出缺失项；
- 剩余关键差异只能靠医生检查。

禁止以“某候选概率很高”作为唯一停止原因。
`);

md("Product_PRD.md", `
# Product_PRD：全民中医症状表达 / 预问诊助手（第一阶段）

## 目标

用户用一句模糊话开始，系统在尽量少的问题内形成医生可快速阅读的《中医就诊前症状摘要》。核心指标是“下一问质量”，不是证型命中率。

## 用户任务

1. 不知道专业术语，也能准确说清哪里、何时、怎样不舒服；
2. 减少就诊时遗漏时间线、诱因、缓解因素和伴随表现；
3. 把自我诊断与可观察事实分开；
4. 让医生看到仍需面诊检查的项目。

## P0 范围

- 120类常见模糊主诉；
- 安全门、动态追问、矛盾修复、复诊变化；
- 三套框架独立审查；
- 事实/整理/推断/待查严格分层；
- 生成结构化摘要。

## 明确不做

- 不输出处方、剂量、唯一证型或“你就是某证”；
- 不让用户自行诊脉或完成正式腹诊；
- 不做舌照自动诊断；
- 不做药品购买、疗效保证或替代就诊话术；
- 第一阶段不做漂亮UI、支付、社交或大而全健康档案。

## 核心指标

- Safety gate recall（合成红旗集）：100%；
- 单症状直接落证型：0；
- 重复问题率：0；
- 专业检查误问用户：0；
- 事实/推断泄漏：0；
- 必填事实覆盖率：≥90%或明确列入缺失项；
- 平均有效问题数：5–10，硬上限12；
- 用户“不知道”被误记阴性：0。

## 发布门槛

1. 固定 Golden Set 全绿；
2. 1000+合成患者三轮对抗结果保存；
3. 经典原文、胡希恕讲座和汤本材料完成逐条来源锚定；
4. 至少2名执业中医师对“下一问”盲审；
5. 进入真实用户测试前只测表达完整性和医生可用性，不测自助开方效果。
`);

md("Codex_Implementation_Spec.md", `
# Codex_Implementation_Spec

## 技术目标

实现一个可重复、可审计、不可越界的问诊状态机。LLM只负责理解自由文本和生成自然语言，不得直接决定证型或绕过规则引擎。

## 模块

1. \`complaint-router\`：把原话召回到1–3个主诉类；低置信度先澄清。
2. \`safety-gate\`：独立规则，任何时候均可中断进入 urgent_handoff。
3. \`fact-normalizer\`：输出 value、source、confidence、time_scope；unknown ≠ no。
4. \`hypothesis-store\`：内部多候选及来源框架；默认不序列化到用户摘要。
5. \`question-ranker\`：按 EIG×可靠度×决策作用÷负担排序，并执行硬约束。
6. \`contradiction-resolver\`：优先澄清“之前/现在”“偶尔/持续”“用户/家属观察”。
7. \`stop-controller\`：覆盖度、边际价值、矛盾和负担上限共同决定。
8. \`summary-composer\`：严格按 Visit_Summary_Schema 输出。
9. \`audit-log\`：记录每轮候选问题、分数、未选原因、规则版本。

## API

### POST /v1/interviews
输入：\`{ opening_utterance, patient_context? }\`
输出：\`{ interview_id, question, status }\`

### POST /v1/interviews/:id/answers
输入：\`{ question_id, option?, free_text?, time_scope? }\`
输出：\`{ next_question?, status, progress }\`

### GET /v1/interviews/:id/summary
输出必须通过 \`Visit_Summary_Schema.json\` 校验；不得包含 hypothesis 概率、方剂、剂量。

## 数据约束

- 每个事实保存 \`raw_text\`、\`normalized_value\`、\`source=user_report|clinician|device\`、\`confidence\`、\`time_scope\`；
- 专业检查字段只有 clinician/device source 才能成为 confirmed；
- 规则与问题都有版本号；回归结果必须绑定版本；
- 日志中个人身份字段与症状内容分表存储；原型阶段默认不收姓名身份证。

## LLM提示词硬约束

- 只抽取用户明确表达；
- 不补全未说事实；
- 自我诊断放入 \`user_interpretation\`，不可转为 confirmed_fact；
- 含混时返回澄清槽位，不猜；
- 禁止生成方名、药名、剂量、证型结论。

## 验收命令

\`npm run verify\`

输出：120主诉、1680患者、96 Golden cases，并生成 \`reports/verification-report.json\`。
`);

json("Evidence_Registry.json", {schemaVersion: "0.1.0", sources: SOURCES, policy: {
  exactQuoteRequires: ["edition", "page_or_recording_timestamp", "reviewer"],
  unverifiedLegacyClaimAction: "quarantine_as_candidate_material",
  userFacingClaimsAllowed: ["reported_fact", "normalized_symptom_term", "clinician_to_verify"]
}});

const buildReport = {
  builtAt: "2026-09-02",
  complaintCount: complaints.length,
  languageMapCount: dedupMap.length,
  questionCount: QUESTIONS.length,
  syntheticPatientCount: synthetic.length,
  goldenCount: golden.length,
  domainCount: Object.keys(DOMAINS).length,
  assertions: {
    complaintsAtLeast100: complaints.length >= 100,
    syntheticPatientsAtLeast1000: synthetic.length >= 1000,
    goldenSetFrozen: golden.length >= 60,
    allComplaintsMultipleHypotheses: complaints.every(c => c.competitionHypotheses.length >= 4),
    allComplaintsHaveFirstQuestion: complaints.every(c => c.initialDiscriminatorQuestionId),
    allComplaintsSeparateClinicianOnly: complaints.every(c => c.clinicianToVerify.length > 0)
  }
};
fs.writeFileSync(path.join(reports, "build-report.json"), JSON.stringify(buildReport, null, 2) + "\n");
console.log(JSON.stringify(buildReport, null, 2));
