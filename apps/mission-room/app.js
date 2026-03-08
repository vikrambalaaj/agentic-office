/* ===========================================
   OpenClaw Mission Control — Application Logic
   =========================================== */

// — State —
let currentLogTab = 'stdout';
let statusData = null;
const EXEC_ENDPOINTS = [
  '/__openclaw__/exec',
  'http://127.0.0.1:18789/__openclaw__/exec'
];

// — Clock —
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}
setInterval(updateClock, 1000);
updateClock();

// — Toast Notifications —
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// — Parse Status Output —
function parseStatusOutput(text) {
  const data = {
    version: '', os: '', node: '', config: '', dashboard: '',
    tailscale: '', gateway: '', gatewayPid: '', latency: '',
    update: '', skills: '',
    channels: [],
    agents: [],
    whatsapp: { enabled: false, state: '', number: '', mode: '', allow: '' },
    telegram: { enabled: false, state: '', bot: '', token: '', accounts: '' }
  };

  // Overview table
  const versionMatch = text.match(/│\s*Version\s*│\s*(.+?)\s*│/);
  if (versionMatch) data.version = versionMatch[1].trim();

  const osMatch = text.match(/│\s*OS\s*│\s*(.+?)\s*│/);
  if (osMatch) data.os = osMatch[1].trim();

  const nodeMatch = text.match(/│\s*Node\s*│\s*(.+?)\s*│/);
  if (nodeMatch) data.node = nodeMatch[1].trim();

  const configMatch = text.match(/│\s*Config\s*│\s*(.+?)\s*│/);
  if (configMatch) data.config = configMatch[1].trim();

  const dashMatch = text.match(/│\s*Dashboard\s*│\s*(.+?)\s*│/);
  if (dashMatch) data.dashboard = dashMatch[1].trim();

  const tsMatch = text.match(/│\s*Tailscale\s*│\s*(.+?)\s*│/);
  if (tsMatch) data.tailscale = tsMatch[1].trim();

  const updateMatch = text.match(/│\s*Update\s*│\s*(.+?)\s*│/);
  if (updateMatch) data.update = updateMatch[1].trim();

  const skillsMatch = text.match(/Skills:\s*(.+?)(?:\n|$)/);
  if (skillsMatch) data.skills = skillsMatch[1].trim();

  // Gateway details
  const gwMatch = text.match(/│\s*Gateway\s*│\s*(.+?)\s*│/);
  if (gwMatch) data.gateway = gwMatch[1].trim();

  const gwServiceMatch = text.match(/│\s*Gateway service\s*│\s*(.+?)\s*│/);
  if (gwServiceMatch) {
    const svc = gwServiceMatch[1];
    const pidMatch = svc.match(/pid\s*(\d+)/);
    if (pidMatch) data.gatewayPid = pidMatch[1];
  }

  const latencyMatch = text.match(/reachable\s+(\d+(?:\.\d+)?[sm]s?)/);
  if (latencyMatch) data.latency = latencyMatch[1];

  // Channels table
  const channelRows = text.match(/│\s*(Telegram|WhatsApp)\s*│\s*(ON|OFF)\s*│\s*(\w+)\s*│\s*(.*?)\s*│/g);
  if (channelRows) {
    channelRows.forEach(row => {
      const parts = row.match(/│\s*(Telegram|WhatsApp)\s*│\s*(ON|OFF)\s*│\s*(\w+)\s*│\s*(.*?)\s*│/);
      if (parts) {
        const ch = { name: parts[1], enabled: parts[2] === 'ON', state: parts[3], detail: parts[4].trim() };
        data.channels.push(ch);
        if (parts[1] === 'WhatsApp') {
          data.whatsapp.enabled = ch.enabled;
          data.whatsapp.state = ch.state;
        }
        if (parts[1] === 'Telegram') {
          data.telegram.enabled = ch.enabled;
          data.telegram.state = ch.state;
        }
      }
    });
  }

  // WhatsApp details
  const waNumberMatch = text.match(/linked\s*·\s*(\+[\d]+)/);
  if (waNumberMatch) data.whatsapp.number = waNumberMatch[1];

  const waModeMatch = text.match(/│\s*default\s*│\s*OK\s*│\s*(dm:\w+)/);
  if (waModeMatch) data.whatsapp.mode = waModeMatch[1];

  const waAllowMatch = text.match(/allow:([\+\d,]+)/);
  if (waAllowMatch) data.whatsapp.allow = waAllowMatch[1];

  // Telegram details
  const tgTokenMatch = text.match(/token:config/);
  if (tgTokenMatch) data.telegram.token = '••••••• (config)';

  const tgBotMatch = text.match(/starting provider\s*\((@\w+)\)/);
  if (tgBotMatch) data.telegram.bot = tgBotMatch[1];

  const tgAccountMatch = text.match(/accounts\s*(\d+\/\d+)/);
  if (tgAccountMatch) data.telegram.accounts = tgAccountMatch[1];

  // Agents
  const agentRows = text.match(/│\s*(\w+)\s*│\s*(OK|FAIL|ERROR)\s*│\s*(\d+)\s*│\s*(.+?)\s*│/g);
  if (agentRows) {
    agentRows.forEach((row) => {
      const agentMatch = row.match(/│\s*(\w+)\s*│\s*(OK|FAIL|ERROR)\s*│\s*(\d+)\s*│\s*(.+?)\s*│/);
      if (!agentMatch) return;
    data.agents.push({
      name: agentMatch[1],
      bootstrap: agentMatch[2],
      sessions: parseInt(agentMatch[3]),
      active: agentMatch[4].trim()
    });
    });
  }

  return data;
}

