const fs = require("fs");
const path = require("path");
const http = require("http");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const {
  expandHome,
  fileExists,
  getExampleWorkspacePath,
  getOfficeConfigInfo,
  loadConfig,
} = require("./config");

const CONFIG = loadConfig();

const ROLE_BY_ID = {
  main: "Orchestrator",
  newsletter: "Newsletter and Intelligence",
  video: "Video Production",
  calendar: "Calendar and Commitments",
  monitor: "Monitoring and Alerts",
  appbuilder: "App Builder",
  browser: "Browser Research",
};

const META_BY_ID = {
  main: { color: "#f4b942", emoji: "👑" },
  newsletter: { color: "#ff7a59", emoji: "📰" },
  video: { color: "#9b6dff", emoji: "🎬" },
  calendar: { color: "#3fa7ff", emoji: "📅" },
  monitor: { color: "#ff5d73", emoji: "🛡️" },
  appbuilder: { color: "#33c27f", emoji: "🛠️" },
  browser: { color: "#22c3ff", emoji: "🔎" },
};

const STRUCTURE_LINES = [
  "workspace-main/",
  "  SOUL.md",
  "  AGENTS.md",
  "  USER.md",
  "  TOOLS.md",
  "  HEARTBEAT.md",
  "  MEMORY.md",
  "  memory/YYYY-MM-DD.md",
];

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function notFound(res) {
  json(res, 404, { ok: false, error: "Not found" });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function readSoulFile(agentId, workspacePath) {
  const soulPath = path.join(workspacePath, "SOUL.md");
  if (!fileExists(soulPath)) {
    return { path: soulPath, content: "" };
  }
  return { path: soulPath, content: fs.readFileSync(soulPath, "utf8") };
}

function summarizeSoul(content) {
  const lines = String(content || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))
    .filter((line) => !line.startsWith("##"))
    .filter((line) => !line.startsWith("-"));

  return lines.slice(0, 2).join(" ").slice(0, 220);
}

function basenameLabel(workspacePath) {
  return path.basename(workspacePath || "").replace(/^workspace-/, "");
}

function buildOfficeState() {
  const info = getOfficeConfigInfo();
  const list = Array.isArray(info.data?.agents?.list) ? info.data.agents.list : [];

  const agents = list.map((agent) => {
    const workspacePath =
      info.source === "live" && agent.workspace
        ? expandHome(agent.workspace)
        : getExampleWorkspacePath(agent.id);

    const soul = readSoulFile(agent.id, workspacePath);
    const modelDisplay = agent.model?.primary || "default";

    return {
      id: agent.id,
      name: agent.name || agent.id,
      role: ROLE_BY_ID[agent.id] || "Specialist",
      workspace: workspacePath,
      workspaceLabel: basenameLabel(workspacePath),
      soulPath: soul.path,
      soulExcerpt: summarizeSoul(soul.content),
      soulText: soul.content,
      modelDisplay,
      providerName: ROLE_BY_ID[agent.id] || "Office",
      stats: { live: 0, total: 1 },
    };
  });

  return {
    office: {
      name: CONFIG.officeName,
      supervisor: "NTR",
      configSource: info.source,
      configPath: info.path,
      structureLines: STRUCTURE_LINES,
      fleetCount: agents.length,
    },
    agents,
    meta: META_BY_ID,
  };
}

async function runInstruction(payload) {
  const agent = String(payload.agent || "main").trim();
  const message = String(payload.message || "").trim();
  const thinking = String(payload.thinking || "medium").trim();
  const deliver = Boolean(payload.deliver);
  const timeout = Math.max(5_000, Math.min(Number(payload.timeout) || 120_000, 600_000));

  if (!message) {
    return { ok: false, error: "Message is required" };
  }

  if (!fileExists(CONFIG.openclawBinary)) {
    return {
      ok: false,
      error: `OpenClaw binary not found at ${CONFIG.openclawBinary}`,
    };
  }

  const args = ["agent", "--agent", agent, "--message", message, "--json"];
  if (thinking) {
    args.push("--thinking", thinking);
  }
  if (deliver) {
    args.push("--deliver");
  }

  try {
    const { stdout, stderr } = await execFileAsync(CONFIG.openclawBinary, args, {
      timeout,
      maxBuffer: 10 * 1024 * 1024,
    });

    let parsed = null;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      parsed = null;
    }

    return {
      ok: true,
      agent,
      output: parsed?.output || stdout.trim(),
      raw: parsed || null,
      stderr: stderr.trim() || null,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Instruction failed",
    };
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function serveStatic(req, res, pathname) {
  const appRoot = path.join(CONFIG.repoRoot, "apps", "bala-office");
  const requested = pathname === "/" ? "/index.html" : pathname;
  const fullPath = path.normalize(path.join(appRoot, requested));

  if (!fullPath.startsWith(appRoot) || !fileExists(fullPath)) {
    return notFound(res);
  }

  res.writeHead(200, { "content-type": contentType(fullPath) });
  fs.createReadStream(fullPath).pipe(res);
}

function createRequestListener() {
  return async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;

    if (pathname === "/api/health") {
      return json(res, 200, { ok: true, status: "ok", office: CONFIG.officeName });
    }

    if (pathname === "/api/about") {
      return json(res, 200, {
        ok: true,
        name: CONFIG.officeName,
        repository: "https://github.com/vikrambalaaj/agentic-office",
      });
    }

    if (pathname === "/api/office-state") {
      return json(res, 200, buildOfficeState());
    }

    if (pathname === "/api/instruction" && req.method === "POST") {
      try {
        const body = await readBody(req);
        const payload = body ? JSON.parse(body) : {};
        const result = await runInstruction(payload);
        return json(res, result.ok ? 200 : 400, result);
      } catch (error) {
        return json(res, 400, { ok: false, error: error.message || "Invalid request" });
      }
    }

    if (req.method !== "GET") {
      return notFound(res);
    }

    return serveStatic(req, res, pathname);
  };
}

function createServer() {
  return http.createServer(createRequestListener());
}

if (require.main === module) {
  const server = createServer();
  server.listen(CONFIG.port, CONFIG.host, () => {
    console.log(`Bala Agentic Office running at http://${CONFIG.host}:${CONFIG.port}`);
  });
}

module.exports = {
  buildOfficeState,
  createRequestListener,
  createServer,
};
