# Mission Control Deck — Architecture Overview

## System Shape

Mission Control Deck is split into three layers:

1. `core/` — backend runtime and API layer
2. `apps/command-deck/` — main dashboard frontend
3. `apps/mission-room/` — alternate mission-style UI surface

`lib/` is intentionally kept as a compatibility layer so old integrations can still import/run legacy paths.

## Runtime Flow

- Browser loads static assets from `apps/command-deck/`
- Backend in `core/server.js` serves API + SSE (`/api/events`)
- `core/config.js` resolves workspace/profile and runtime paths
- `core/jobs.js` bridges optional jobs scheduler APIs with graceful fallback

## Key Modules

### Backend (`core/`)

- `server.js`: HTTP server, auth, SSE, API routing, static file serving
- `config.js`: configuration merge (env + file + auto-detection)
- `jobs.js`: jobs endpoint adapter
- `topic-classifier.js`: topic extraction/suggestion utilities
- `linear-sync.js`: optional Linear state sync routines

### Frontend (`apps/command-deck/`)

- `index.html`: primary operations dashboard
- `jobs.html`: jobs-focused dashboard page
- `js/app.js`: orchestration and rendering logic
- `js/sidebar.js`: shared sidebar and live badges
- `css/dashboard.css`: shared styling
- `locales/`: i18n dictionaries

### Alternate Surface (`apps/mission-room/`)

- `index.html`, `app.js`, `style.css`
- designed as a mission control style panel separate from the main dashboard UX

## Directory Map

```text
agentic-office/
├── core/
├── apps/
│   ├── command-deck/
│   └── mission-room/
├── lib/            # compatibility wrappers
├── config/
├── scripts/
├── tests/
└── docs/
```

## Compatibility Contract

- `node lib/server.js` continues to work.
- New canonical entrypoint is `node core/server.js`.
- Existing imports from `lib/*` resolve to the `core/*` implementations.