// — Render Dashboard —
function renderStatus(data) {
  statusData = data;

  // Version
  document.getElementById('version').textContent = data.version || '—';

  // Connection badge
  const badge = document.getElementById('conn-badge');
  const connDot = badge.querySelector('.status-dot');
  const connText = document.getElementById('conn-text');
  const isRunning = data.gatewayPid || data.gateway.includes('running');
  badge.className = `connection-badge ${isRunning ? 'connected' : 'disconnected'}`;
  connDot.className = `status-dot ${isRunning ? 'ok' : 'error'}`;
  connText.textContent = isRunning ? 'Connected' : 'Disconnected';

  // Stats
  document.getElementById('gw-status').textContent = isRunning ? 'Running' : 'Stopped';
  document.getElementById('gw-pid').textContent = data.gatewayPid ? `PID ${data.gatewayPid}` : 'PID —';
  document.getElementById('gw-latency').textContent = data.latency || '—';
  document.getElementById('channels-count').textContent = data.channels.length || '0';
  const okChannels = data.channels.filter(c => c.state === 'OK').length;
  document.getElementById('channels-summary').textContent = `${okChannels}/${data.channels.length} active`;
  document.getElementById('agents-count').textContent = data.agents.length || '0';
  const totalSessions = data.agents.reduce((s, a) => s + (a.sessions || 0), 0);
  document.getElementById('agents-summary').textContent = `${totalSessions} session${totalSessions !== 1 ? 's' : ''}`;

  // WhatsApp
  const waDot = document.getElementById('wa-dot');
  const waStatus = document.getElementById('wa-status');
  if (data.whatsapp.state === 'OK') {
    waDot.className = 'status-dot ok';
    waStatus.className = 'channel-status-text ok';
    waStatus.textContent = 'Connected';
  } else {
    waDot.className = 'status-dot error';
    waStatus.className = 'channel-status-text error';
    waStatus.textContent = data.whatsapp.state || 'Offline';
  }
  document.getElementById('wa-number').textContent = data.whatsapp.number || '—';
  document.getElementById('wa-mode').textContent = data.whatsapp.mode || '—';
  document.getElementById('wa-allow').textContent = data.whatsapp.allow || '—';

  // Telegram
  const tgDot = document.getElementById('tg-dot');
  const tgStatus = document.getElementById('tg-status');
  if (data.telegram.state === 'OK') {
    tgDot.className = 'status-dot ok';
    tgStatus.className = 'channel-status-text ok';
    tgStatus.textContent = 'Connected';
  } else {
    tgDot.className = 'status-dot error';
    tgStatus.className = 'channel-status-text error';
    tgStatus.textContent = data.telegram.state || 'Offline';
  }
  document.getElementById('tg-bot').textContent = data.telegram.bot || '—';
  document.getElementById('tg-token').textContent = data.telegram.token || '—';
  document.getElementById('tg-accounts').textContent = data.telegram.accounts || '—';

  // System
  document.getElementById('sys-os').textContent = data.os || '—';
  document.getElementById('sys-node').textContent = data.node || '—';
  document.getElementById('sys-config').textContent = data.config || '—';
  document.getElementById('sys-gateway').textContent = data.gateway || '—';
  document.getElementById('sys-dashboard').textContent = data.dashboard || '—';
  document.getElementById('sys-tailscale').textContent = data.tailscale || '—';
  document.getElementById('sys-skills').textContent = data.skills || '—';
  document.getElementById('sys-update').textContent = data.update || '—';

  // Agents
  const agentsList = document.getElementById('agents-list');
  if (data.agents.length > 0) {
    agentsList.innerHTML = data.agents.map((a) => `
      <div class="agent-row">
        <div class="agent-avatar">${a.name.charAt(0).toUpperCase()}</div>
        <div class="agent-info">
          <div class="agent-name">${escapeHtml(a.name)}</div>
          <div class="agent-meta">Store: ~/.openclaw/agents/${escapeHtml(a.name)}/</div>
        </div>
        <div class="agent-stats">
          <div class="agent-stat"><span class="status-dot ${a.bootstrap === 'OK' ? 'ok' : 'error'}"></span><span>${escapeHtml(a.bootstrap)}</span></div>
          <div class="agent-stat">📋 <span>${a.sessions} sessions</span></div>
          <div class="agent-stat">🕐 <span>${escapeHtml(a.active)}</span></div>
        </div>
      </div>
    `).join('');
  } else {
    agentsList.innerHTML = `
      <div class="agent-row">
        <div class="agent-avatar">?</div>
        <div class="agent-info">
          <div class="agent-name">No agents found</div>
          <div class="agent-meta">Check gateway status output</div>
        </div>
      </div>
    `;
  }
}

