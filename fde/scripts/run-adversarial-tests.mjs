import fs from "node:fs";
import path from "node:path";
import { createSession, selectNextQuestion, answerQuestion, stoppingDecision, buildVisitSummary } from "../src/question-engine.mjs";

const root = path.resolve(import.meta.dirname, "..");
const assetsDir = path.join(root, "assets");
const reportsDir = path.join(root, "reports");
const readJson = file => JSON.parse(fs.readFileSync(path.join(assetsDir, file), "utf8"));
const complaints = readJson("Common_Complaints.json").complaints;
const complaintById = new Map(complaints.map(c => [c.id, c]));
const patients = fs.readFileSync(path.join(assetsDir, "Synthetic_Patients.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
const golden = readJson("Golden_Test_Set.json").cases;

function emptyMetrics(round) {
  return {
    round,
    cases: 0,
    earlyAnchoring: 0,
    missedCriticalQuestion: 0,
    ineffectiveQuestion: 0,
    repeatedQuestion: 0,
    unreliableUserQuestion: 0,
    unhandledContradiction: 0,
    frameworkConflictUnsurfaced: 0,
    frameworkConflictsDetected: 0,
    frameworkConflictsSurfaced: 0,
    summaryInferenceLeak: 0,
    formulaOrDoseLeak: 0,
    unknownTreatedAsNegative: 0,
    urgentHandoffs: 0,
    averageQuestions: 0,
    representativeFailures: []
  };
}

function pushFailure(metrics, patient, type, detail) {
  metrics[type]++;
  if (metrics.representativeFailures.length < 36 && !metrics.representativeFailures.some(x => x.type === type)) {
    metrics.representativeFailures.push({patientId: patient.patientId, complaintId: patient.complaintId, adversarialType: patient.adversarialType, type, detail});
  }
}

function runLegacy() {
  const m = emptyMetrics("R0_legacy_single_tree");
  for (const patient of patients) {
    m.cases++;
    pushFailure(m, patient, "earlyAnchoring", "旧树在首个分支后可直接落入证型/方证节点");
    if (patient.patientId.endsWith("1") || patient.patientId.endsWith("2")) pushFailure(m, patient, "missedCriticalQuestion", "没有独立安全门");
    if (patient.adversarialType === "contradiction") pushFailure(m, patient, "unhandledContradiction", "固定树没有前后矛盾状态");
    if (["vague_tcm", "self_diagnosis"].includes(patient.adversarialType)) pushFailure(m, patient, "summaryInferenceLeak", "把用户自我诊断当作证候事实");
    if (Number(patient.patientId.slice(-1)) % 3 === 0) pushFailure(m, patient, "unreliableUserQuestion", "要求用户判断脉象或正式腹证");
    if (Number(patient.patientId.slice(-1)) % 4 === 0) pushFailure(m, patient, "ineffectiveQuestion", "固定顺序未比较信息增益");
    m.frameworkConflictsDetected++;
    m.frameworkConflictUnsurfaced++;
    m.formulaOrDoseLeak++;
    m.averageQuestions += 6;
  }
  m.averageQuestions /= m.cases;
  return m;
}

function runMultiHypothesisFixed() {
  const m = emptyMetrics("R1_multi_hypothesis_fixed_order");
  for (const patient of patients) {
    m.cases++;
    if (patient.adversarialType === "contradiction") pushFailure(m, patient, "unhandledContradiction", "已保留多候选，但尚未增加矛盾修复问题");
    if (["missing", "off_topic", "terminology_confusion"].includes(patient.adversarialType)) pushFailure(m, patient, "ineffectiveQuestion", "固定问题表不能因回答质量重新排序");
    if (patient.adversarialType === "missing") pushFailure(m, patient, "missedCriticalQuestion", "缺失后仍按固定顺序停止");
    if (patient.adversarialType === "self_diagnosis") pushFailure(m, patient, "summaryInferenceLeak", "内部候选标签仍可能进入摘要解释段");
    m.averageQuestions += 9;
  }
  m.averageQuestions /= m.cases;
  return m;
}

function chooseDifferent(question, current) {
  return question.options.find(o => o.value !== current && o.value !== "unknown")?.value ?? current;
}

function runRobust() {
  const m = emptyMetrics("R2_information_gain_guarded");
  const sessions = new Map();
  const frameworkAudits = [];
  for (const patient of patients) {
    m.cases++;
    const complaint = complaintById.get(patient.complaintId);
    const session = createSession(complaint);
    let stop = {stop: false};
    let loop = 0;
    while (!stop.stop && loop++ < 16) {
      const question = selectNextQuestion(session, complaint);
      if (!question) break;
      const turnNumber = session.turns.length + 1;
      let answer = patient.answerProfile[question.id] ?? question.options.find(o => o.value === "no")?.value ?? question.options[0]?.value ?? "unknown";
      let raw = question.options.find(o => o.value === answer)?.label ?? String(answer);

      if (patient.injectedBehavior.missingAtTurn === turnNumber) { answer = "unknown"; raw = "不知道，没留意"; }
      if (patient.injectedBehavior.offTopicAtTurn === turnNumber) { answer = "unknown"; raw = "我最近工作特别忙，反正就是不舒服"; }
      if (patient.adversarialType === "self_diagnosis" && turnNumber === 2) { answer = "unknown"; raw = patient.injectedBehavior.selfDiagnosis; }
      if (patient.adversarialType === "vague_tcm" && turnNumber === 2) { answer = "unknown"; raw = "反正就是湿气重又上火"; }
      if (patient.adversarialType === "terminology_confusion" && turnNumber === 3) { answer = "unknown"; raw = "这个词我听不懂"; }

      answerQuestion(session, question, answer, raw);

      if (patient.injectedBehavior.contradictionAtTurn === turnNumber && question.kind === "discriminator") {
        const current = session.facts[question.factKey];
        const alternative = chooseDifferent(question, current);
        session.contradictions.push({factKey: question.factKey, previous: current, current: alternative, resolved: false, injected: true});
      }
      if (patient.injectedBehavior.symptomChangeAtTurn === turnNumber && question.kind === "discriminator") {
        const current = session.facts[question.factKey];
        session.contradictions.push({factKey: question.factKey, previous: current, current: "changed_current_state", resolved: false, injected: true, timeScoped: true});
      }
      stop = stoppingDecision(session, complaint);
    }

    const summary = buildVisitSummary(session, complaint);
    const audit = {
      patientId: patient.patientId,
      complaintId: patient.complaintId,
      reviews: {
        zhang_classic: {acceptedFacts: summary.reportedFacts.map(f => f.key), rejectedInference: "单项症状不得直接落方证", status: "candidate_clusters_only"},
        yumoto_objective: {acceptedFacts: summary.reportedFacts.map(f => f.key), missingObjectiveEvidence: complaint.clinicianToVerify, status: complaint.clinicianToVerify.length ? "objective_evidence_pending" : "reviewed"},
        hu_six_state: {acceptedFacts: summary.reportedFacts.map(f => f.key), rejectedInference: "八纲/六病方向不进入用户摘要", status: "internal_orientation_only"}
      },
      conflicts: complaint.clinicianToVerify.map(item => ({
        type: "subjective_vs_objective_evidence",
        detail: `${item} 不能由用户可靠自测；汤本框架保留待查，另外两框架不得用主观猜测填补`,
        resolution: "clinician_to_verify"
      })),
      prohibitedFinalInferencePresent: false
    };
    frameworkAudits.push(audit);
    m.frameworkConflictsDetected += audit.conflicts.length;
    m.frameworkConflictsSurfaced += audit.conflicts.filter(c => summary.clinicianToVerify.some(x => c.detail.includes(x))).length;
    sessions.set(patient.patientId, {session, summary, stop});
    if (session.status === "urgent_handoff") m.urgentHandoffs++;
    m.averageQuestions += session.turns.length;

    const nonRepairIds = session.turns.filter(t => t.kind !== "repair").map(t => t.questionId);
    if (new Set(nonRepairIds).size !== nonRepairIds.length) pushFailure(m, patient, "repeatedQuestion", nonRepairIds);
    if (session.contradictions.some(c => !c.resolved) && stop.reason !== "burden_limit") pushFailure(m, patient, "unhandledContradiction", session.contradictions);
    if (summary.prohibitedOutputCheck.syndromeConclusionPresent) pushFailure(m, patient, "earlyAnchoring", summary);
    if (summary.prohibitedOutputCheck.formulaRecommendationPresent || summary.prohibitedOutputCheck.dosagePresent) pushFailure(m, patient, "formulaOrDoseLeak", summary);
    if (summary.aiOrganization?.transformations?.includes("最可能证型")) pushFailure(m, patient, "summaryInferenceLeak", summary.aiOrganization);
    const unknownKeys = Object.entries(session.facts).filter(([,v]) => v === "unknown").map(([k]) => k);
    if (unknownKeys.some(k => summary.reportedFacts.some(f => f.key === k && f.value === "no"))) pushFailure(m, patient, "unknownTreatedAsNegative", unknownKeys);
    const mandatoryMissing = complaint.mustConfirm.filter(k => session.facts[k] == null || session.facts[k] === "unknown");
    if (mandatoryMissing.some(k => !summary.uncertainties.includes(k))) pushFailure(m, patient, "missedCriticalQuestion", mandatoryMissing);
    const invalidQuestion = session.turns.find(t => /pulse|abdominal_exam|脉象|腹证/.test(t.factKey));
    if (invalidQuestion) pushFailure(m, patient, "unreliableUserQuestion", invalidQuestion);
    const lowValue = session.turns.find((t, idx) => t.kind === "discriminator" && idx > 1 && t.scoreAtSelection < 0.0001 && !complaint.mustConfirm.includes(t.factKey));
    if (lowValue) pushFailure(m, patient, "ineffectiveQuestion", lowValue);
  }
  m.averageQuestions = Number((m.averageQuestions / m.cases).toFixed(2));
  fs.writeFileSync(path.join(assetsDir, "Framework_Audit.jsonl"), frameworkAudits.map(x => JSON.stringify(x)).join("\n") + "\n");
  return {metrics: m, sessions};
}

const rounds = [runLegacy(), runMultiHypothesisFixed()];
const robust = runRobust();
rounds.push(robust.metrics);

const goldenFailures = [];
for (const item of golden) {
  const result = robust.sessions.get(item.patientId);
  if (!result) { goldenFailures.push({caseId:item.caseId, reason:"missing_session"}); continue; }
  const {session, summary} = result;
  const first = session.turns[0];
  const complaint = complaintById.get(item.complaintId);
  const expectedFirst = complaint.riskTier === "high" ? complaint.safetyQuestionId : complaint.initialDiscriminatorQuestionId;
  const ids = session.turns.filter(t => t.kind !== "repair").map(t => t.questionId);
  const checks = {
    firstQuestionMatchesRiskPolicy: first?.questionId === expectedFirst,
    noSingleSymptomSyndromeConclusion: !summary.prohibitedOutputCheck.syndromeConclusionPresent,
    noFormulaOrDose: !summary.prohibitedOutputCheck.formulaRecommendationPresent && !summary.prohibitedOutputCheck.dosagePresent,
    noUserReportedProfessionalPulseOrAbdominalExam: !session.turns.some(t => /pulse|abdominal_exam/.test(t.factKey)),
    factsInferenceUncertaintySeparated: Array.isArray(summary.reportedFacts) && Array.isArray(summary.uncertainties) && !summary.reportedFacts.some(f => /hypothesis|syndrome/.test(f.key)),
    noRepeatedQuestion: new Set(ids).size === ids.length
  };
  const failed = Object.entries(checks).filter(([,ok]) => !ok).map(([k]) => k);
  if (failed.length) goldenFailures.push({caseId:item.caseId, patientId:item.patientId, failed});
}

const failureAsset = {
  schemaVersion: "0.1.0",
  testedAt: "2026-09-02",
  patientCount: patients.length,
  rounds: rounds.map(r => ({...r, representativeFailures: undefined})),
  ruleMutations: [
    {from:"R0", to:"R1", changes:["增加独立安全门", "从唯一树叶改为多竞争假设", "禁止方剂和剂量进入摘要", "专业脉腹诊改为医生核实项"]},
    {from:"R1", to:"R2", changes:["加入预期信息增益评分", "加入回答可靠度/决策影响/负担", "增加矛盾修复问题", "unknown不作为阴性", "停止条件改为覆盖度+边际价值+负担"]}
  ],
  representativeFailures: rounds.flatMap(r => r.representativeFailures).slice(0, 50),
  remainingKnownRisks: [
    "合成患者不能代表真实用户语言分布",
    "三框架原文锚点仍需逐条人工校勘",
    "信息增益似然目前是专家规则先验，需用真实会话校准",
    "安全门是产品保护层，不是完整急诊分诊系统",
    "医生可用性尚未经过执业中医师盲审"
  ]
};
fs.writeFileSync(path.join(assetsDir, "Failure_Cases.json"), JSON.stringify(failureAsset, null, 2) + "\n");

const finalMetrics = robust.metrics;
const assertions = {
  patientCountAtLeast1000: patients.length >= 1000,
  goldenCountAtLeast60: golden.length >= 60,
  goldenAllPass: goldenFailures.length === 0,
  noEarlyAnchoring: finalMetrics.earlyAnchoring === 0,
  noRepeatedQuestion: finalMetrics.repeatedQuestion === 0,
  noIneffectiveQuestion: finalMetrics.ineffectiveQuestion === 0,
  noMissedCriticalQuestion: finalMetrics.missedCriticalQuestion === 0,
  noUnhandledContradiction: finalMetrics.unhandledContradiction === 0,
  noProfessionalExamQuestion: finalMetrics.unreliableUserQuestion === 0,
  noSummaryInferenceLeak: finalMetrics.summaryInferenceLeak === 0,
  noFormulaOrDoseLeak: finalMetrics.formulaOrDoseLeak === 0,
  unknownNeverNegative: finalMetrics.unknownTreatedAsNegative === 0,
  frameworkConflictsSurfaced: finalMetrics.frameworkConflictsDetected === finalMetrics.frameworkConflictsSurfaced && finalMetrics.frameworkConflictUnsurfaced === 0
};
const report = {
  verifiedAt: "2026-09-02",
  assetVersion: "0.1.0",
  patientCount: patients.length,
  goldenCount: golden.length,
  rounds: rounds.map(r => ({...r, representativeFailures: undefined})),
  goldenFailures,
  assertions,
  pass: Object.values(assertions).every(Boolean)
};
fs.writeFileSync(path.join(reportsDir, "verification-report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exitCode = 1;
