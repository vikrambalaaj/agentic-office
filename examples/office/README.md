# Agentic Office Example

This folder is a sanitized example of a named multi-agent office running on OpenClaw.

It keeps the agent structure and identity model from the working system while removing:
- personal names
- phone numbers
- bot tokens
- API keys
- machine-specific private paths

## Agents

- `NTR` — orchestrator
- `Narada` — newsletter and intelligence
- `Maya` — video production
- `Chitragupta` — calendar and commitments
- `Sudarshan` — monitoring
- `Vishvakarma` — app builder
- `Anvesha` — browser research

## Layout

```text
examples/office/
├── openclaw.example.json
├── workspace-main/
│   ├── SOUL.md
│   ├── AGENTS.md
│   ├── USER.md
│   ├── TOOLS.md
│   ├── HEARTBEAT.md
│   └── MEMORY.md
├── workspace-newsletter/
│   └── SOUL.md
├── workspace-video/
│   └── SOUL.md
├── workspace-calendar/
│   └── SOUL.md
├── workspace-monitor/
│   └── SOUL.md
├── workspace-appbuilder/
│   └── SOUL.md
└── workspace-browser/
    └── SOUL.md
```

Copy these into your own OpenClaw profile and customize them for your environment.
