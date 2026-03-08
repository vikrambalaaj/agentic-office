---
name: agentic-office
version: 1.2.0
description: Agentic office dashboard for OpenClaw - monitor a named multi-agent office, inspect sessions and jobs, and start from a sanitized office template.
metadata:
  openclaw:
    requires:
      node: ">=18"
    install:
      - id: start
        kind: shell
        command: "node core/server.js"
        label: "Start Mission Control Deck (http://localhost:3333)"
---

# Agentic Office

Agentic office dashboard and starter structure for a named AI workforce.

## Quick Start

```bash
npx clawhub@latest install agentic-office
cd skills/agentic-office
node core/server.js
```

Dashboard runs at **http://localhost:3333**

## Features

- **Session Monitoring** — Real-time view of all AI sessions with live updates
- **LLM Fuel Gauges** — Track Claude, Codex, and other model usage
- **System Vitals** — CPU, Memory, Disk, Temperature
- **Cron Jobs** — View and manage scheduled tasks
- **Cerebro Topics** — Automatic conversation organization
- **Cost Tracking** — Per-session costs, projections, savings estimates
- **Privacy Controls** — Hide sensitive topics for demos

## Configuration

The dashboard auto-detects your OpenClaw workspace. Set `OPENCLAW_WORKSPACE` to override.

### Authentication

| Mode         | Use Case          |
| ------------ | ----------------- |
| `none`       | Local development |
| `token`      | Remote access     |
| `tailscale`  | Team VPN          |
| `cloudflare` | Public deployment |

```bash
DASHBOARD_AUTH_MODE=tailscale node core/server.js
```

## API

| Endpoint          | Description                  |
| ----------------- | ---------------------------- |
| `GET /api/state`  | All dashboard data (unified) |
| `GET /api/events` | SSE stream for live updates  |
| `GET /api/health` | Health check                 |

## Links

- [GitHub](https://github.com/vikrambalaaj/agentic-office)
- [Documentation](https://github.com/vikrambalaaj/agentic-office#readme)
