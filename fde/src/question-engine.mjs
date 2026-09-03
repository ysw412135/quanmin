import { DOMAINS, QUESTIONS } from "./catalog.mjs";

const QUESTION_BY_ID = new Map(QUESTIONS.map(x => [x.id, x]));

export const entropy = probs => -probs.reduce((s, p) => p > 0 ? s + p * Math.log2(p) : s, 0);

const normalize = weights => {
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  return weights.map(x => x / total);
};

const baseKey = id => id.includes(":") ? id.split(":").at(-1) : id;

export function createSession(complaint) {
  const domain = DOMAINS[complaint.domain];
  const hypotheses = complaint.competitionHypotheses.map(h => ({
    id: h.id,
    key: baseKey(h.id),
    title: h.title,
    signature: h.signature,
    probability: 1 / complaint.competitionHypotheses.length
  }));
  return {
    complaintId: complaint.id,
    domain: complaint.domain,
    riskTier: complaint.riskTier,
    safetyQuestionId: complaint.safetyQuestionId,
    startedAt: "synthetic-or-runtime",
    turns: [],
    facts: {},
    rawReports: [],
    contradictions: [],
    hypotheses,
    safetyResolved: false,
    status: "interviewing"
  };
}

function likelihood(option, hypothesis) {
  if (!option.signals?.length) return 0.34;
  const overlap = option.signals.filter(s => hypothesis.signature.includes(s)).length;
  if (overlap) return Math.min(0.9, 0.58 + overlap * 0.14);
  if (option.signals.includes("urgent") && /urgent|structural|medical|risk/.test(hypothesis.key)) return 0.88;
  return 0.09;
}

export function expectedInformationGain(question, hypotheses) {
  const priors = normalize(hypotheses.map(h => h.probability));
  const priorEntropy = entropy(priors);
  const optionLikelihoods = question.options.map(option => hypotheses.map(h => likelihood(option, h)));
  const perHypothesisTotals = hypotheses.map((_, hIndex) => optionLikelihoods.reduce((sum, row) => sum + row[hIndex], 0) || 1);
  let expectedPosteriorEntropy = 0;
  for (let optionIndex = 0; optionIndex < question.options.length; optionIndex++) {
    const weighted = hypotheses.map((_, i) => priors[i] * (optionLikelihoods[optionIndex][i] / perHypothesisTotals[i]));
    const outcomeProbability = weighted.reduce((a, b) => a + b, 0);
    if (!outcomeProbability) continue;
    expectedPosteriorEntropy += outcomeProbability * entropy(normalize(weighted));
  }
  return Math.max(0, priorEntropy - expectedPosteriorEntropy);
}

export function scoreQuestion(question, session) {
  const ig = expectedInformationGain(question, session.hypotheses);
  const mandatory = DOMAINS[session.domain]?.mustConfirm?.includes(question.factKey);
  const summaryCoverageUtility = mandatory ? 0.04 : 0.008;
  const exclusionBonus = question.options.some(o => o.signals?.some(s => ["urgent", "bleeding", "loss_function", "progressive"].includes(s))) ? 1.18 : 1;
  const missingFactBonus = session.facts[question.factKey] == null ? 1 : 0.05;
  const contradictionBonus = session.contradictions.some(c => c.factKey === question.factKey && !c.resolved) ? 1.35 : 1;
  return ((ig + summaryCoverageUtility) * question.reliability * question.decisionImpact * exclusionBonus * contradictionBonus * missingFactBonus) / Math.max(0.5, question.burden);
}

export function getQuestion(id) {
  const question = QUESTION_BY_ID.get(id);
  if (!question) throw new Error(`Unknown question: ${id}`);
  return question;
}

export function selectNextQuestion(session, complaint) {
  if (session.status !== "interviewing") return null;
  const asked = new Set(session.turns.map(t => t.questionId));

  // High-risk openings get a complaint-specific safety question first. Standard
  // openings get the best semantic discriminator first, then the safety check.
  if (!session.safetyResolved && session.riskTier === "high" && !asked.has(session.safetyQuestionId)) {
    return getQuestion(session.safetyQuestionId);
  }

  const unresolved = session.contradictions.find(c => !c.resolved);
  if (unresolved) {
    return {
      id: `repair:${unresolved.factKey}:${session.contradictions.indexOf(unresolved)}`,
      factKey: unresolved.factKey,
      prompt: `你前后说法有变化。请确认：是“${unresolved.previous}”、现在是“${unresolved.current}”，还是刚才有一项说错了？`,
      options: [
        {value: "previous", label: "以前和现在都是前一种", signals: []},
        {value: "current", label: "以前和现在都是后一种", signals: []},
        {value: "changed", label: "以前是前一种，现在变成后一种", signals: []},
        {value: "unknown", label: "仍然说不清", signals: []}
      ],
      reliability: 0.9,
      burden: 0.8,
      decisionImpact: 0.95,
      userAnswerable: true,
      kind: "repair",
      repairFor: unresolved.factKey
    };
  }

  if (session.turns.filter(t => t.kind === "discriminator").length === 0 && !asked.has(complaint.initialDiscriminatorQuestionId)) {
    return getQuestion(complaint.initialDiscriminatorQuestionId);
  }

  if (!session.safetyResolved && !asked.has(session.safetyQuestionId)) return getQuestion(session.safetyQuestionId);

  const candidates = complaint.dynamicQuestionIds
    .map(getQuestion)
    .filter(q => q.userAnswerable && !asked.has(q.id) && session.facts[q.factKey] == null);
  const ranked = candidates
    .map(question => ({question, score: scoreQuestion(question, session)}))
    .sort((a, b) => b.score - a.score || a.question.id.localeCompare(b.question.id));
  return ranked[0]?.question ?? null;
}

