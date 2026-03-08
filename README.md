# Agentic Office

English | [简体中文](README.zh-CN.md)

An open-source control plane for running a named multi-agent office on top of OpenClaw.

This repo combines:
- a real-time dashboard for sessions, memory, jobs, cost, and vitals
- a sanitized example office layout with named agents, `SOUL.md` files, and workspace structure

The goal is to help you run an office, not just a single assistant.

## What Is Inside

The runtime is organized as a multi-surface workspace:
- `core/` is the backend control plane
- `apps/command-deck/` is the main dashboard
- `apps/mission-room/` is an alternate mission-style interface
- `examples/office/` shows how to structure a named multi-agent office
- `lib/` keeps compatibility wrappers for older commands

## Example Office

The included example office uses these agents:
- `NTR` — orchestrator and supervisor
- `Narada` — newsletter and intelligence
- `Maya` — video production
- `Chitragupta` — calendar and commitments
- `Sudarshan` — monitoring and alerts
- `Vishvakarma` — app builder
- `Anvesha` — browser research

Each agent has its own workspace identity layer built around:
- `SOUL.md`
- `AGENTS.md`
- `USER.md`
- `TOOLS.md`
- `HEARTBEAT.md`
- `MEMORY.md`
- `memory/YYYY-MM-DD.md`

Start with the examples in `examples/office/`.

## Folder Structure

```text
agentic-office/
├── core/                      # Runtime control plane (Node backend)
├── apps/
│   ├── command-deck/          # Main dashboard UI
│   └── mission-room/          # Alternate mission-style surface
├── config/                    # Example/local config files
├── docs/                      # Architecture and usage notes
├── examples/
│   └── office/                # Sanitized multi-agent office template
├── lib/                       # Backward-compatibility wrappers
├── scripts/                   # Start/stop/check helpers
└── tests/                     # Node test suite
```

## Quick Start

```bash
npm ci
cp config/dashboard.example.json config/dashboard.local.json
npm test
npm start
```

Default URL: `http://localhost:3333`

Direct run:

```bash
node core/server.js
```

## Common Commands

```bash
npm start
npm run dev
npm test
npm run lint
./scripts/start.sh
./scripts/stop.sh
```

## Configuration

Key environment variables:
- `PORT` default `3333`
- `OPENCLAW_PROFILE`
- `OPENCLAW_WORKSPACE`
- `DASHBOARD_AUTH_MODE` as `none`, `token`, `tailscale`, `cloudflare`, or `allowlist`
- `DASHBOARD_TOKEN` when auth mode is `token`

Example:

```bash
OPENCLAW_WORKSPACE=~/.openclaw/workspace DASHBOARD_AUTH_MODE=tailscale node core/server.js
```

## API Surface

Primary endpoints:
- `GET /api/health`
- `GET /api/state`
- `GET /api/sessions`
- `GET /api/vitals`
- `GET /api/llm-usage`
- `GET /api/cron`
- `GET /api/events`

## Security

- no personal tokens or channel IDs are bundled in this repository
- local/private files remain excluded via `.gitignore`
- `scripts/checks/no-secrets.sh` is included for basic secret scanning
- `examples/office/openclaw.example.json` is sanitized and env-first

## License

MIT — see [LICENSE](LICENSE).
