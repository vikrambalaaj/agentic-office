(function () {
  "use strict";

  const META = {
    main: { color: "#f4b942", emoji: "👑" },
    newsletter: { color: "#ff7a59", emoji: "📰" },
    video: { color: "#9b6dff", emoji: "🎬" },
    calendar: { color: "#3fa7ff", emoji: "📅" },
    monitor: { color: "#ff5d73", emoji: "🛡️" },
    appbuilder: { color: "#33c27f", emoji: "🛠️" },
    browser: { color: "#22c3ff", emoji: "🔎" },
  };

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setOutput(message, isError) {
    const el = document.getElementById("instruction-output");
    if (!el) return;
    el.textContent = message;
    el.classList.remove("hidden");
    el.style.color = isError ? "#ff9b9b" : "#d9f7e8";
  }

  function renderSummary(state) {
    const summary = document.getElementById("office-summary");
    const meta = document.getElementById("structure-meta");
    const code = document.getElementById("structure-code");

    if (summary) {
      summary.innerHTML = `
        <div class="stat">
          <div class="stat-value">${state.office.fleetCount}</div>
          <div class="stat-label">Fleet Size</div>
        </div>
        <div class="stat">
          <div class="stat-value">${esc(state.office.supervisor)}</div>
          <div class="stat-label">Supervisor</div>
        </div>
        <div class="stat">
          <div class="stat-value">${esc(state.office.configSource)}</div>
          <div class="stat-label">Config Source</div>
        </div>
      `;
    }

    if (meta) {
      meta.innerHTML = `
        <div><strong>Office:</strong> ${esc(state.office.name)}</div>
        <div><strong>Config:</strong> ${esc(state.office.configPath)}</div>
      `;
    }

    if (code) {
      code.textContent = state.office.structureLines.join("\n");
    }
  }

  function renderFleet(agents) {
    const grid = document.getElementById("agents-fleet-grid");
    const count = document.getElementById("agents-fleet-count");
    const select = document.getElementById("instruction-agent");
    if (!grid || !count || !select) return;

    count.textContent = String(agents.length);
    grid.innerHTML = agents
      .map((agent) => {
        const meta = META[agent.id] || { color: "#8b949e", emoji: "🤖" };
        return `
          <article class="agent-card" style="border-color:${meta.color}">
            <div class="agent-card-head">
              <div class="agent-badge" style="background:${meta.color}">${meta.emoji}</div>
              <div>
                <div class="agent-name">${esc(agent.name)}</div>
                <div class="agent-role">${esc(agent.role)}</div>
              </div>
            </div>
            <div class="agent-meta"><strong>ID:</strong> ${esc(agent.id)}</div>
            <div class="agent-meta"><strong>Workspace:</strong> ${esc(agent.workspace)}</div>
            <div class="agent-meta"><strong>Soul:</strong> ${esc(agent.soulPath)}</div>
            <p class="agent-soul">${esc(agent.soulExcerpt || "No soul summary available.")}</p>
          </article>
        `;
      })
      .join("");

    select.innerHTML = agents
      .map((agent) => `<option value="${esc(agent.id)}">${esc(agent.name)} (${esc(agent.id)})</option>`)
      .join("");
  }

  async function sendInstruction() {
    const messageEl = document.getElementById("instruction-message");
    const agentEl = document.getElementById("instruction-agent");
    const thinkingEl = document.getElementById("instruction-thinking");
    const deliverEl = document.getElementById("instruction-deliver");
    const sendBtn = document.getElementById("instruction-send-btn");

    const message = messageEl.value.trim();
    if (!message) {
      setOutput("Instruction message is required.", true);
      return;
    }

    sendBtn.disabled = true;
    setOutput("Running instruction...", false);

    try {
      const response = await fetch("/api/instruction", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          agent: agentEl.value,
          message,
          thinking: thinkingEl.value,
          deliver: deliverEl.checked,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Instruction failed");
      }

      setOutput(payload.output || "Instruction finished with no output.", false);
    } catch (error) {
      setOutput(error.message || "Instruction failed", true);
    } finally {
      sendBtn.disabled = false;
    }
  }

  async function boot() {
    const response = await fetch("/api/office-state");
    const state = await response.json();

    renderSummary(state);
    renderFleet(state.agents || []);

    if (window.BalaFleetUI && typeof window.BalaFleetUI.render === "function") {
      window.BalaFleetUI.render(state.agents || [], { meta: state.meta || META });
    }

    const sendBtn = document.getElementById("instruction-send-btn");
    const messageEl = document.getElementById("instruction-message");
    if (sendBtn) sendBtn.addEventListener("click", sendInstruction);
    if (messageEl) {
      messageEl.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault();
          sendInstruction();
        }
      });
    }
  }

  window.sendInstruction = sendInstruction;
  window.addEventListener("DOMContentLoaded", () => {
    boot().catch((error) => {
      setOutput(error.message || "Failed to load office state.", true);
    });
  });
})();
