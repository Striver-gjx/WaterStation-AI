# 水站管理系统 (WaterStation AI)

> 桶装水配送管理平台 — 支持桌面端、H5 移动端多端部署

一个完整的桶装水配送业务管理系统，涵盖客户管理、订单流水、水票管理、产品库存、配送调度等核心业务模块。

---

## 产品功能

| 模块 | 功能说明 |
|------|----------|
| 运营概览 | 实时销售数据看板、每日趋势图表、客户活跃度统计 |
| 订单管理 | 创建/查看/筛选订单、支付状态追踪、配送状态管理 |
| 水票管理 | 水票套餐销售、水票兑换配送、兑换流水日志 |
| 客户管理 | 客户注册/编辑、等级分类（VIP/黄金/普通）、欠款管理 |
| 产品管理 | 产品目录、库存监控、低库存预警、产品图片管理 |
| 系统设置 | 公司信息配置、配送费/税率设置、数据备份与恢复 |
| 数据导入导出 | 全量数据导出为 JSON、跨平台导入恢复（macOS ↔ Windows） |

---

## 支持的部署模式

| 部署方式 | 适用场景 | 是否需要 Java 环境 |
|----------|----------|-------------------|
| **macOS 桌面应用** (.app) | 日常办公使用 | 否（内置 JRE） |
| **Windows 桌面应用** (.exe) | 日常办公使用 | 否（内置 JRE） |
| **H5 前后端分离** | 多设备访问 / 手机端 | 是（需要 JDK 21） |

---

## 快速开始

### 模式一：H5 前后端部署（开发/多端访问）

#### 环境准备

| 工具 | 版本 | 安装说明 |
|------|------|----------|
| Node.js | 18+ | https://nodejs.org/ |
| JDK | 21 | https://adoptium.net/ |
| Maven | 3.8+ | 项目自带 `mvnw`，无需额外安装 |

#### 启动步骤

```bash
# 1. 启动后端服务
cd backend
./mvnw spring-boot:run
# 后端启动在 http://localhost:8080

# 2. 启动前端（新终端）
cd admin-web
npm install
npm run dev
# 前端启动在 http://localhost:3000
```

#### 手机/局域网访问

前端默认监听 `0.0.0.0:3000`，同一局域网内的设备可通过电脑 IP 访问：

```
http://<电脑局域网IP>:3000
```

查看电脑 IP：
- macOS: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig` 查看 IPv4 地址

---

### 模式二：macOS 桌面应用安装

#### 环境准备（构建机）

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | Electron 构建 |
| JDK | 21 | Backend 编译 + JRE 生成 |
| python3 | 3.9+ | DMG 构建依赖 |
| Xcode Command Line Tools | - | 编译工具链 |

```bash
# 确保 python 命令可用
sudo bash -c 'printf "#!/bin/bash\nexec /usr/bin/python3 \"\$@\"\n" > /usr/local/bin/python && chmod +x /usr/local/bin/python'

# 安装 Xcode 命令行工具
xcode-select --install
```

#### 构建

```bash
cd desktop
bash scripts/build-all.sh mac
```

构建产物：
- `desktop/release/mac-arm64/水站管理系统.app` — 可直接运行
- `desktop/release/水站管理系统-1.0.0-mac.dmg` — DMG 安装包

#### 安装（推荐方式：命令行复制）

> **重要说明**：由于应用未进行 Apple Developer ID 签名，macOS Gatekeeper 会阻止应用启动。此外，企业安全软件（如 CorpLink）可能会干扰 DMG 安装。**推荐使用命令行直接复制**。

```bash
# 移除旧版本
sudo rm -rf /Applications/水站管理系统.app

# 从构建目录直接复制
cp -R /path/to/WaterStation/desktop/release/mac-arm64/水站管理系统.app /Applications/

