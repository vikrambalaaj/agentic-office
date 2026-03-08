# Agentic Office

[English](README.md) | 简体中文

这是一个面向 OpenClaw 的多智能体办公室控制平面（开源清理版）。

核心目标：
- 统一查看会话、成本、系统指标、任务与记忆
- 支持 Profile 感知的运行模式
- 默认不包含私有数据与敏感密钥

## 目录结构（全新）

```text
agentic-office/
├── core/                      # 后端控制平面（Node）
├── apps/
│   ├── command-deck/          # 主看板前端（由 core/server.js 提供）
│   └── mission-room/          # 任务室风格的独立 UI
├── lib/                       # 兼容层（旧路径包装）
├── config/                    # 配置样例与本地配置
├── scripts/                   # 启停、检查、发布脚本
├── docs/                      # 截图与架构文档
└── tests/                     # 测试
```

## 快速开始

```bash
npm ci
npm test
npm start
```

默认地址：`http://localhost:3333`

也可以直接运行：

```bash
node core/server.js
```

## 兼容旧命令

仓库保留了 `lib/*` 兼容包装，所以老脚本仍可运行：

```bash
node lib/server.js
```

## 常用命令

```bash
npm start
npm run dev
npm test
npm run lint
./scripts/start.sh
./scripts/stop.sh
```

## 主要配置项

- `PORT`（默认 `3333`）
- `OPENCLAW_PROFILE`
- `OPENCLAW_WORKSPACE`
- `DASHBOARD_AUTH_MODE`（`none` / `token` / `tailscale` / `cloudflare` / `allowlist`）
- `DASHBOARD_TOKEN`（当 `token` 模式时必填）

示例：

```bash
DASHBOARD_AUTH_MODE=tailscale node core/server.js
```

## 主要 API

- `GET /api/health`
- `GET /api/state`
- `GET /api/sessions`
- `GET /api/vitals`
- `GET /api/llm-usage`
- `GET /api/cron`
- `GET /api/events`（SSE）

## 安全与开源清理

- 本地优先运行，不强制外部遥测
- `scripts/checks/no-secrets.sh`：密钥扫描
- `scripts/checks/no-user-data.sh`：阻止提交用户私有数据
- `.gitignore` 已排除本地配置、日志和运行时文件

## 许可证

MIT，见 [LICENSE](LICENSE)。
