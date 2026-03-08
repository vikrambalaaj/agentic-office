const fs = require("fs");
const path = require("path");
const os = require("os");

const HOME = os.homedir();
const REPO_ROOT = path.join(__dirname, "..");
const EXAMPLES_DIR = path.join(REPO_ROOT, "examples", "office");

function expandHome(input) {
  if (!input) return input;
  return String(input).replace(/^~/, HOME);
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getLiveOpenClawConfigPath() {
  const candidates = [
    process.env.OPENCLAW_CONFIG_PATH,
    path.join(HOME, ".openclaw", "openclaw.json"),
    path.join(HOME, ".openclaw", "config.json"),
  ]
    .filter(Boolean)
    .map(expandHome);

  return candidates.find(fileExists) || null;
}

function getExampleOfficeConfigPath() {
  return path.join(EXAMPLES_DIR, "openclaw.example.json");
}

function getOfficeConfigInfo() {
  const livePath = getLiveOpenClawConfigPath();
  if (livePath) {
    return {
      source: "live",
      path: livePath,
      data: loadJson(livePath),
    };
  }

  const examplePath = getExampleOfficeConfigPath();
  return {
    source: "example",
    path: examplePath,
    data: loadJson(examplePath),
  };
}

function getExampleWorkspacePath(agentId) {
  const map = {
    main: "workspace-main",
    newsletter: "workspace-newsletter",
    video: "workspace-video",
    calendar: "workspace-calendar",
    monitor: "workspace-monitor",
    appbuilder: "workspace-appbuilder",
    browser: "workspace-browser",
  };

  return path.join(EXAMPLES_DIR, map[agentId] || `workspace-${agentId}`);
}

function loadConfig() {
  return {
    port: Number.parseInt(process.env.PORT || "3333", 10),
    host: process.env.HOST || "127.0.0.1",
    officeName: process.env.AGENTIC_OFFICE_NAME || "Bala Agentic Office",
    openclawBinary: process.env.OPENCLAW_BINARY || "/opt/homebrew/bin/openclaw",
    examplesDir: EXAMPLES_DIR,
    repoRoot: REPO_ROOT,
  };
}

module.exports = {
  EXAMPLES_DIR,
  HOME,
  REPO_ROOT,
  expandHome,
  fileExists,
  getExampleWorkspacePath,
  getOfficeConfigInfo,
  loadConfig,
  loadJson,
};