// — Parse Logs —
function parseLogLines(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  return lines.map(line => {
    let level = '';
    if (/error|fail|ENOENT/i.test(line)) level = 'level-error';
    else if (/warn|deprecated/i.test(line)) level = 'level-warn';
    else if (/✓|ok|success|ready|listening/i.test(line)) level = 'level-ok';
    else if (/\[.*?\]/.test(line)) level = 'level-info';

    const tsMatch = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z?(\+[\d:]+)?)/);
    const timestamp = tsMatch ? tsMatch[1] : '';
    const content = timestamp ? line.slice(timestamp.length).trim() : line;

    return { timestamp, content, level };
  });
}

function renderLogs(logLines) {
  const container = document.getElementById('log-content');
  if (!logLines.length) {
    container.innerHTML = '<div class="log-line"><span class="timestamp">--</span> No log data available</div>';
    return;
  }
  container.innerHTML = logLines.map(l =>
    `<div class="log-line"><span class="timestamp">${l.timestamp ? l.timestamp + ' ' : ''}</span><span class="${l.level}">${escapeHtml(l.content)}</span></div>`
  ).join('');
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// — API Layer (exec via fetch to a local endpoint or fallback) —
// Since this is a static page, we'll use an embedded fetch approach.
// The gateway at ws://127.0.0.1:18789 provides a status endpoint.

async function execCommand(command) {
  for (const endpoint of EXEC_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      if (response.ok) {
        return await response.text();
      }
    } catch (e) {
      // Try next endpoint variant.
    }
  }
  return null;
}

