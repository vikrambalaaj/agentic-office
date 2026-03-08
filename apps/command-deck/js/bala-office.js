(function () {
  "use strict";

  const TILE_SIZE = 16;
  const ROOM_COLS = 35;
  const ROOM_ROWS = 14;
  const NATIVE_W = ROOM_COLS * TILE_SIZE;
  const NATIVE_H = ROOM_ROWS * TILE_SIZE;
  const SCALE = 2;
  const DISPLAY_W = NATIVE_W * SCALE;
  const DISPLAY_H = NATIVE_H * SCALE;
  const OFFICE_ZONE_COL = 24;
  const MAX_DT = 100;
  const WALK_SPEED = 48;
  const WALK_FRAME_MS = 150;
  const TYPE_FRAME_MS = 300;
  const WALK_FRAME_SEQ = [0, 1, 2, 1];
  const SIT_OFFSET_Y = 6;

  const TILE = {
    FLOOR: 0,
    WALL: 1,
    BASEBOARD: 11,
    LOUNGE_FLOOR: 12,
  };

  const ROOM_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 13, 13, 1, 1, 1, 1, 1],
    [1, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 13, 13, 1, 7, 7, 7, 1],
    [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 7, 7, 7, 11],
    [0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0, 12, 12, 12, 12, 12, 12, 7, 7, 7, 12],
    [0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0, 12, 12, 12, 12, 12, 12, 2, 2, 2, 12],
    [0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 12, 12, 12, 12, 12, 12, 12, 12, 3, 12, 12],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 12, 8, 12, 12, 12, 12, 12, 12, 12],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 12, 8, 12, 12, 12, 12, 12, 12, 12],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 12, 12, 12, 12, 12, 10, 10, 12, 12],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 12, 12, 12, 12, 12, 10, 10, 12, 12],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  const PRIORITY_ORDER = ["main", "newsletter", "video", "calendar", "monitor", "appbuilder", "browser"];

  const PRESET_WORKSTATIONS = {
    main: { seatCol: 17, seatRow: 5, deskCols: [16, 17, 18], deskRows: [3, 4], color: "#ffd700" },
    newsletter: { seatCol: 6, seatRow: 10, deskCols: [5, 6, 7], deskRows: [8, 9], color: "#ff6b35" },
    video: { seatCol: 11, seatRow: 10, deskCols: [10, 11, 12], deskRows: [8, 9], color: "#9b59b6" },
    calendar: { seatCol: 16, seatRow: 11, deskCols: [15, 16, 17], deskRows: [9, 10], color: "#3498db" },
    monitor: { seatCol: 21, seatRow: 10, deskCols: [20, 21, 22], deskRows: [8, 9], color: "#e74c3c" },
    appbuilder: { seatCol: 26, seatRow: 11, deskCols: [25, 26, 27], deskRows: [9, 10], color: "#2ecc71" },
    browser: { seatCol: 30, seatRow: 10, deskCols: [29, 30, 31], deskRows: [8, 9], color: "#22c3ff" },
  };

  const COMMON_AREAS = {
    meeting: { col: 10, row: 9 },
    coffee: { col: 27, row: 8 },
    lounge: { col: 29, row: 4 },
  };

  const ACTIONS = [
    { label: "Work", emoji: "💻", action: "work", message: "Focused work..." },
    { label: "Coffee", emoji: "☕", action: "coffee", message: "Coffee break" },
    { label: "Lounge", emoji: "🛋️", action: "lounge", message: "Quick recharge" },
    { label: "Celebrate", emoji: "🎉", action: "celebrate", message: "Milestone hit" },
    { label: "Talk", emoji: "💬", action: "talk", message: "Quick sync" },
  ];

  const WORK_MSGS = {
    main: ["Reviewing strategy", "Supervisor sweep", "Coordinating teams"],
    newsletter: ["Building trend brief", "Drafting update", "Watching channels"],
    video: ["Storyboarding", "Editing sequence", "Rendering assets"],
    calendar: ["Optimizing schedule", "Tracking timelines", "Planning windows"],
    monitor: ["Scanning alerts", "Monitoring health", "Investigating anomaly"],
    appbuilder: ["Shipping feature", "Refining build", "Improving UX"],
    browser: ["Running browser ops", "Testing workflow", "Gathering context"],
    _default: ["Working..."],
  };

  const BANTER_MSGS = {
    main: ["Status sync", "Give me a quick update"],
    newsletter: ["I found a new trend", "Need review on this angle"],
    video: ["Cut looks cleaner now", "Need feedback on pacing"],
    calendar: ["Can we move this slot?", "Timeline looks tight"],
    monitor: ["Signal spike detected", "I see something unusual"],
    appbuilder: ["Patch is ready", "Can someone sanity check this?"],
    browser: ["Workflow verified", "Automation path succeeded"],
    _default: ["Quick check-in"],
  };

  const COFFEE_MSGS = ["Coffee time", "Refueling...", "Need caffeine", "Short break"];
  const LOUNGE_MSGS = {
    _default: ["Resetting focus", "Taking a breather", "Quiet time"],
  };
  const CELEBRATE_MSGS = {
    _default: ["Shipped", "Nice work", "Great outcome", "Success"],
  };

  const WANDER_PROFILE = {
    movesMin: 3,
    movesMax: 6,
    restMin: 60000,
    restMax: 150000,
    radius: 10,
    pauseMin: 800,
    pauseMax: 2000,
  };

  const SKY_COLORS = {
    night: "#1a1a3e",
    dawn: "#e8a87c",
    morning: "#87ceeb",
    day: "#5dade2",
    sunset: "#f39c6b",
    dusk: "#4a3f6b",
  };

  const spriteCache = new Map();

  function esc(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function hashToUnit(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }

  function getTimeOfDay(hour) {
    if (hour >= 21 || hour < 5) return "night";
    if (hour >= 5 && hour < 7) return "dawn";
    if (hour >= 7 && hour < 10) return "morning";
    if (hour >= 10 && hour < 16) return "day";
    if (hour >= 16 && hour < 19) return "sunset";
    return "dusk";
  }

  function tileToPixel(col, row) {
    return {
      x: col * TILE_SIZE + TILE_SIZE / 2,
      y: row * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  function adjustColor(hex, amount) {
    const num = parseInt(String(hex || "#888888").replace("#", ""), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }

  function hexToRgba(hex, alpha) {
    const num = parseInt(String(hex || "#888888").replace("#", ""), 16);
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function makeBodySprite(color) {
    const key = `body-${color}`;
    if (spriteCache.has(key)) return spriteCache.get(key);

    const c = document.createElement("canvas");
    const CHAR = 32;
    c.width = CHAR * 4;
    c.height = CHAR * 4;
    const g = c.getContext("2d");
    if (!g) return "";

    const darker = adjustColor(color, -30);
    const lighter = adjustColor(color, 20);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const ox = col * CHAR;
        const oy = row * CHAR;
        const frame = col % 2;

        g.fillStyle = "rgba(0,0,0,0.15)";
        g.fillRect(ox + 12, oy + 28, 8, 2);

        g.fillStyle = color;
        g.fillRect(ox + 10, oy + 14, 12, 10);
        g.fillStyle = lighter;
        g.fillRect(ox + 10, oy + 14, 12, 2);
        g.fillStyle = darker;
        g.fillRect(ox + 10, oy + 22, 12, 2);

        g.fillStyle = "#f5d6ba";
        if (row === 0 || row === 2) {
          g.fillRect(ox + 6, oy + 16 + frame * 2, 4, 6);
          g.fillRect(ox + 22, oy + 16 + (1 - frame) * 2, 4, 6);
        } else {
          g.fillRect(ox + 8, oy + 16, 4, 6);
        }

        g.fillStyle = "#3d4a5c";
        const legOff = frame * 2;
        g.fillRect(ox + 10 + legOff, oy + 24, 5, 5);
        g.fillRect(ox + 17 - legOff, oy + 24, 5, 5);

        g.fillStyle = "#2a2a2a";
        g.fillRect(ox + 10 + legOff, oy + 28, 5, 2);
        g.fillRect(ox + 17 - legOff, oy + 28, 5, 2);
      }
    }

    const url = c.toDataURL();
    spriteCache.set(key, url);
    return url;
  }

  function buildWalkableGrid() {
    const grid = [];
    for (let row = 0; row < ROOM_ROWS; row++) {
      grid[row] = [];
      for (let col = 0; col < ROOM_COLS; col++) {
        const tile = ROOM_MAP[row][col];
        grid[row][col] = tile === TILE.FLOOR || tile === 3 || tile === TILE.LOUNGE_FLOOR;
      }
    }
    return grid;
  }

  function bfs(walkable, start, goal) {
    if (start.col === goal.col && start.row === goal.row) return [];
    if (!walkable[goal.row] || !walkable[goal.row][goal.col]) return [];
    if (!walkable[start.row] || !walkable[start.row][start.col]) return [];

    const dirs = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];

    const key = (p) => p.row * ROOM_COLS + p.col;
    const startKey = key(start);

    const visited = new Set([startKey]);
    const parent = new Map();
    const queue = [start];

    while (queue.length > 0) {
      const current = queue.shift();
      const currentKey = key(current);

      if (current.col === goal.col && current.row === goal.row) {
        const path = [];
        let k = currentKey;
        while (k !== startKey) {
          const row = Math.floor(k / ROOM_COLS);
          const col = k % ROOM_COLS;
          path.push({ col, row });
          k = parent.get(k);
          if (k === undefined) break;
        }
        path.reverse();
        return path;
      }

      for (const [dc, dr] of dirs) {
        const nc = current.col + dc;
        const nr = current.row + dr;
        if (nc < 0 || nc >= ROOM_COLS || nr < 0 || nr >= ROOM_ROWS) continue;
        if (!walkable[nr][nc]) continue;
        const nk = nr * ROOM_COLS + nc;
        if (visited.has(nk)) continue;
        visited.add(nk);
        parent.set(nk, currentKey);
        queue.push({ col: nc, row: nr });
      }
    }

    return [];
  }

  function findRandomWalkable(walkable, nearCol, nearRow, radius) {
    const candidates = [];
    const minCol = Math.max(0, nearCol - radius);
    const maxCol = Math.min(ROOM_COLS - 1, nearCol + radius);
    const minRow = Math.max(0, nearRow - radius);
    const maxRow = Math.min(ROOM_ROWS - 1, nearRow + radius);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (walkable[r][c]) candidates.push({ col: c, row: r });
      }
    }

    return candidates.length ? pick(candidates) : null;
  }

  function calcDir(dx, dy) {
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
  }

  function createLoop(update, render) {
    let running = false;
    let rafId = 0;
    let prevTime = 0;
    let frame = 0;

    function tick(now) {
      if (!running) return;
      const rawDt = prevTime ? now - prevTime : 16;
      const dt = Math.min(rawDt, MAX_DT);
      prevTime = now;
      frame += 1;

      try {
        update({ time: now, dt, frame });
        render({ time: now, dt, frame });
      } catch (_e) {
        // Keep loop alive even if one frame fails.
      }

      rafId = requestAnimationFrame(tick);
    }

    return {
      start() {
        if (running) return;
        running = true;
        prevTime = 0;
        frame = 0;
        rafId = requestAnimationFrame(tick);
      },
      stop() {
        running = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      resume() {
        if (!running) return;
        prevTime = 0;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(tick);
      },
    };
  }

  function sortAgents(agents) {
    const rank = (id) => {
      const idx = PRIORITY_ORDER.indexOf(String(id || ""));
      return idx === -1 ? 999 : idx;
    };

    return [...agents].sort((a, b) => {
      const ra = rank(a.id);
      const rb = rank(b.id);
      if (ra !== rb) return ra - rb;
      return String(a.name || a.id).localeCompare(String(b.name || b.id));
    });
  }

  function roleLabel(agent) {
    const id = String(agent.id || "");
    if (id === "main") return "Supervisor Agent";
    if (id === "newsletter") return "Newsletter Agent";
    if (id === "video") return "Video Agent";
    if (id === "calendar") return "Calendar Agent";
    if (id === "monitor") return "Monitoring Agent";
    if (id === "appbuilder") return "Builder Agent";
    if (id === "browser") return "Browser Agent";
    return "Specialist Agent";
  }

  function buildWorkstations(sortedAgents, metaById) {
    const stations = [];

    sortedAgents.forEach((agent, idx) => {
      const preset = PRESET_WORKSTATIONS[agent.id];
      const fallbackCol = 4 + (idx % 6) * 5;
      const fallbackRow = 10 + Math.floor(idx / 6);
      const seatCol = preset ? preset.seatCol : Math.min(32, fallbackCol);
      const seatRow = preset ? preset.seatRow : Math.min(11, fallbackRow);
      const seatPx = tileToPixel(seatCol, seatRow);
      const meta = metaById[agent.id] || {};

      stations.push({
        agentId: agent.id,
        color: meta.color || preset?.color || "#8b949e",
        seatCol,
        seatRow,
        seatPx,
        deskCols: preset ? preset.deskCols : [Math.max(1, seatCol - 1), seatCol, Math.min(ROOM_COLS - 2, seatCol + 1)],
        deskRows: preset ? preset.deskRows : [Math.max(4, seatRow - 2), Math.max(5, seatRow - 1)],
      });
    });

    return stations;
  }

  function createAgentEntity(agent, station) {
    return {
      id: agent.id,
      name: agent.name,
      modelShort: agent.modelShort || agent.modelDisplay || "",
      providerName: agent.providerName || "Unknown",
      stats: agent.stats || { total: 0, live: 0, recent: 0 },
      avatar: agent.avatar || "🤖",
      color: station.color,
      roleLabel: roleLabel(agent),

      x: station.seatPx.x,
      y: station.seatPx.y,
      tileCol: station.seatCol,
      tileRow: station.seatRow,
      moveFromCol: station.seatCol,
      moveFromRow: station.seatRow,
      moveToCol: station.seatCol,
      moveToRow: station.seatRow,
      moveProgress: 0,
      pathQueue: [],
      cachedGoalCol: -1,
      cachedGoalRow: -1,

      seatCol: station.seatCol,
      seatRow: station.seatRow,
      seatPx: station.seatPx,

      walkFrame: 0,
      walkFrameTimer: 0,
      typeFrame: 0,
      typeFrameTimer: 0,

      state: "idle",
      direction: "down",
      stateAge: 0,

      message: null,
      talkingTo: null,
      replyFrom: null,
      emotion: null,
      arriveState: null,
      dwellUntil: Date.now() + rand(500, 1500),

      wanderMovesLeft: 0,
      wanderRestTimer: 0,
      isInWanderCycle: false,
      sitOffsetY: 0,
    };
  }

  function pickMsg(map, id, fallback) {
    const list = map[id] || map._default || fallback;
    return pick(Array.isArray(list) && list.length ? list : fallback);
  }

  function updateSitOffset(agent) {
    const sitStates = ["work", "deepfocus", "slack"];
    agent.sitOffsetY = sitStates.includes(agent.state) && agent.pathQueue.length === 0 ? SIT_OFFSET_Y : 0;
  }

  function navigateTo(agent, goalCol, goalRow, walkable, arriveState) {
    if (agent.cachedGoalCol === goalCol && agent.cachedGoalRow === goalRow && agent.pathQueue.length > 0) {
      return true;
    }

    const start = { col: agent.tileCol, row: agent.tileRow };
    const goal = { col: goalCol, row: goalRow };
    const path = bfs(walkable, start, goal);
    if (!path.length) return false;

    agent.pathQueue = path;
    agent.cachedGoalCol = goalCol;
    agent.cachedGoalRow = goalRow;
    agent.moveFromCol = agent.tileCol;
    agent.moveFromRow = agent.tileRow;
    agent.moveToCol = path[0].col;
    agent.moveToRow = path[0].row;
    agent.moveProgress = 0;
    agent.state = "walk";
    agent.arriveState = arriveState || null;
    agent.sitOffsetY = 0;
    agent.direction = calcDir(path[0].col - agent.tileCol, path[0].row - agent.tileRow);

    return true;
  }

  function navigateToSeat(agent, walkable, arriveState) {
    return navigateTo(agent, agent.seatCol, agent.seatRow, walkable, arriveState || "work");
  }

  function tickMovement(agent, dtMs) {
    if (!agent.pathQueue.length) return;

    agent.moveProgress += (WALK_SPEED * dtMs / 1000) / TILE_SIZE;

    if (agent.moveProgress >= 1) {
      agent.moveProgress = 0;
      agent.tileCol = agent.moveToCol;
      agent.tileRow = agent.moveToRow;
      const px = tileToPixel(agent.tileCol, agent.tileRow);
      agent.x = px.x;
      agent.y = px.y;
      agent.pathQueue.shift();

      if (agent.pathQueue.length) {
        const next = agent.pathQueue[0];
        agent.moveFromCol = agent.tileCol;
        agent.moveFromRow = agent.tileRow;
        agent.moveToCol = next.col;
        agent.moveToRow = next.row;
        agent.direction = calcDir(next.col - agent.tileCol, next.row - agent.tileRow);
      } else if (agent.arriveState) {
        agent.state = agent.arriveState;
      }
      updateSitOffset(agent);
    } else {
      const fromPx = tileToPixel(agent.moveFromCol, agent.moveFromRow);
      const toPx = tileToPixel(agent.moveToCol, agent.moveToRow);
      agent.x = fromPx.x + (toPx.x - fromPx.x) * agent.moveProgress;
      agent.y = fromPx.y + (toPx.y - fromPx.y) * agent.moveProgress;
    }

    agent.walkFrameTimer += dtMs;
    if (agent.walkFrameTimer >= WALK_FRAME_MS) {
      agent.walkFrameTimer -= WALK_FRAME_MS;
      agent.walkFrame = (agent.walkFrame + 1) % WALK_FRAME_SEQ.length;
    }
  }

  function tickTypeAnimation(agent, dtMs) {
    if (agent.state !== "work" && agent.state !== "deepfocus") return;
    agent.typeFrameTimer += dtMs;
    if (agent.typeFrameTimer >= TYPE_FRAME_MS) {
      agent.typeFrameTimer -= TYPE_FRAME_MS;
      agent.typeFrame = agent.typeFrame === 0 ? 1 : 0;
    }
  }

  function startWanderCycle(agent) {
    agent.wanderMovesLeft = Math.floor(rand(WANDER_PROFILE.movesMin, WANDER_PROFILE.movesMax + 1));
    agent.wanderRestTimer = 0;
    agent.isInWanderCycle = true;
  }

  function tickWander(agent, walkable) {
    if (!agent.isInWanderCycle) return;
    if (agent.pathQueue.length) return;

    if (agent.wanderMovesLeft <= 0) {
      agent.isInWanderCycle = false;
      agent.wanderRestTimer = rand(WANDER_PROFILE.restMin, WANDER_PROFILE.restMax);
      navigateToSeat(agent, walkable, "work");
      return;
    }

    if (agent.dwellUntil > Date.now()) return;

    const target = findRandomWalkable(walkable, agent.tileCol, agent.tileRow, WANDER_PROFILE.radius);
    if (target) {
      const moved = navigateTo(agent, target.col, target.row, walkable, "idle");
      if (moved) {
        agent.wanderMovesLeft -= 1;
        agent.dwellUntil = Date.now() + rand(WANDER_PROFILE.pauseMin, WANDER_PROFILE.pauseMax);
      }
    }
  }

  function executeCommand(runtime, agent, cmd, allAgents) {
    const talkTarget = cmd.targetAgentId ? allAgents.find((a) => a.id === cmd.targetAgentId) : null;

    agent.isInWanderCycle = false;
    agent.wanderRestTimer = 0;
    agent.replyFrom = null;
    runtime.conversationMap.delete(agent.id);

    if (cmd.action === "work") {
      navigateToSeat(agent, runtime.walkable, "work");
      agent.message = (cmd.message || pickMsg(WORK_MSGS, agent.id, WORK_MSGS._default)).slice(0, 34);
      agent.talkingTo = null;
      agent.emotion = null;
      agent.dwellUntil = Date.now() + 1400;
      return;
    }

    if (cmd.action === "coffee") {
      const coffee = COMMON_AREAS.coffee;
      navigateTo(
        agent,
        coffee.col + Math.floor(rand(-1, 2)),
        coffee.row + Math.floor(rand(0, 2)),
        runtime.walkable,
        "coffee",
      );
      agent.message = (cmd.message || pick(COFFEE_MSGS)).slice(0, 34);
      agent.talkingTo = null;
      agent.emotion = null;
      agent.dwellUntil = Date.now() + 1200;
      return;
    }

    if (cmd.action === "lounge") {
      const lounge = COMMON_AREAS.lounge;
      navigateTo(
        agent,
        lounge.col + Math.floor(rand(-1, 2)),
        lounge.row + Math.floor(rand(1, 3)),
        runtime.walkable,
        "lounge",
      );
      agent.message = (cmd.message || pickMsg(LOUNGE_MSGS, agent.id, LOUNGE_MSGS._default)).slice(0, 34);
      agent.talkingTo = null;
      agent.emotion = "happy";
      agent.dwellUntil = Date.now() + 1400;
      return;
    }

    if (cmd.action === "celebrate") {
      agent.state = "celebrate";
      agent.arriveState = "celebrate";
      agent.message = (cmd.message || pickMsg(CELEBRATE_MSGS, agent.id, CELEBRATE_MSGS._default)).slice(0, 34);
      agent.talkingTo = null;
      agent.emotion = "excited";
      agent.dwellUntil = Date.now() + 900;
      return;
    }

    if (cmd.action === "talk" && talkTarget) {
      navigateTo(
        agent,
        talkTarget.tileCol + (agent.tileCol > talkTarget.tileCol ? 1 : -1),
        talkTarget.tileRow,
        runtime.walkable,
        "talk",
      );
      const askText = (cmd.message || pickMsg(BANTER_MSGS, agent.id, BANTER_MSGS._default)).slice(0, 34);
      const replyText = pickMsg(BANTER_MSGS, talkTarget.id, BANTER_MSGS._default).slice(0, 34);
      agent.message = askText;
      agent.talkingTo = talkTarget.id;
      agent.emotion = "happy";
      agent.dwellUntil = Date.now() + 1500;
      runtime.conversationMap.set(agent.id, { text: askText, replyText, phase: 0, timer: 18 });
      return;
    }

    agent.state = cmd.action;
    agent.arriveState = cmd.action;
    agent.message = cmd.message ? String(cmd.message).slice(0, 34) : null;
    agent.talkingTo = null;
    agent.dwellUntil = Date.now() + 1000;
  }

  function tickBehavior(runtime, agent, dtMs, allAgents) {
    agent.stateAge += dtMs;

    const conv = runtime.conversationMap.get(agent.id);
    if (conv) {
      conv.timer -= dtMs / 120;
      if (conv.timer <= 0) {
        if (conv.phase === 0) {
          const target = allAgents.find((a) => a.id === agent.talkingTo);
          if (target) {
            target.message = conv.replyText || "Got it";
            target.state = "talk";
            target.arriveState = "talk";
            target.emotion = "happy";
            target.replyFrom = agent.id;
            target.direction = calcDir(agent.x - target.x, agent.y - target.y);
          }
          conv.phase = 1;
          conv.timer = 12;
        } else {
          runtime.conversationMap.delete(agent.id);
          agent.message = null;
          agent.talkingTo = null;
          agent.emotion = null;
          const target = allAgents.find((a) => a.replyFrom === agent.id);
          if (target) {
            target.message = null;
            target.replyFrom = null;
            target.emotion = null;
          }
        }
      }
      return;
    }

    if (agent.replyFrom) return;
    if (agent.pathQueue.length) return;

    const commandIndex = runtime.commands.findIndex((c) => c.agentId === agent.id);
    if (commandIndex !== -1) {
      const cmd = runtime.commands.splice(commandIndex, 1)[0];
      executeCommand(runtime, agent, cmd, allAgents);
      return;
    }

    if (agent.dwellUntil && Date.now() < agent.dwellUntil) return;

    if (agent.isInWanderCycle) {
      tickWander(agent, runtime.walkable);
      return;
    }

    if (agent.wanderRestTimer > 0) {
      agent.wanderRestTimer -= dtMs;
      updateSitOffset(agent);
      return;
    }

    if (!runtime.autoMode) {
      if (agent.state !== "work" && agent.state !== "deepfocus" && Math.random() < 0.001 * dtMs) {
        navigateToSeat(agent, runtime.walkable, "work");
      }
      return;
    }

    const lookTempo = 0.0011;
    if (agent.state !== "walk" && Math.random() < lookTempo * dtMs) {
      const dirs = ["up", "right", "down", "left"];
      agent.direction = pick(dirs.filter((d) => d !== agent.direction));
      return;
    }

    const idleRollTempo = 0.00095;
    if (Math.random() >= idleRollTempo * dtMs) return;

    const weighted = [
      ["work", 2.0],
      ["coffee", 1.2],
      ["lounge", 0.9],
      ["talk", 1.5],
      ["wander", 2.5],
      ["celebrate", 0.45],
    ];

    const total = weighted.reduce((sum, [, w]) => sum + w, 0);
    let roll = Math.random() * total;
    let choice = "wander";
    for (const [action, weight] of weighted) {
      roll -= weight;
      if (roll <= 0) {
        choice = action;
        break;
      }
    }

    if (choice === "work") {
      navigateToSeat(agent, runtime.walkable, Math.random() < 0.18 ? "deepfocus" : "work");
      agent.message = pickMsg(WORK_MSGS, agent.id, WORK_MSGS._default);
      agent.talkingTo = null;
      agent.emotion = null;
      agent.dwellUntil = Date.now() + 1400;
      return;
    }

    if (choice === "talk") {
      const candidates = allAgents.filter((a) => {
        return (
          a.id !== agent.id &&
          !a.talkingTo &&
          !a.replyFrom &&
          a.state !== "walk" &&
          a.state !== "talk" &&
          !runtime.conversationMap.has(a.id)
        );
      });

      if (!candidates.length) {
        navigateToSeat(agent, runtime.walkable, "work");
        agent.message = pickMsg(BANTER_MSGS, agent.id, BANTER_MSGS._default);
        agent.dwellUntil = Date.now() + 1200;
        return;
      }

      const partner = pick(candidates);
      const askText = pickMsg(BANTER_MSGS, agent.id, BANTER_MSGS._default);
      const replyText = pickMsg(BANTER_MSGS, partner.id, BANTER_MSGS._default);
      const styleRoll = Math.random();
      const convStyle = styleRoll < 0.1 ? "argue" : styleRoll < 0.24 ? "gossip" : "wave";

      navigateTo(
        agent,
        partner.tileCol + (agent.tileCol > partner.tileCol ? 1 : -1),
        partner.tileRow,
        runtime.walkable,
        convStyle,
      );
      agent.message = askText;
      agent.talkingTo = partner.id;
      agent.emotion = "happy";
      agent.dwellUntil = Date.now() + 1400;
      runtime.conversationMap.set(agent.id, { text: askText, replyText, phase: 0, timer: 18 });
      return;
    }

    if (choice === "coffee") {
      const coffee = COMMON_AREAS.coffee;
      navigateTo(
        agent,
        coffee.col + Math.floor(rand(-1, 2)),
        coffee.row + Math.floor(rand(0, 2)),
        runtime.walkable,
        "coffee",
      );
      agent.message = pick(COFFEE_MSGS);
      agent.emotion = null;
      agent.dwellUntil = Date.now() + 1100;
      return;
    }

    if (choice === "lounge") {
      const lounge = COMMON_AREAS.lounge;
      navigateTo(
        agent,
        lounge.col + Math.floor(rand(-1, 2)),
        lounge.row + Math.floor(rand(1, 3)),
        runtime.walkable,
        "lounge",
      );
      agent.message = pickMsg(LOUNGE_MSGS, agent.id, LOUNGE_MSGS._default);
      agent.emotion = "happy";
      agent.dwellUntil = Date.now() + 1400;
      return;
    }

    if (choice === "celebrate") {
      agent.state = "celebrate";
      agent.arriveState = "celebrate";
      agent.message = pickMsg(CELEBRATE_MSGS, agent.id, CELEBRATE_MSGS._default);
      agent.emotion = "excited";
      agent.dwellUntil = Date.now() + 900;
      return;
    }

    startWanderCycle(agent);
  }

  function drawRoom(ctx, runtime, time) {
    const W = NATIVE_W;
    const H = NATIVE_H;
    const hour = runtime.currentHour;
    const tod = getTimeOfDay(hour);
    const sky = SKY_COLORS[tod] || SKY_COLORS.day;

    ctx.fillStyle = "#060a14";
    ctx.fillRect(0, 0, W, H);

    for (let row = 0; row < ROOM_ROWS; row++) {
      for (let col = 0; col < ROOM_COLS; col++) {
        const tile = ROOM_MAP[row][col];
        if (tile === TILE.WALL || tile === TILE.BASEBOARD) continue;
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;
        const lounge = tile === TILE.LOUNGE_FLOOR || col >= OFFICE_ZONE_COL;
        ctx.fillStyle = lounge ? "#1e1828" : "#1a1e28";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }

    ctx.lineWidth = 0.5;
    for (let row = 4; row <= ROOM_ROWS; row++) {
      const y = row * TILE_SIZE;
      ctx.strokeStyle = "rgba(0,200,255,0.04)";
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(OFFICE_ZONE_COL * TILE_SIZE, y);
      ctx.stroke();

      ctx.strokeStyle = "rgba(180,100,255,0.06)";
      ctx.beginPath();
      ctx.moveTo(OFFICE_ZONE_COL * TILE_SIZE, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    for (let row = 0; row < ROOM_ROWS; row++) {
      for (let col = 0; col < ROOM_COLS; col++) {
        if (ROOM_MAP[row][col] !== TILE.WALL) continue;
        ctx.fillStyle = col < OFFICE_ZONE_COL ? "#141822" : "#1a1625";
        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    const dividerX = OFFICE_ZONE_COL * TILE_SIZE;
    ctx.fillStyle = "#0a0e16";
    ctx.fillRect(dividerX - 1, 0, 2, H);
    ctx.fillStyle = "rgba(0,200,255,0.15)";
    ctx.fillRect(dividerX - 1, 0, 1, H);
    ctx.fillStyle = "rgba(180,100,255,0.15)";
    ctx.fillRect(dividerX, 0, 1, H);

    const whiteboardX = 1 * TILE_SIZE;
    const whiteboardY = 1 * TILE_SIZE;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(whiteboardX - 2, whiteboardY - 2, 3 * TILE_SIZE + 4, 2 * TILE_SIZE + 4);
    ctx.fillStyle = "#0a1820";
    ctx.fillRect(whiteboardX, whiteboardY, 3 * TILE_SIZE, 2 * TILE_SIZE);

    const windowX = 14 * TILE_SIZE;
    const windowY = 1 * TILE_SIZE;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(windowX - 2, windowY - 2, 4 * TILE_SIZE + 4, 2 * TILE_SIZE + 4);
    ctx.fillStyle = sky;
    ctx.fillRect(windowX, windowY, 4 * TILE_SIZE, 2 * TILE_SIZE);
    if (tod === "night") {
      ctx.fillStyle = "#fff";
      [[6, 5], [22, 10], [38, 7], [12, 18], [30, 4]].forEach(([sx, sy]) => {
        ctx.fillRect(windowX + sx, windowY + sy, 1, 1);
      });
    }

    const clockX = 18 * TILE_SIZE + TILE_SIZE / 2;
    const clockY = 1 * TILE_SIZE + TILE_SIZE / 2;
    ctx.fillStyle = "#0a1218";
    ctx.beginPath();
    ctx.arc(clockX, clockY, 6, 0, Math.PI * 2);
    ctx.fill();

    const hAngle = ((hour % 12) * 30 - 90) * Math.PI / 180;
    const mAngle = (new Date().getMinutes() * 6 - 90) * Math.PI / 180;
    ctx.strokeStyle = "#00c8ff";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + Math.cos(hAngle) * 3, clockY + Math.sin(hAngle) * 3);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0,200,255,0.65)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + Math.cos(mAngle) * 4.5, clockY + Math.sin(mAngle) * 4.5);
    ctx.stroke();

    runtime.workstations.forEach((ws) => {
      const agent = runtime.entities.find((a) => a.id === ws.agentId);
      const isActive = agent && (agent.state === "work" || agent.state === "deepfocus");
      const deskX = ws.deskCols[0] * TILE_SIZE;
      const deskY = ws.deskRows[0] * TILE_SIZE;
      const deskW = ws.deskCols.length * TILE_SIZE;
      const deskH = ws.deskRows.length * TILE_SIZE;

      ctx.fillStyle = "#3a4558";
      ctx.fillRect(deskX, deskY, deskW, deskH);
      ctx.fillStyle = "rgba(0,200,255,0.3)";
      ctx.fillRect(deskX, deskY, deskW, 1);
      ctx.fillStyle = "#2e3848";
      ctx.fillRect(deskX + 3, deskY + deskH, 4, 8);
      ctx.fillRect(deskX + deskW - 7, deskY + deskH, 4, 8);

      const monX = ws.seatCol * TILE_SIZE - 2;
      const monY = (ws.deskRows[0] - 2) * TILE_SIZE;
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(monX - 2, monY, TILE_SIZE + 4, TILE_SIZE * 2);
      ctx.fillStyle = "#0e2838";
      ctx.fillRect(monX, monY + 2, TILE_SIZE, TILE_SIZE * 2 - 4);

      const glowAlpha = isActive ? 0.5 + Math.sin(time * 0.003) * 0.2 : 0.15;
      ctx.fillStyle = hexToRgba(ws.color, glowAlpha);
      ctx.fillRect(monX + 1, monY + 3, TILE_SIZE - 2, TILE_SIZE * 2 - 6);

      const chairX = ws.seatCol * TILE_SIZE;
      const chairY = ws.seatRow * TILE_SIZE;
      ctx.fillStyle = "#303a48";
      ctx.fillRect(chairX + 2, chairY + 2, TILE_SIZE - 4, 8);
      ctx.fillStyle = "#283040";
      ctx.fillRect(chairX + 4, chairY + 8, TILE_SIZE - 8, 6);
    });

    const meetingX = 9 * TILE_SIZE;
    const meetingY = 9 * TILE_SIZE;
    ctx.fillStyle = "#2e3848";
    ctx.fillRect(meetingX, meetingY, 3 * TILE_SIZE, 2 * TILE_SIZE);
    ctx.fillStyle = "#354050";
    ctx.fillRect(meetingX + 2, meetingY + 2, 3 * TILE_SIZE - 4, 2 * TILE_SIZE - 4);

    const sofaX = 31 * TILE_SIZE;
    const sofaY = 2 * TILE_SIZE;
    ctx.fillStyle = "#342850";
    ctx.fillRect(sofaX, sofaY, 3 * TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = "#3e3258";
    ctx.fillRect(sofaX, sofaY + TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE);

    const coffeeX = COMMON_AREAS.coffee.col * TILE_SIZE - TILE_SIZE;
    const coffeeY = COMMON_AREAS.coffee.row * TILE_SIZE - TILE_SIZE / 2;
    ctx.fillStyle = "#303848";
    ctx.fillRect(coffeeX, coffeeY, TILE_SIZE * 3, TILE_SIZE * 2);

    const fridgeX = 31 * TILE_SIZE;
    const fridgeY = 9 * TILE_SIZE;
    ctx.fillStyle = "#354050";
    ctx.fillRect(fridgeX, fridgeY, 2 * TILE_SIZE, 2 * TILE_SIZE);

    const vignette = tod === "night" ? 0.2 : tod === "dawn" || tod === "dusk" || tod === "sunset" ? 0.12 : 0.08;
    const vg = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 350);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, `rgba(0,0,0,${vignette})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  function ensureRuntime() {
    if (window.__balaOfficeRuntime) return window.__balaOfficeRuntime;

    const stage = document.getElementById("virtual-office-stage");
    const wrap = document.getElementById("bo-wrap");
    const frame = document.getElementById("bo-frame");
    const room = document.getElementById("bo-room");
    const canvas = document.getElementById("bo-canvas");
    const overlay = document.getElementById("bo-overlay");
    const lines = document.getElementById("bo-lines");
    const activityList = document.getElementById("virtual-office-activity-list");
    const controlGrid = document.getElementById("bo-control-grid");
    const modeToggle = document.getElementById("bo-mode-toggle");

    if (!stage || !wrap || !frame || !room || !canvas || !overlay || !lines || !activityList || !controlGrid || !modeToggle) {
      return null;
    }

    canvas.width = NATIVE_W;
    canvas.height = NATIVE_H;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const runtime = {
      stage,
      wrap,
      frame,
      room,
      canvas,
      ctx,
      overlay,
      lines,
      activityList,
      controlGrid,
      modeToggle,
      autoMode: true,
      scale: 1,
      currentHour: new Date().getHours(),
      entities: [],
      rawAgents: [],
      workstations: [],
      walkable: buildWalkableGrid(),
      commands: [],
      conversationMap: new Map(),
      bodySprites: {},
      metaById: {},
      providerClassByName: {},
      frameCounter: 0,
      idsSignature: "",
      resizeObserver: null,
      loop: null,
      controlsBound: false,
    };

    function updateScale() {
      const natural = Math.min(1, wrap.clientWidth / DISPLAY_W);
      runtime.scale = Math.max(0.28, natural || 0.28);
      const frameW = DISPLAY_W * runtime.scale;
      const frameH = DISPLAY_H * runtime.scale;
      frame.style.width = `${frameW}px`;
      frame.style.minWidth = `${frameW}px`;
      frame.style.height = `${frameH}px`;
      room.style.width = `${DISPLAY_W}px`;
      room.style.height = `${DISPLAY_H}px`;
      room.style.transform = `scale(${runtime.scale})`;
      room.style.transformOrigin = "top left";
      stage.style.minHeight = `${Math.max(430, frameH + 114)}px`;
      lines.setAttribute("viewBox", `0 0 ${DISPLAY_W} ${DISPLAY_H}`);
      if (wrap.scrollWidth > wrap.clientWidth) {
        wrap.scrollLeft = Math.max(0, (wrap.scrollWidth - wrap.clientWidth) / 2);
      }
    }

    updateScale();

    runtime.resizeObserver = new ResizeObserver(() => updateScale());
    runtime.resizeObserver.observe(wrap);

    const loop = createLoop(
      (gs) => {
        runtime.frameCounter += 1;
        if (runtime.frameCounter % 600 === 0) {
          runtime.currentHour = new Date().getHours();
        }

        runtime.entities.forEach((agent) => {
          if (agent.pathQueue.length > 0) {
            tickMovement(agent, gs.dt);
          }
          tickTypeAnimation(agent, gs.dt);
          tickBehavior(runtime, agent, gs.dt, runtime.entities);
        });

        if (runtime.frameCounter % 2 === 0) {
          renderOverlay(runtime);
        }

        if (runtime.frameCounter % 5 === 0) {
          renderActivity(runtime);
        }
      },
      (gs) => {
        drawRoom(runtime.ctx, runtime, gs.time);
      },
    );

    runtime.loop = loop;
    loop.start();

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && runtime.loop) {
        runtime.loop.resume();
      }
    });

    modeToggle.addEventListener("click", () => {
      runtime.autoMode = !runtime.autoMode;
      modeToggle.textContent = runtime.autoMode ? "Auto" : "Manual";
      modeToggle.style.color = runtime.autoMode ? "#cfe2ff" : "#ffd58a";
      modeToggle.style.borderColor = runtime.autoMode ? "rgba(109, 125, 149, 0.5)" : "rgba(255, 176, 82, 0.5)";
    });

    if (!runtime.controlsBound) {
      controlGrid.addEventListener("click", (event) => {
        const target = event.target.closest("button.bo-action-btn");
        if (!target) return;

        const agentId = target.getAttribute("data-agent-id");
        const action = target.getAttribute("data-action");
        if (!agentId || !action) return;

        const actionCfg = ACTIONS.find((a) => a.action === action);
        let targetAgentId = null;
        if (action === "talk") {
          const candidates = runtime.entities.filter((a) => a.id !== agentId);
          if (candidates.length) {
            targetAgentId = pick(candidates).id;
          }
        }

        runtime.commands.push({
          agentId,
          action,
          message: actionCfg ? actionCfg.message : "Update",
          targetAgentId,
          manual: true,
        });
      });
      runtime.controlsBound = true;
    }

    window.__balaOfficeRuntime = runtime;
    return runtime;
  }

  function renderControls(runtime) {
    const disabled = false;
    runtime.controlGrid.innerHTML = runtime.rawAgents
      .map((agent) => {
        const meta = runtime.metaById[agent.id] || {};
        const dot = meta.color || "#8b949e";
        return `
          <div class="bo-control-row">
            <span class="bo-control-agent"><span class="bo-agent-dot" style="background:${dot}"></span>${esc(agent.name)}</span>
            <span class="bo-action-buttons">
              ${ACTIONS.map((act) => {
                return `<button class="bo-action-btn" type="button" data-agent-id="${esc(agent.id)}" data-action="${esc(act.action)}" ${disabled ? "disabled" : ""}>${act.emoji}</button>`;
              }).join("")}
            </span>
          </div>
        `;
      })
      .join("");
  }

  function renderActivity(runtime) {
    if (!runtime.activityList) return;

    const rows = runtime.rawAgents.map((raw) => {
      const entity = runtime.entities.find((a) => a.id === raw.id);
      const meta = runtime.metaById[raw.id] || {};
      const providerClass = runtime.providerClassByName[raw.providerName] || "";
      const state = entity ? entity.state : "idle";
      const live = raw.stats?.live || 0;
      const total = raw.stats?.total || 0;
      const role = roleLabel(raw);
      const stateLabel = state.charAt(0).toUpperCase() + state.slice(1);

      return `
        <div class="activity-row">
          <span class="activity-dot" style="background:${meta.color || "#8b949e"}"></span>
          <span class="activity-agent">${esc(raw.name)} - <span class="activity-agent-role">${esc(role)}</span></span>
          <span class="activity-provider ${esc(providerClass)}">${esc(raw.providerName || "Unknown")}</span>
          <span class="activity-state">${esc(stateLabel)} • ${live} live • ${total} total</span>
        </div>
      `;
    });

    runtime.activityList.innerHTML = rows.length ? rows.join("") : '<div class="activity-empty">No active events yet</div>';
  }

  function renderOverlay(runtime) {
    if (!runtime.overlay || !runtime.lines) return;

    const monitorHtml = runtime.workstations
      .map((ws) => {
        const agent = runtime.entities.find((a) => a.id === ws.agentId);
        const isActive = agent && (agent.state === "work" || agent.state === "deepfocus");
        const monX = ws.seatCol * TILE_SIZE - 2;
        const monY = (ws.deskRows[0] - 2) * TILE_SIZE;

        return `<div class="bo-monitor-screen ${isActive ? "bo-monitor-active" : "bo-monitor-idle"}" style="left:${monX * SCALE}px;top:${(monY + 2) * SCALE}px;width:${TILE_SIZE * SCALE}px;height:${(TILE_SIZE * 2 - 4) * SCALE}px"></div>`;
      })
      .join("");

    const agentsHtml = [...runtime.entities]
      .sort((a, b) => a.y - b.y)
      .map((agent) => {
        const meta = runtime.metaById[agent.id] || {};
        const isWalking = agent.pathQueue.length > 0;
        const isSitting = ["work", "deepfocus", "slack"].includes(agent.state) && !isWalking;
        const walkFrameIdx = WALK_FRAME_SEQ[agent.walkFrame] || 0;
        const bodyBgPosX = isWalking ? -(walkFrameIdx * 32) : isSitting ? -(agent.typeFrame * 32) : 0;

        const x = Math.round(agent.x * SCALE - 32);
        const y = Math.round((agent.y + agent.sitOffsetY) * SCALE - 32);
        const bobSeed = hashToUnit(agent.id);
        const cls = [`bo-agent`, `bo-${agent.state}`, `bo-dir-${agent.direction}`];
        if (isWalking) cls.push("bo-walk");

        return `
          <div class="${cls.join(" ")}" style="transform:translate(${x}px, ${y}px);z-index:${Math.floor(agent.y)}">
            <div class="bo-bob" style="--bo-bob-delay:${-bobSeed * 3.2}s;--bo-bob-dur:${2.1 + bobSeed * 1.6}s;--bo-bob-amp:${0.8 + bobSeed * 1.4}px;">
              <div class="bo-body" style="background-image:url('${runtime.bodySprites[agent.id] || ""}');background-position-x:${bodyBgPosX}px"></div>
              <div class="bo-head" style="border-color:${meta.color || "#8b949e"}"><div class="bo-head-face">${esc(meta.emoji || "🤖")}</div></div>
              <div class="bo-name" style="background-color:${meta.color || "#8b949e"}">${esc(agent.name)}</div>
              <div class="bo-role">${esc(agent.id === "main" ? "Supervisor" : "Specialist")}</div>
              ${agent.message && agent.state !== "walk" ? `<div class="bo-bubble" title="${esc(agent.message)}">${esc(agent.message)}</div>` : ""}
              ${agent.state === "wave" ? '<div class="bo-wave-hand">👋</div>' : ""}
            </div>
          </div>
        `;
      })
      .join("");

    runtime.overlay.innerHTML = monitorHtml + agentsHtml;

    const linesHtml = runtime.entities
      .filter((a) => a.talkingTo)
      .map((a) => {
        const t = runtime.entities.find((x) => x.id === a.talkingTo);
        if (!t) return "";
        return `<line x1="${Math.round(a.x * SCALE)}" y1="${Math.round((a.y + a.sitOffsetY) * SCALE)}" x2="${Math.round(t.x * SCALE)}" y2="${Math.round((t.y + t.sitOffsetY) * SCALE)}"></line>`;
      })
      .join("");

    runtime.lines.innerHTML = linesHtml;
  }

  function syncAgents(runtime, agents, metaById, providerClassByName) {
    runtime.metaById = metaById || {};
    runtime.providerClassByName = providerClassByName || {};

    const sorted = sortAgents(Array.isArray(agents) ? agents : []);
    runtime.rawAgents = sorted;

    const signature = sorted.map((a) => a.id).join("|");
    if (signature !== runtime.idsSignature) {
      runtime.idsSignature = signature;
      runtime.workstations = buildWorkstations(sorted, runtime.metaById);
      runtime.entities = runtime.workstations.map((ws) => {
        const raw = sorted.find((a) => a.id === ws.agentId) || { id: ws.agentId, name: ws.agentId };
        return createAgentEntity(raw, ws);
      });
      runtime.bodySprites = {};
      runtime.entities.forEach((entity) => {
        runtime.bodySprites[entity.id] = makeBodySprite(entity.color || "#8b949e");
      });
      runtime.conversationMap.clear();
    } else {
      runtime.entities.forEach((entity) => {
        const raw = sorted.find((a) => a.id === entity.id);
        if (!raw) return;
        entity.name = raw.name || entity.name;
        entity.modelShort = raw.modelShort || raw.modelDisplay || entity.modelShort;
        entity.providerName = raw.providerName || entity.providerName;
        entity.stats = raw.stats || entity.stats;
      });
    }

    renderControls(runtime);
    renderActivity(runtime);
    renderOverlay(runtime);
  }

  function render(agents, options) {
    const runtime = ensureRuntime();
    if (!runtime) return;

    const metaById = {};
    const rawMeta = (options && options.meta) || {};
    Object.keys(rawMeta).forEach((id) => {
      metaById[id] = rawMeta[id];
    });

    syncAgents(runtime, agents || [], metaById, (options && options.providerClass) || {});
  }

  function command(cmd) {
    const runtime = ensureRuntime();
    if (!runtime || !cmd || !cmd.agentId || !cmd.action) return false;
    runtime.commands.push({
      agentId: String(cmd.agentId),
      action: String(cmd.action),
      message: cmd.message ? String(cmd.message) : undefined,
      targetAgentId: cmd.targetAgentId ? String(cmd.targetAgentId) : undefined,
      manual: true,
    });
    return true;
  }

  window.BalaOfficeUI = {
    render,
    command,
  };

  window.dispatchBalaOfficeCommand = command;
})();
