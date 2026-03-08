# Bala Agentic Office

An open-source office dashboard and starter structure for a named OpenClaw agent fleet.

This repo now contains only the Bala Agentic Office slice:
- Bala office dashboard
- agent fleet view
- office activity visualization
- direct instruction box
- sanitized agent workspaces and `SOUL.md` examples

It intentionally excludes the inherited dashboard extras such as session analytics, cost dashboards, scheduled-job panels, and alternate UI surfaces.

## Fleet

- `NTR` — orchestrator and supervisor
- `Narada` — newsletter and intelligence
- `Maya` — video production
- `Chitragupta` — calendar and commitments
- `Sudarshan` — monitoring and alerts
- `Vishvakarma` — app builder
- `Anvesha` — browser research

## Repo Layout

```text
agentic-office/
├── apps/bala-office/          # Bala Agentic Office UI
├── core/                      # Small office-focused API server
├── examples/office/           # Sanitized agent fleet + workspace files
├── lib/server.js              # Compatibility wrapper
├── scripts/                   # Start and stop helpers
└── tests/                     # Minimal config/server tests
```

## Quick Start

```bash
npm install
npm test
npm start
```

Open `http://localhost:3333`

## Environment

- `PORT` default `3333`
- `AGENTIC_OFFICE_NAME` default `Bala Agentic Office`
- `OPENCLAW_CONFIG_PATH` optional explicit OpenClaw config path
- `OPENCLAW_BINARY` optional explicit OpenClaw binary path

If no live OpenClaw config is found, the server falls back to `examples/office/openclaw.example.json`.

## Workspace Shape

Each office workspace follows the same pattern:

```text
workspace-<agent>/
├── SOUL.md
├── AGENTS.md
├── USER.md
├── TOOLS.md
├── HEARTBEAT.md
├── MEMORY.md
└── memory/YYYY-MM-DD.md
```

## API

- `GET /api/health`
- `GET /api/about`
- `GET /api/office-state`
- `POST /api/instruction`

## Notes

- The office visualization is kept intentionally playful, but the API is small and practical.
- The example office files are sanitized. No real tokens, IDs, or private channels are bundled.
