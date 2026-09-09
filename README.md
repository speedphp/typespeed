<p align="center">
  <h1 align="center">TypeSpeed</h1>
  <p align="center">一个装饰器驱动的 TypeScript Web 框架 —— 用声明式装饰器，快速构建 Web 服务</p>
</p>

<p align="center">
  <b>简体中文</b> · <a href="README.en.md">English</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/typespeed"><img src="https://badgen.net/npm/v/typespeed?color=cyan" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/typespeed"><img src="https://badgen.net/npm/dt/typespeed?color=pink" alt="npm downloads"></a>
  <a href="https://github.com/speedphp/typespeed/blob/main/LICENSE"><img src="https://badgen.net/github/license/speedphp/typespeed" alt="license"></a>
  <a href="https://github.com/speedphp/typespeed/actions"><img src="https://img.shields.io/github/actions/workflow/status/speedphp/typespeed/test.yml?label=CI" alt="build"></a>
  <a href="https://badgen.net/badge/icon/TypeScript?icon=typescript&label"><img src="https://badgen.net/badge/icon/TypeScript?icon=typescript&label" alt="TypeScript"></a>
</p>

---

TypeSpeed 是一个 **TypeScript 编写的 Web 框架**，底层基于 [Express](https://expressjs.com/)，通过**装饰器**以声明式的方式组织你的应用——依赖注入、路由、数据库、缓存、鉴权、消息队列，全部用装饰器声明，零配置启动。

> 📖 配套图书 **《TypeScript 框架开发实践（微课视频版）》**（曾振中 著，清华大学出版社）系统讲解本框架的设计与实现，从零带你写出一个框架。

---

## ✨ 特性

### 🎯 装饰器驱动
提供 **30+ 个装饰器**，覆盖 Web 开发全流程——对象管理、Web 路由、参数绑定、数据库操作、缓存、鉴权、消息队列、Socket，一个注解搞定一个功能：

| 分类 | 装饰器 | 说明 |
|---|---|---|
| **对象管理** | `@component` `@bean` `@autoware` `@resource` | 组件注册与依赖注入 |
| **Web 路由** | `@getMapping` `@postMapping` `@requestMapping` | REST 路由声明 |
| **路由参数** | `@req` `@res` `@next` `@reqBody` `@reqParam` `@reqQuery` `@reqForm` | 请求参数注入 |
| **切面 AOP** | `@before` `@after` | 前置 / 后置拦截 |
| **数据库** | `@insert` `@update` `@remove` `@select` `@param` `@resultType` `@cache` | SQL 声明式操作 |
| **安全 / 上传** | `@jwt` `@upload` | JWT 鉴权、文件上传 |
| **定时 / 配置** | `@schedule` `@value` `@config` | 定时任务、配置注入 |
| **消息 / 缓存** | `@rabbitListener` `@redisSubscriber` | MQ 监听、Redis 订阅 |
| **Socket.IO** | `@SocketIo.onEvent` `@onConnected` `@onDisconnect` `@onError` | 实时通信事件 |
| **参数绑定**（2.5+） | `@bind` | 标准装饰器下的方法级参数绑定 |

### 🧩 核心机制
- **依赖注入（DI）**：`@autoware` / `@resource` 自动注入实例，`@bean` 提供工厂方法，支持显式 token（标准装饰器模式）
- **AOP 切面**：`@before` / `@after` 无侵入拦截方法
- **中间件**：可插拔中间件链 + 全局认证（`AuthenticationFactory`）
- **启动扫描**：自动扫描核心模块与应用模块，零配置启动

### 🗄️ 数据库（两种风格）
- **装饰器风格**：`@select("SQL")` + `@param` / `@resultType` / `@cache`，SQL 声明式执行、结果类型映射、自动缓存
- **Model ORM 风格**：继承 `Model`，`findAll` / `find` / `create` / `update` / `delete` / `findCount` / `incr` / `decr` / `pager`，链式查询、条件构建、分页

### 🔌 内置组件
- **缓存**：`NodeCache`（内存）+ Redis（`CacheFactory` 可扩展）
- **消息队列**：RabbitMQ 封装（`RabbitMQ` / `@rabbitListener`）
- **Redis**：连接管理 + `@redisSubscriber` 订阅 + 排行榜（`zranking` / `zrevranking`）
- **Socket.IO**：事件装饰器 + 房间 + 连接管理
- **会话 / 静态 / 模板 / 上传**：session（Redis 存储）、静态资源、多模板引擎（consolidate）、文件上传

### 🚀 标准装饰器双轨（2.5+）
同时支持 **legacy 装饰器**（`experimentalDecorators: true`，书中写法）与 **TC39 标准装饰器**（Stage 2.7，`experimentalDecorators: false`），单份源码运行时自动识别，旧代码零改动。

---

## 📦 快速开始

**环境要求**：Node.js 18+（推荐 20/22），TypeScript。

```bash
# 1. 全局安装脚手架
npm install typespeed -g

# 2. 创建项目（零配置）
typespeed new blog
cd blog

# 3. 安装依赖并启动
npm install
npm run start
```

---

## 📝 示例

一个组件 + 路由 + 数据库 + 缓存的最小示例：

```typescript
import { component, app, autoware, getMapping, insert, select, resultType, cache, CacheFactory, ServerFactory } from "typespeed";

// 组件（服务）
@component
class UserService {

    // 依赖注入
    @autoware
    private cacheBean: CacheFactory;

    // 路由 + 参数注入
    @getMapping("/user/:id")
    async getUser(@reqParam id: number, @res res) {
        res.json({ id, name: "typespeed" });
    }

    // 数据库：声明式 SQL
    @insert("Insert into `user` (id, name) values (#{id}, #{name})")
    async addUser(@param("id") id: number, @param("name") name: string) {}

    // 查询 + 结果类型映射 + 缓存
    @cache(1800)
    @select("Select * from `user` where id = #{id}")
    @resultType(UserDto)
    async findUser(@param("id") id: number): Promise<UserDto[]> { return; }
}

// 应用入口：@app 自动启动 main()
@app
class Main {
    @autoware
    private server: ServerFactory;

    main() {
        this.server.start(8081);
    }
}
```

> 更多完整示例见仓库 [`app/`](https://github.com/speedphp/typespeed/tree/main/app) 目录与随书源码。

---

## 📚 学习资料体系

TypeSpeed 不只是一个框架，还配有**完整的「书 + 视频 + 双源码」学习体系**：

| 资料 | 说明 | 链接 |
|---|---|---|
| 📖 **图书** | 《TypeScript 框架开发实践（微课视频版）》曾振中 著，清华大学出版社 | [京东购买](https://item.jd.com/14275373.html) |
| 🎬 **视频课程** | 随书微课视频，每节配套源码 | 随书附带 |
| 📂 **附书源码 ts-book** | 按章组织（chapter01~chapter06），每章可运行示例 | [github.com/speedphp/ts-book](https://github.com/speedphp/ts-book) |
| 🏷️ **视频代码 ts-practice** | 按书籍章节号打 tag（如 `4.10.4` = 第 4 章第 10 节第 4 步），每节对应可跑源码快照 | [github.com/speedphp/ts-practice](https://github.com/speedphp/ts-practice) |

> 想系统学习框架原理与实现，从图书 + ts-book 入手；想跟随视频动手，用 ts-practice。

---

## 🗺️ 版本路线图

| 版本 | 内容 | 状态 |
|---|---|---|
| 2.4.x | 文档复活、CI 现代化、测试全绿 | ✅ 已发布 |
| 2.5.x | **标准装饰器双轨**（TC39 Stage 2.7）+ `@bind` + 显式 token | ✅ 已发布 |
| 2.6.x | Node/TS 升级 + 健康检查 + 优雅停机 + Docker/k8s 部署清单 | ✅ 已发布（latest） |

---

## 🤝 参与贡献

欢迎提交 Issue 与 Pull Request。开发与测试：

```bash
npm run build   # 编译
npm test        # 测试（需 MySQL / Redis / RabbitMQ）
```

## 📄 开源协议

[MIT](LICENSE) © [speedphp](https://github.com/speedphp)
