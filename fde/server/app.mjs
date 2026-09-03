import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  answerQuestion,
  buildVisitSummary,
  createSession,
  selectNextQuestion,
  stoppingDecision
} from "../src/question-engine.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const clientDir = path.join(root, "client");
const assetsDir = path.join(root, "assets");
const reportsDir = path.join(root, "reports");
const dataDir = path.join(root, "data");
const feedbackFile = path.join(dataDir, "feedback.jsonl");

const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const complaintAsset = readJson(path.join(assetsDir, "Common_Complaints.json"));
const verificationReport = () => readJson(path.join(reportsDir, "verification-report.json"));

const complaints = complaintAsset.complaints;
const complaintById = new Map(complaints.map(item => [item.id, item]));
const sessions = new Map();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

function normalizeText(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function scoreComplaint(opening) {
  const input = normalizeText(opening);
  if (!input) return [];
  return complaints
    .map(complaint => {
      let best = 0;
      for (const alias of complaint.aliases) {
        const term = normalizeText(alias);
        if (!term) continue;
        if (input === term) best = Math.max(best, 100);
        else if (input.includes(term)) best = Math.max(best, 72 + Math.min(18, term.length));
        else if (term.includes(input)) best = Math.max(best, 42 + Math.min(20, input.length));
      }
      return { complaint, score: best };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.complaint.label.localeCompare(b.complaint.label))
    .slice(0, 3);
}

function publicQuestion(question) {
  if (!question) return null;
  return {
    id: question.id,
    factKey: question.factKey,
    prompt: question.prompt,
    options: question.options.map(option => ({
      value: option.value,
      label: option.label
    })),
    kind: question.kind
  };
}

function progress(session, complaint, stop = null) {
  const decision = stop ?? stoppingDecision(session, complaint);
  return {
    status: session.status,
    turnCount: session.turns.length,
    limit: 12,
    reason: decision.reason,
    missingMandatory: decision.missingMandatory ?? []
  };
}

function publicSummary(session, complaint) {
  const summary = buildVisitSummary(session, complaint);
  if (session.status === "interviewing") {
    summary.safety.status = "not_completed";
  }
  return summary;
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(payload);
}

function sanitizeText(value, limit = 1000) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function readFeedback(limit = 50) {
  if (!fs.existsSync(feedbackFile)) return [];
  return fs.readFileSync(feedbackFile, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map(line => JSON.parse(line))
    .slice(-limit)
    .reverse();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error("body_too_large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(req, res, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const file = path.normalize(path.join(clientDir, requested));
  if (!file.startsWith(clientDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, {"content-type": "text/plain; charset=utf-8"});
      res.end("Not found");
      return;
    }
    res.writeHead(200, {"content-type": mime[path.extname(file)] ?? "application/octet-stream"});
    res.end(data);
  });
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, {
      ok: true,
      name: "quanmin-tcm-fde-landing",
      assetVersion: complaintAsset.schemaVersion,
      complaintCount: complaints.length
    });
  }

  if (req.method === "GET" && url.pathname === "/v1/complaints") {
    const domainFilter = url.searchParams.get("domain");
    const filtered = domainFilter
      ? complaints.filter(item => item.domain === domainFilter)
      : complaints;
    return sendJson(res, 200, {
      count: filtered.length,
      complaints: filtered.map(item => ({
        id: item.id,
        label: item.label,
        domain: item.domain,
        domainLabel: item.domainLabel,
        riskTier: item.riskTier,
        aliases: item.aliases
      }))
    });
  }

  // 按部位/系统分组的导航入口（兜底澄清用）
  if (req.method === "GET" && url.pathname === "/v1/domains") {
    const domains = new Map();
    for (const item of complaints) {
      if (!domains.has(item.domain)) {
        domains.set(item.domain, { domain: item.domain, label: item.domainLabel, count: 0 });
      }
      domains.get(item.domain).count += 1;
    }
    return sendJson(res, 200, { domains: [...domains.values()] });
  }

  if (req.method === "GET" && url.pathname === "/v1/verification-report") {
    return sendJson(res, 200, verificationReport());
  }

  if (req.method === "GET" && url.pathname === "/v1/feedback") {
    return sendJson(res, 200, {
      feedback: readFeedback(Number(url.searchParams.get("limit") || 50))
    });
  }

  if (req.method === "POST" && url.pathname === "/v1/feedback") {
    const body = await readBody(req);
    const message = sanitizeText(body.message, 1200);
    if (message.length < 3) {
      return sendJson(res, 400, { error: "feedback_message_required" });
    }
    const item = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      category: sanitizeText(body.category || "general", 40),
      rating: Number.isFinite(Number(body.rating)) ? Math.max(1, Math.min(5, Number(body.rating))) : null,
      message,
      contact: sanitizeText(body.contact, 120),
      page: sanitizeText(body.page || "", 200),
      interviewId: sanitizeText(body.interview_id || "", 80),
      userAgent: sanitizeText(req.headers["user-agent"] || "", 240)
    };
    fs.mkdirSync(dataDir, { recursive: true });
    fs.appendFileSync(feedbackFile, JSON.stringify(item) + "\n", "utf8");
    return sendJson(res, 201, {
      ok: true,
      id: item.id,
      savedAt: item.createdAt
    });
  }

  if (req.method === "POST" && url.pathname === "/v1/interviews") {
    const body = await readBody(req);
    const opening = body.opening_utterance ?? "";
    const ranked = scoreComplaint(opening);
    if (!ranked.length || ranked[0].score < 45) {
      // 兜底澄清：按部位/系统分组导航，而不是硬塞前12条无关选项
      const domainGroups = new Map();
      for (const item of complaints) {
        if (!domainGroups.has(item.domain)) {
          domainGroups.set(item.domain, { domain: item.domain, label: item.domainLabel, complaints: [] });
        }
        domainGroups.get(item.domain).complaints.push({ id: item.id, label: item.label });
      }
      return sendJson(res, 200, {
        status: "needs_clarification",
        question: {
          prompt: "没太听懂，别急。先告诉我你主要是哪里不舒服？",
          options: [...domainGroups.values()].map(group => ({
            value: group.label,
            label: group.label,
            domain: group.domain
          }))
        },
        candidates: ranked.map(item => ({
          id: item.complaint.id,
          label: item.complaint.label,
          score: item.score
        }))
      });
    }

    const complaint = ranked[0].complaint;
    const session = createSession(complaint);
    session.startedAt = new Date().toISOString();
    session.openingUtterance = String(opening).slice(0, 500);
    const question = selectNextQuestion(session, complaint);
    const id = randomUUID();
    sessions.set(id, { session, complaint });
    return sendJson(res, 201, {
      interview_id: id,
      status: session.status,
      complaint: {
        id: complaint.id,
        label: complaint.label,
        domainLabel: complaint.domainLabel,
        riskTier: complaint.riskTier
      },
      question: publicQuestion(question),
      candidates: ranked.map(item => ({
        id: item.complaint.id,
        label: item.complaint.label,
        score: item.score
      })),
      progress: progress(session, complaint)
    });
  }

  const answerMatch = url.pathname.match(/^\/v1\/interviews\/([^/]+)\/answers$/);
  if (req.method === "POST" && answerMatch) {
    const record = sessions.get(answerMatch[1]);
    if (!record) return sendJson(res, 404, { error: "interview_not_found" });
    const { session, complaint } = record;
    const body = await readBody(req);
    const question = selectNextQuestion(session, complaint);
    if (!question) {
      session.status = session.status === "urgent_handoff" ? session.status : "completed";
      return sendJson(res, 200, {
        status: session.status,
        progress: progress(session, complaint),
        summary: publicSummary(session, complaint)
      });
    }

    const option = body.option ?? body.answer ?? question.options.find(item => item.value === "unknown")?.value ?? question.options.at(-1)?.value;
    answerQuestion(session, question, option, body.free_text ?? "");

    const stop = stoppingDecision(session, complaint);
    if (stop.stop) {
      session.status = session.status === "urgent_handoff" ? "urgent_handoff" : "completed";
      return sendJson(res, 200, {
        status: session.status,
        progress: progress(session, complaint, stop),
        summary: publicSummary(session, complaint)
      });
    }

    const nextQuestion = selectNextQuestion(session, complaint);
    if (!nextQuestion) session.status = "completed";
    return sendJson(res, 200, {
      status: session.status,
      next_question: publicQuestion(nextQuestion),
      progress: progress(session, complaint, stop)
    });
  }

  const summaryMatch = url.pathname.match(/^\/v1\/interviews\/([^/]+)\/summary$/);
  if (req.method === "GET" && summaryMatch) {
    const record = sessions.get(summaryMatch[1]);
    if (!record) return sendJson(res, 404, { error: "interview_not_found" });
    return sendJson(res, 200, publicSummary(record.session, record.complaint));
  }

  return sendJson(res, 404, { error: "not_found" });
}

export function createApp() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    try {
      if (url.pathname === "/health" || url.pathname.startsWith("/v1/")) {
        await handleApi(req, res, url);
      } else {
        serveStatic(req, res, decodeURIComponent(url.pathname));
      }
    } catch (error) {
      sendJson(res, error.message === "invalid_json" ? 400 : 500, {
        error: error.message || "server_error"
      });
    }
  });
}