// — Status Refresh —
// We'll load pre-captured status data or try the gateway API
async function refreshStatus() {
  const btn = document.getElementById('btn-refresh');
  btn.classList.add('loading');
  showToast('Refreshing status…');

  try {
    // Try fetching from gateway's status API
    let result = await execCommand('openclaw status --all');

    if (result) {
      const data = parseStatusOutput(result);
      renderStatus(data);
      showToast('Status refreshed ✓', 'success');
    } else {
      // If API not available, try fetching status.txt (pre-generated)
      try {
        const resp = await fetch('status.txt?t=' + Date.now());
        if (resp.ok) {
          const text = await resp.text();
          renderStatus(parseStatusOutput(text));
          showToast('Loaded cached status.txt', 'success');
        } else {
          throw new Error('No status.txt source');
        }
      } catch {
        showToast('Could not reach gateway. Using demo data.', 'error');
        loadDemoData();
      }
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    btn.classList.remove('loading');
  }
}

// — Log Refresh —
async function refreshLogs() {
  showToast('Refreshing logs…');
  const logFile = currentLogTab === 'stdout'
    ? 'gateway.log'
    : 'gateway.err.log';

  try {
    let result = await execCommand(`tail -60 ~/.openclaw/logs/${logFile}`);
    if (result) {
      renderLogs(parseLogLines(result));
      showToast('Logs refreshed ✓', 'success');
    } else {
      // Try fetching pre-generated log file
      try {
        const resp = await fetch(`logs-${currentLogTab}.txt?t=${Date.now()}`);
        if (resp.ok) {
          const text = await resp.text();
          renderLogs(parseLogLines(text));
          showToast('Loaded cached logs', 'success');
        } else {
          throw new Error('Not available');
        }
      } catch {
        renderLogs([{ timestamp: '', content: `Cannot read ${logFile} — gateway API not accessible from browser.`, level: 'level-warn' },
          { timestamp: '', content: 'Run the status helper to generate data:', level: '' },
          { timestamp: '', content: '  openclaw status --all > clawd/canvas/status.txt', level: 'level-info' },
          { timestamp: '', content: `  tail -60 ~/.openclaw/logs/${logFile} > clawd/canvas/logs-${currentLogTab}.txt`, level: 'level-info' }
        ]);
      }
    }
  } catch (err) {
    showToast('Log refresh failed', 'error');
  }
}

// — Log Tab Switch —
function switchLogTab(tab, el) {
  currentLogTab = tab;
  document.querySelectorAll('.log-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  refreshLogs();
}

// — Quick Actions —
function openDashboard() {
  window.open('http://127.0.0.1:18789/', '_blank');
}

async function restartGateway() {
  showToast('Restarting gateway…');
  const result = await execCommand('openclaw gateway restart');
  if (result) {
    showToast('Gateway restarted ✓', 'success');
    setTimeout(refreshStatus, 3000);
  } else {
    showToast('Run manually: openclaw gateway restart', 'error');
  }
}

async function stopGateway() {
  if (!confirm('Stop the OpenClaw gateway? All channels will disconnect.')) return;
  showToast('Stopping gateway…');
  const result = await execCommand('openclaw gateway stop');
  if (result) {
    showToast('Gateway stopped', 'success');
    setTimeout(refreshStatus, 2000);
  } else {
    showToast('Run manually: openclaw gateway stop', 'error');
  }
}

// — Demo / Fallback Data —
function loadDemoData() {
  const demo = {
    version: '2026.2.17',
    os: 'macos 15.6.1 (arm64)',
    node: '25.5.0',
    config: '~/.openclaw/openclaw.json',
    dashboard: 'http://127.0.0.1:18789/',
    tailscale: 'off',
    gateway: 'local · ws://127.0.0.1:18789',
    gatewayPid: '50394',
    latency: '922ms',
    update: 'pnpm · npm update 2026.2.26',
    skills: '23 eligible · 0 missing',
    channels: [
      { name: 'WhatsApp', enabled: true, state: 'OK', detail: 'linked' },
      { name: 'Telegram', enabled: true, state: 'OK', detail: 'token config' }
    ],
    agents: [
      { name: 'main', bootstrap: 'OK', sessions: 1, active: '9d ago' }
    ],
    whatsapp: { enabled: true, state: 'OK', number: '+15550000000', mode: 'dm:allowlist', allow: '+15550000001,+15550000002' },
    telegram: { enabled: true, state: 'OK', bot: '@example_bot', token: '••••••• (config)', accounts: '1/1' }
  };
  renderStatus(demo);
  renderLogs([
    { timestamp: '2026-02-28T15:59:25', content: '[gateway] listening on ws://127.0.0.1:18789 (PID 50394)', level: 'level-ok' },
    { timestamp: '2026-02-28T15:59:28', content: '[whatsapp] [default] starting provider (+15550000000)', level: 'level-info' },
    { timestamp: '2026-02-28T15:59:29', content: '[telegram] [default] starting provider (@example_bot)', level: 'level-info' },
    { timestamp: '2026-02-28T15:59:31', content: '[whatsapp] Listening for personal WhatsApp inbound messages.', level: 'level-ok' },
    { timestamp: '2026-02-28T15:59:28', content: '[hooks] loaded 4 internal hook handlers', level: 'level-info' },
    { timestamp: '2026-02-28T16:00:34', content: '[ws] ⇄ res ✓ config.get 5704ms', level: 'level-ok' },
    { timestamp: '2026-02-28T16:00:35', content: '[ws] ⇄ res ✓ status 6417ms', level: 'level-ok' },
  ]);
}

// — Auto-load status from status.txt if available —
async function loadFromStatusFile() {
  try {
    const resp = await fetch('status.txt?t=' + Date.now());
    if (resp.ok) {
      const text = await resp.text();
      const data = parseStatusOutput(text);
      renderStatus(data);
      return true;
    }
  } catch {}
  return false;
}

// — Init —
async function init() {
  // Try to load from a pre-generated status file first
  const loaded = await loadFromStatusFile();
  if (!loaded) {
    // Try the gateway API
    const result = await execCommand('openclaw status --all');
    if (result) {
      renderStatus(parseStatusOutput(result));
    } else {
      // Fallback to demo data from last known state
      loadDemoData();
    }
  }
  refreshLogs();
}

init();
