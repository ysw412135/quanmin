import assert from "node:assert/strict";
import { createApp } from "../server/app.mjs";

function listen(app) {
  return new Promise(resolve => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, base: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function post(base, path, body) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: JSON.stringify(body)
  });
  const data = await response.json();
  assert.ok(response.ok, `${path} failed: ${JSON.stringify(data)}`);
  return data;
}

function safeOption(question) {
  const preferred = ["no", "none", "stable", "normal", "formed", "hours_days", "mild"];
  for (const value of preferred) {
    if (question.options.some(option => option.value === value)) return value;
  }
  return question.options.find(option => option.value !== "unsure" && option.value !== "unknown")?.value
    ?? question.options[0].value;
}

function assertNoForbidden(summary) {
  assert.equal(summary.notDiagnosis, true);
  assert.equal(summary.prohibitedOutputCheck.syndromeConclusionPresent, false);
  assert.equal(summary.prohibitedOutputCheck.formulaRecommendationPresent, false);
  assert.equal(summary.prohibitedOutputCheck.dosagePresent, false);
  const text = JSON.stringify(summary);
  assert.doesNotMatch(text, /方剂|剂量|最可能证型|处方/);
}

const { server, base } = await listen(createApp());

try {
  const health = await fetch(`${base}/health`).then(res => res.json());
  assert.equal(health.ok, true);
  assert.ok(health.complaintCount >= 120, `主诉数应至少120，实际 ${health.complaintCount}`);
} catch (error) {
  server.close();
  throw error;
}

let normal = await post(base, "/v1/interviews", { opening_utterance: "胃不舒服" });
const normalId = normal.interview_id;
let normalSummary = null;
for (let i = 0; i < 14; i++) {
  const question = normal.question || normal.next_question;
  assert.ok(question, "normal flow lost question before summary");
  normal = await post(base, `/v1/interviews/${normalId}/answers`, {
    option: safeOption(question),
    free_text: ""
  });
  if (normal.summary) {
    normalSummary = normal.summary;
    break;
  }
}
assert.ok(normalSummary, "normal flow did not produce summary");
assertNoForbidden(normalSummary);
assert.ok(Array.isArray(normalSummary.uncertainties));

let urgent = await post(base, "/v1/interviews", { opening_utterance: "胸痛" });
assert.equal(urgent.question.id, "q_chest_alarm");
urgent = await post(base, `/v1/interviews/${urgent.interview_id}/answers`, {
  option: "yes",
  free_text: "突然胸痛，出冷汗"
});
assert.equal(urgent.status, "urgent_handoff");
assert.equal(urgent.summary.safety.status, "urgent_handoff");
assertNoForbidden(urgent.summary);

const unclear = await post(base, "/v1/interviews", { opening_utterance: "不太对劲" });
assert.equal(unclear.status, "needs_clarification");
assert.ok(unclear.question.options.length >= 6);

console.log(JSON.stringify({
  pass: true,
  checked: ["health", "normal_interview_summary", "urgent_handoff", "clarification"]
}, null, 2));
server.close();
