const state = {
  interviewId: null,
  currentQuestion: null,
  summary: null
};

const $ = selector => document.querySelector(selector);
const statusEl = $("#status");
const openingInput = $("#openingInput");
const startBtn = $("#startBtn");
const questionPanel = $("#questionPanel");
const summaryPanel = $("#summaryPanel");
const urgentPanel = $("#urgentPanel");
const optionsEl = $("#options");
const freeText = $("#freeText");

function setStatus(text) {
  statusEl.textContent = text;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {"content-type": "application/json"},
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "request_failed");
  return data;
}

function resetPanels() {
  questionPanel.hidden = true;
  summaryPanel.hidden = true;
  urgentPanel.hidden = true;
}

function renderQuestion(data) {
  state.currentQuestion = data.question || data.next_question;
  if (!state.currentQuestion) return;
  resetPanels();
  questionPanel.hidden = false;
  $("#complaintLine").textContent = data.complaint
    ? `${data.complaint.label} / ${data.complaint.domainLabel} / ${data.complaint.riskTier === "high" ? "先排危险" : "标准整理"}`
    : "继续整理";
  $("#progressText").textContent = data.progress ? `${data.progress.turnCount}/${data.progress.limit}` : "";
  $("#questionText").textContent = state.currentQuestion.prompt;
  freeText.value = "";
  optionsEl.innerHTML = "";
  for (const option of state.currentQuestion.options) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => answer(option.value));
    optionsEl.appendChild(button);
  }
}

function li(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function fillList(selector, rows, emptyText) {
  const target = $(selector);
  target.innerHTML = "";
  if (!rows.length) {
    target.appendChild(li(emptyText));
    return;
  }
  rows.forEach(row => target.appendChild(li(row)));
}

function buildShareText(summary) {
  const complaint = summary.chiefComplaint?.userLabel || "症状";
  const facts = summary.reportedFacts.length
    ? summary.reportedFacts.map(fact => `- ${fact.key}: ${fact.value}`).join("\n")
    : "- 暂无明确事实";
  const uncertainties = summary.uncertainties.length
    ? summary.uncertainties.slice(0, 6).map(item => `- ${item}`).join("\n")
    : "- 暂无";
  const verify = summary.clinicianToVerify.length
    ? summary.clinicianToVerify.slice(0, 6).map(item => `- ${item}`).join("\n")
    : "- 暂无";
  return [
    `我用全民中医整理了一份就诊前症状摘要：${complaint}`,
    "",
    "已报告事实：",
    facts,
    "",
    "仍不确定：",
    uncertainties,
    "",
    "医生待核实：",
    verify,
    "",
    "说明：这不是诊断，不含证型、方剂和剂量，只是把症状先说清楚。",
    location.href
  ].join("\n");
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continue to the legacy path below for iOS/LAN HTTP.
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  document.body.removeChild(textarea);
  if (!copied) window.prompt("长按复制下面这段内容", text);
  return copied;
}

function renderSummary(summary) {
  state.summary = summary;
  resetPanels();
  if (summary.safety.status === "urgent_handoff") urgentPanel.hidden = false;
  summaryPanel.hidden = false;
  fillList("#factsList", summary.reportedFacts.map(fact => `${fact.key}: ${fact.value}`), "暂无明确事实");
  fillList("#uncertaintyList", summary.uncertainties, "暂无");
  fillList("#verifyList", summary.clinicianToVerify, "暂无");
  fillList("#boundaryList", [
    "不输出唯一证型",
    "不输出方剂",
    "不输出剂量",
    "不让用户自报专业脉腹诊"
  ], "边界正常");
  $("#summaryJson").textContent = JSON.stringify(summary, null, 2);
  setStatus(summary.safety.status === "urgent_handoff" ? "已安全中断" : "摘要已生成");
}

async function start(opening) {
  const text = opening || openingInput.value.trim();
  if (!text) {
    openingInput.focus();
    return;
  }
  setStatus("整理中");
  resetPanels();
  const data = await api("/v1/interviews", {
    method: "POST",
    body: JSON.stringify({opening_utterance: text})
  });
  if (data.status === "needs_clarification") {
    $("#complaintLine").textContent = "没匹配到具体症状，按部位找一找";
    $("#progressText").textContent = "";
    $("#questionText").textContent = data.question.prompt;
    optionsEl.innerHTML = "";
    data.question.options.forEach(option => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.label;
      button.addEventListener("click", async () => {
        // 二级：选了部位，拉该部位下的具体症状
        $("#questionText").textContent = `「${option.label}」里，具体是哪种情况？`;
        optionsEl.innerHTML = "";
        try {
          const list = await api(`/v1/complaints?domain=${encodeURIComponent(option.domain)}`);
          list.complaints.forEach(item => {
            const sub = document.createElement("button");
            sub.type = "button";
            sub.textContent = item.label;
            sub.addEventListener("click", () => start(item.label));
            optionsEl.appendChild(sub);
          });
        } catch {
          $("#questionText").textContent = "加载失败，请直接在上方重新输入症状";
        }
      });
      optionsEl.appendChild(button);
    });
    questionPanel.hidden = false;
    setStatus("需要澄清");
    return;
  }
  state.interviewId = data.interview_id;
  openingInput.value = text;
  setStatus("问答中");
  renderQuestion(data);
}

