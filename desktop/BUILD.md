# 桌面端构建与部署指南

## 环境要求

| 工具 | 版本要求 | 用途 |
|------|----------|------|
| Node.js | 18+ | Electron 构建 |
| Java (JDK) | 21 | Backend 编译、JRE 生成 |
| Maven | 3.8+ | Backend 构建（自带 mvnw） |
| python3 | 3.9+ | DMG 构建工具依赖 |
| Xcode Command Line Tools | - | macOS 编译工具链 |

### macOS 额外准备

```bash
# 确保 python 命令可用（macOS 12.3+ 移除了 python2）
# 如果 `which python` 无输出，执行：
sudo bash -c 'printf "#!/bin/bash\nexec /usr/bin/python3 \"\$@\"\n" > /usr/local/bin/python && chmod +x /usr/local/bin/python'

# 确保 Xcode Command Line Tools 已安装
xcode-select --install
```

---

## 一键构建

```bash
cd desktop
bash scripts/build-all.sh mac    # macOS
bash scripts/build-all.sh win    # Windows
bash scripts/build-all.sh all    # 全平台
```

构建脚本自动执行：
1. Backend JAR 编译
2. Frontend 构建（`--base=./` 确保 file:// 协议下资源路径正确）
3. 最小化 JRE 生成（jlink）
4. Electron 打包 + DMG/安装包生成

输出目录：`desktop/release/`

---

## 构建产物

| 平台 | 产物 | 说明 |
|------|------|------|
| macOS | `release/mac-arm64/水站管理系统.app` | 可直接运行的应用 |
| macOS | `release/水站管理系统-1.0.0-mac.dmg` | DMG 安装包 |
| Windows | `release/水站管理系统 Setup 1.0.0.exe` | NSIS 安装程序 |

---

## macOS 部署（重要！）

### 已知限制

由于应用未进行 Apple Developer ID 签名（`identity: null`），macOS Gatekeeper 会阻止应用启动。此外，企业安全软件（如 CorpLink）可能会加密 DMG volume 中的可执行文件。

### 推荐安装方式（直接复制）

```bash
# 1. 移除旧版本
rm -rf /Applications/水站管理系统.app

# 2. 从构建目录直接复制（不走 DMG 挂载）
cp -R ~/project/diy/ai_product/WaterStation/desktop/release/mac-arm64/水站管理系统.app /Applications/

# 3. 清除隔离属性 + ad-hoc 签名
xattr -cr /Applications/水站管理系统.app
codesign --force --deep --sign - /Applications/水站管理系统.app
```

### DMG 安装方式（可能受安全软件影响）

```bash
# 双击 DMG → 拖拽到 Applications → 然后执行：
xattr -cr /Applications/水站管理系统.app
codesign --force --deep --sign - /Applications/水站管理系统.app
```

> **注意：** 如果企业安全软件（CorpLink 等）拦截了 DMG 挂载路径下的文件操作，导致安装后 app 提示"不支持此应用程序"，请使用"直接复制"方式。

### 更新已安装的应用

macOS 不会自动卸载旧版本，安装新版本前请先删除：

```bash
rm -rf /Applications/水站管理系统.app
```

---

## Windows 部署

直接运行 `水站管理系统 Setup 1.0.0.exe`，NSIS 安装程序会自动处理安装路径和快捷方式。

---

## 数据存储

- 数据库文件位于：`{用户数据目录}/data/waterstation.mv.db`（H2 数据库）
- macOS: `~/Library/Application Support/水站管理系统/data/`
- Windows: `%APPDATA%/水站管理系统/data/`
- 首次启动自动创建种子数据，后续启动不会覆盖用户数据
- 关闭 app 时会等待 backend 优雅关闭（最多 5 秒），确保数据完整保存

---

## 故障排除

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| "无法打开应用程序" | Gatekeeper 阻止 | 执行 `xattr -cr` + `codesign` |
| "不支持此应用程序" | Binary 被安全软件加密 | 用 `cp -R` 方式安装，不走 DMG |
| 启动闪退无提示 | CorpLink 阻止执行 | 将 app 放入 `/Applications/` 目录 |
| 后端启动超时 | JRE 缺失或无权限 | 检查 `Contents/Resources/jre/` 是否完整 |
| DMG 构建失败 "python not found" | 缺少 python 命令 | 创建 python wrapper script |
| DMG 构建失败 "background.tiff" | 背景图文件问题 | 使用 `backgroundColor` 配置替代 |

---

## 开发调试

```bash
cd desktop
npm run start    # 开发模式运行（需要先构建 backend + frontend）
```

如需单独重建前端（不重新打包整个 app）：

```bash
bash scripts/build-frontend.sh
```
