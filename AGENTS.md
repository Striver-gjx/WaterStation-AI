# AGENTS

所有 AI Agent 开发前必须阅读本文件。

---

## Architecture

```
Controller → Application Service → Domain Service → Repository → Database
```

禁止：Controller 直接调用 Mapper/Repository

---

## Code Style

### Java (Backend)

- Java 21 + SpringBoot 3
- Lombok + MapStruct
- 禁止 `System.out.println`，必须使用 SLF4J
- 方法注释使用 JavaDoc 格式

### TypeScript (Frontend)

- Vue3 + TypeScript + Element Plus（admin-web 使用 React + Tailwind）
- 严格模式，禁止 `any` 类型
- 组件使用 `<script setup>` 语法

---

## API Convention

统一返回格式：

```java
Result<T> {
    int code;
    String message;
    T data;
}
```

统一异常：`BusinessException`

统一分页：`PageResult<T>`

命名规范：
- DTO：数据传输对象（跨层传递）
- VO：视图对象（返回前端）
- Entity：数据库实体

---

## Data Storage

- 默认数据保存到本地文件系统，按日期文件夹隔离（`data/YYYY-MM-DD/`）
- 预留外部数据库配置项（MySQL、Redis）
- 配置文件：`config/application.yml`

---

## Error Handling

每个模块必须具备：
- 完整的异常捕捉机制
- 统一错误码定义
- 错误日志记录
- 单元测试覆盖异常分支

---

## Commit Convention

```
feat: 新功能
fix: 修复 bug
docs: 文档变更
test: 测试相关
refactor: 重构
chore: 构建/工具变更
```

---

## Module Checklist

开发任何模块前，确认以下清单：

- [ ] 是否有对应的 API 文档（openapi/）
- [ ] 是否有数据库设计（database/）
- [ ] 是否有业务规则说明（docs/02-Business/）
- [ ] 是否编写了单元测试
- [ ] 是否有异常处理
- [ ] 是否更新了 CHANGELOG