async function answer(option) {
  if (!state.interviewId || !state.currentQuestion) return;
  setStatus("更新中");
  const data = await api(`/v1/interviews/${state.interviewId}/answers`, {
    method: "POST",
    body: JSON.stringify({
      question_id: state.currentQuestion.id,
      option,
      free_text: freeText.value.trim()
    })
  });
  if (data.summary) {
    renderSummary(data.summary);
    return;
  }
  setStatus("问答中");
  renderQuestion(data);
}

startBtn.addEventListener("click", () => start());
openingInput.addEventListener("keydown", event => {
  if (event.key === "Enter") start();
});

document.querySelectorAll("[data-opening]").forEach(button => {
  button.addEventListener("click", () => start(button.dataset.opening));
});

$("#copyBtn").addEventListener("click", async () => {
  if (!state.summary) return;
  await copyText(buildShareText(state.summary));
  setStatus("已复制");
});

$("#copyLinkBtn").addEventListener("click", async () => {
  await copyText(location.href);
  setStatus("链接已复制");
});

$("#shareBtn").addEventListener("click", async () => {
  if (!state.summary) return;
  const text = buildShareText(state.summary);
  const payload = {
    title: "全民中医就诊前症状摘要",
    text,
    url: location.href
  };
  try {
    if (navigator.share) {
      await navigator.share(payload);
      setStatus("已打开分享");
      return;
    }
    await copyText(text);
    setStatus("已复制，手动转发");
  } catch (error) {
    if (error.name === "AbortError") return;
    await copyText(text);
    setStatus("已复制，手动转发");
  }
});

api("/v1/verification-report")
  .then(report => {
    $("#metrics").innerHTML = `
      <div><strong>${report.patientCount}</strong><span>合成回归</span></div>
      <div><strong>${report.goldenCount}</strong><span>金标用例</span></div>
      <div><strong>${report.pass ? "PASS" : "FAIL"}</strong><span>验证状态</span></div>
    `;
  })
  .catch(() => {});

// ===== 标签页切换 =====
const viewMap = {
  home: { view: $("#homeView"), nav: "[data-view=home]" },
  feedback: { view: $("#feedbackView"), nav: "[data-view=feedback]" },
  about: { view: $("#aboutView"), nav: "[data-view=about]" }
};

function switchTab(name) {
  Object.entries(viewMap).forEach(([key, { view, nav }]) => {
    view.hidden = key !== name;
    document.querySelectorAll(nav).forEach(button => {
      button.classList.toggle("active", key === name);
    });
  });
}

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", () => switchTab(button.dataset.view));
});

// ===== 留言建议 =====
$("#submitFeedbackBtn").addEventListener("click", async () => {
  const message = $("#feedbackMessage").value.trim();
  const statusEl = $("#feedbackStatus");
  if (message.length < 3) {
    statusEl.textContent = "请至少写几个字，好让我们知道哪里要改";
    statusEl.className = "feedback-status error";
    $("#feedbackMessage").focus();
    return;
  }
  const submitBtn = $("#submitFeedbackBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "提交中…";
  statusEl.textContent = "";
  statusEl.className = "feedback-status";
  try {
    await api("/v1/feedback", {
      method: "POST",
      body: JSON.stringify({
        category: $("#feedbackCategory").value,
        rating: $("#feedbackRating").value,
        message,
        contact: $("#feedbackContact").value.trim(),
        page: "client",
        interview_id: state.interviewId || ""
      })
    });
    statusEl.textContent = "谢谢你的建议，已收到。我们会据此改进。";
    statusEl.className = "feedback-status success";
    $("#feedbackMessage").value = "";
    $("#feedbackContact").value = "";
  } catch (error) {
    statusEl.textContent = "提交失败，请稍后再试";
    statusEl.className = "feedback-status error";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "提交建议";
  }
});
