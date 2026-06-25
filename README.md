# WaterStation AI

> AI Native 桶装水配送管理平台

一个支持 AI 持续开发的桶装水配送 SaaS 平台，可直接交给 Claude Code、Cursor、ChatGPT、Gemini CLI、Codex 等 AI Agent 持续开发。

---

## 系统组成

| 模块 | 说明 | 技术栈 |
|------|------|--------|
| `admin-web/` | 后台管理系统（产品原型） | React + TypeScript + Tailwind |
| `backend/` | 后端 API 服务 | Java 21 + SpringBoot 3 |
| `miniprogram/` | 微信小程序 | Taro |
| `driver-app/` | 配送员 APP | - |

---

## 快速开始

### 运行管理后台（admin-web）

```bash
cd admin-web
npm install
npm run dev
```

访问 http://localhost:3000

---

## 项目结构

```
WaterStation/
├── AGENTS.md              # AI Agent 开发规范
├── PROJECT_CONTEXT.md     # 项目上下文
├── README.md              # 项目说明
│
├── admin-web/             # 后台管理系统（React 原型）
├── backend/               # 后端 API
├── driver-app/            # 配送员 APP
├── miniprogram/           # 微信小程序
│
├── docs/                  # 文档
│   ├── 01-Product/        # 产品文档
│   ├── 02-Business/       # 业务规则
│   ├── 03-Architecture/   # 架构设计
│   ├── 04-Database/       # 数据库设计
│   ├── 05-API/            # API 文档
│   ├── 06-Frontend/       # 前端规范
│   ├── 07-Backend/        # 后端规范
│   ├── 08-Test/           # 测试文档
│   └── 09-Deployment/     # 部署文档
│
├── ai/                    # AI 开发辅助
│   ├── prompts/           # 提示词模板
│   ├── tasks/             # 开发任务
│   ├── checklist/         # 质量检查清单
│   └── context/           # 上下文信息
│
├── database/              # 数据库脚本
└── openapi/               # OpenAPI 规范
```

---

## 开发流程

```
PRD → Business Rules → Database Design → API Design → Frontend → Backend → Test → Deploy
```

---

## 数据存储

- **默认**：本地文件系统，按日期隔离（`data/YYYY-MM-DD/`）
- **可选**：配置外部 MySQL + Redis

---

## 部署

- Windows：一键安装部署
- macOS：一键安装部署

---

## License

MIT