# 清除隔离属性 + ad-hoc 签名
xattr -cr /Applications/水站管理系统.app
codesign --force --deep --sign - /Applications/水站管理系统.app
```

#### DMG 安装方式（可能受企业安全软件影响）

```bash
# 双击 DMG → 拖拽到 Applications → 然后在终端执行：
xattr -cr /Applications/水站管理系统.app
codesign --force --deep --sign - /Applications/水站管理系统.app
```

> ⚠️ 如果安装后提示"不支持此应用程序"，说明 DMG 挂载路径下的可执行文件被企业安全软件加密。请改用"命令行复制"方式。

---

### 模式三：Windows 桌面应用安装

#### 环境准备（构建机）

构建 Windows 安装包需要在已有 macOS/Linux 构建环境上交叉编译，或在 Windows 上直接构建。

需要额外准备 Windows x64 JRE：
```bash
# 下载 Adoptium JRE 21 (Windows x64) 并解压到：
desktop/extraResources/jre-win-x64/
```

#### 构建

```bash
cd desktop
bash scripts/build-all.sh win
```

构建产物：
- `desktop/release/WaterStation-Setup-1.0.0.exe` — NSIS 安装程序

#### 安装

直接双击运行 `WaterStation-Setup-1.0.0.exe`，按安装向导操作：
- 选择安装路径（默认 `C:\Program Files\WaterStation\`）
- 自动创建桌面快捷方式和开始菜单入口
- 安装完成后首次启动约需 5-10 秒加载后端服务

> Windows SmartScreen 可能提示"未知发布者"，选择"更多信息" → "仍要运行"即可。
> 如果 Windows 防火墙弹出询问（Java 监听端口），请选择"允许"。

---

## 技术架构

```
┌──────────────────────────────────────────────┐
│                 Electron Shell                 │
│  ┌─────────────────┐  ┌──────────────────┐   │
│  │   前端 (React)   │  │  后端 (Spring Boot)│   │
│  │  Tailwind CSS    │  │  H2 Database      │   │
│  │  TypeScript      │  │  MyBatis-Plus     │   │
│  └─────────────────┘  └──────────────────┘   │
│         ↕ HTTP API (/api/v1/*)                │
└──────────────────────────────────────────────┘
```

| 层级 | 技术栈 |
|------|--------|
| 前端 | React 18 + TypeScript + Tailwind CSS + Recharts |
| 后端 | Java 21 + Spring Boot 3.3 + MyBatis-Plus + H2 |
| 桌面壳 | Electron 35 + electron-builder |
| 数据库 | H2 (嵌入式，文件存储) |

---

## 项目结构

```
WaterStation/
├── admin-web/              # 前端管理系统
│   ├── src/
│   │   ├── App.tsx         # 主应用（状态管理 + 业务逻辑）
│   │   ├── types.ts        # 类型定义
│   │   ├── mockData.ts     # 初始演示数据
│   │   ├── components/     # 各业务模块组件
│   │   └── api/            # 后端 API 接口封装
│   └── vite.config.ts      # Vite 配置（含 API 代理）
│
├── backend/                # 后端 API 服务
│   ├── src/main/java/com/waterstation/ai/
│   │   ├── controller/     # REST 控制器
│   │   ├── service/        # 业务服务层
│   │   ├── mapper/         # MyBatis 数据访问
│   │   ├── entity/         # 数据库实体
│   │   ├── dto/            # 数据传输对象
│   │   └── vo/             # 视图对象
│   └── src/main/resources/
│       ├── application.yml # 应用配置
│       ├── schema.sql      # 数据库表结构
│       └── data.sql        # 初始种子数据
│
├── desktop/                # Electron 桌面端
│   ├── src/
│   │   ├── main.ts         # 主进程（窗口管理 + IPC）
│   │   ├── preload.ts      # 预加载脚本（安全桥接）
│   │   └── java-backend.ts # Java 后端生命周期管理
│   ├── scripts/            # 构建脚本
│   └── BUILD.md            # 桌面端构建详细文档
│
├── docs/                   # 项目文档
├── AGENTS.md               # AI Agent 开发规范
└── README.md               # 本文档
```

---

## 数据存储

### 前端数据（H5 模式）

数据存储在浏览器 `localStorage` 中，键前缀 `aquaflow_`：

| 键 | 内容 |
|----|------|
| `aquaflow_customers` | 客户列表 |
| `aquaflow_orders` | 订单列表 |
| `aquaflow_products` | 产品列表 |
| `aquaflow_ticket_packages` | 水票套餐 |
| `aquaflow_redemption_logs` | 兑换记录 |
| `aquaflow_settings` | 系统设置 |

### 后端数据（桌面端 / H5 后端模式）

- **数据库**：H2 文件数据库
- **存储路径**：
  - 开发模式：`./data/waterstation.mv.db`
  - macOS 桌面端：`~/Library/Application Support/waterstation-desktop/data/`
  - Windows 桌面端：`C:\WaterStation\data\`
- **备份目录**：`data/backups/YYYY-MM-DD/` （按日期自动归档）

### 数据导入导出

- **前端**：设置页面 → 数据备份与恢复 → 导出/导入 JSON 文件
- **后端 API**：
  - `GET /api/v1/data/export` — 导出全量数据
  - `POST /api/v1/data/import` — 导入数据
  - `POST /api/v1/data/backup` — 手动备份
  - `GET /api/v1/data/directory` — 查看数据目录信息

导出文件为标准 JSON 格式，支持 macOS ↔ Windows 跨平台导入。

---

## API 接口

后端提供 RESTful API，前缀 `/api/v1/`：

| 模块 | 路径前缀 | 功能 |
|------|----------|------|
| 客户 | `/api/v1/customers` | CRUD + 付款记录 |
| 产品 | `/api/v1/products` | CRUD + 库存调整 |
| 订单 | `/api/v1/orders` | CRUD + 状态/派送 |
| 配送员 | `/api/v1/drivers` | CRUD + 位置更新 |
| 配送 | `/api/v1/deliveries` | 取件/完成配送 |
| 水票 | `/api/v1/tickets` | 套餐销售/兑换/桶管理 |
| 数据 | `/api/v1/data` | 导入/导出/备份 |

统一返回格式：
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

---

## 故障排除

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| macOS "无法打开应用程序" | Gatekeeper 阻止未签名应用 | 执行 `xattr -cr` + `codesign --force --deep --sign -` |
| macOS "不支持此应用程序" | 企业安全软件加密了二进制文件 | 用 `cp -R` 命令行方式安装 |
| H5 "后端服务不可用" | 后端未启动或端口占用 | 确认 `./mvnw spring-boot:run` 已执行且 8080 端口空闲 |
| 前端数据重置 | localStorage 被清除 | 使用"数据导出"功能定期备份 |
| 桌面端数据丢失 | 非正常关闭导致 H2 未刷盘 | 应用正常关闭时会等待后端优雅停止 |
| Windows 安装后打不开 | 缺少 JRE | 确认构建时 `extraResources/jre-win-x64/` 已包含 |

---

## 开发指南

### 本地开发

```bash
# 前端热重载开发
cd admin-web && npm run dev

# 后端开发（带热重载）
cd backend && ./mvnw spring-boot:run

# Electron 开发模式
cd desktop && npm run start
```

### 代码规范

参见 [AGENTS.md](./AGENTS.md)

---

## License

MIT