export function answerQuestion(session, question, answer, rawText = "") {
  if (question.kind === "repair") {
    const item = session.contradictions.find(c => c.factKey === question.repairFor && !c.resolved);
    if (item) {
      const resolution = answer === "previous" ? item.previous : item.current;
      item.resolved = answer !== "unknown";
      item.resolution = answer;
      item.note = rawText || question.options.find(o => o.value === answer)?.label || "";
      session.facts[item.factKey] = answer === "unknown" ? "unknown" : resolution;
    }
    session.turns.push({questionId: question.id, factKey: question.factKey, answer, kind: "repair", scoreAtSelection: 1});
    session.rawReports.push({questionId: question.id, text: rawText || String(answer)});
    return session;
  }
  const selectionScore = scoreQuestion(question, session);
  const option = question.options.find(o => o.value === answer) ?? null;
  const previous = session.facts[question.factKey];
  const normalizedValue = option?.value ?? "unknown";
  if (previous != null && previous !== normalizedValue && previous !== "unknown" && normalizedValue !== "unknown") {
    session.contradictions.push({factKey: question.factKey, previous, current: normalizedValue, resolved: false});
  }
  session.facts[question.factKey] = normalizedValue;
  session.rawReports.push({questionId: question.id, text: rawText || option?.label || String(answer)});
  session.turns.push({
    questionId: question.id,
    factKey: question.factKey,
    answer: normalizedValue,
    kind: question.kind,
    scoreAtSelection: selectionScore
  });

  if (question.id === session.safetyQuestionId || question.kind === "safety") {
    if (option?.signals?.includes("urgent")) session.status = "urgent_handoff";
    else if (option) session.safetyResolved = true;
  }

  if (option) {
    const weights = session.hypotheses.map(h => {
      const denominator = question.options.reduce((sum, candidate) => sum + likelihood(candidate, h), 0) || 1;
      return Math.max(0.0001, h.probability * (likelihood(option, h) / denominator));
    });
    const posterior = normalize(weights);
    session.hypotheses.forEach((h, i) => { h.probability = posterior[i]; });
  }
  return session;
}

export function resolveContradiction(session, factKey, resolution, note = "") {
  const item = session.contradictions.find(c => c.factKey === factKey && !c.resolved);
  if (!item) return false;
  item.resolved = true;
  item.resolution = resolution;
  item.note = note;
  session.facts[factKey] = resolution;
  return true;
}

export function stoppingDecision(session, complaint) {
  if (session.status === "urgent_handoff") return {stop: true, reason: "urgent_handoff"};
  if (!session.safetyResolved) return {stop: false, reason: "safety_unresolved"};
  const domain = DOMAINS[complaint.domain];
  const missingMandatory = domain.mustConfirm.filter(k => session.facts[k] == null || session.facts[k] === "unknown");
  const unresolvedContradictions = session.contradictions.filter(c => !c.resolved);
  if (unresolvedContradictions.length) return {stop: false, reason: "contradiction_unresolved", unresolvedContradictions};
  if (session.turns.length >= 12) return {stop: true, reason: "burden_limit", missingMandatory};
  const confirmedMandatory = domain.mustConfirm.length - missingMandatory.length;
  if (session.turns.length >= 10 && confirmedMandatory >= 2) return {stop: true, reason: "coverage_burden_tradeoff", missingMandatory};
  if (missingMandatory.length && session.turns.length < 9) return {stop: false, reason: "mandatory_missing", missingMandatory};

  const remaining = complaint.dynamicQuestionIds
    .map(getQuestion)
    .filter(q => !session.turns.some(t => t.questionId === q.id) && session.facts[q.factKey] == null)
    .map(q => scoreQuestion(q, session));
  const maxScore = remaining.length ? Math.max(...remaining) : 0;
  if (session.turns.length >= 5 && maxScore < 0.025) return {stop: true, reason: "low_marginal_value", missingMandatory};
  if (!remaining.length) return {stop: true, reason: "question_space_exhausted", missingMandatory};
  return {stop: false, reason: "continue", maxScore, missingMandatory};
}

export function buildVisitSummary(session, complaint) {
  const domain = DOMAINS[complaint.domain];
  const confirmedFacts = Object.entries(session.facts)
    .filter(([, value]) => value != null && value !== "unknown")
    .map(([key, value]) => ({key, value, source: "user_report"}));
  const unknowns = Object.entries(session.facts)
    .filter(([, value]) => value === "unknown")
    .map(([key]) => key);
  const missing = domain.mustConfirm.filter(k => session.facts[k] == null || session.facts[k] === "unknown");
  return {
    schemaVersion: "0.1.0",
    purpose: "中医就诊前症状摘要",
    notDiagnosis: true,
    chiefComplaint: {complaintId: complaint.id, userLabel: complaint.label},
    reportedFacts: confirmedFacts,
    rawUserPhrases: session.rawReports,
    aiOrganization: {
      timelineComplete: Boolean(session.facts.duration || session.facts.course),
      groupedBy: ["主诉", "时间", "诱因/缓解", "伴随表现", "功能影响"],
      transformations: "仅做语义归一化，不把内部竞争假设写入摘要"
    },
    uncertainties: [...new Set([...unknowns, ...missing])],
    contradictions: session.contradictions,
    clinicianToVerify: domain.clinicianOnly,
    safety: {status: session.status === "urgent_handoff" ? "urgent_handoff" : "screened_no_reported_red_flag"},
    prohibitedOutputCheck: {
      syndromeConclusionPresent: false,
      formulaRecommendationPresent: false,
      dosagePresent: false,
      professionalPulseClaimPresent: false,
      professionalAbdominalClaimPresent: false
    }
  };
}
