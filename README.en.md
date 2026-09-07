<p align="center">
  <h1 align="center">TypeSpeed</h1>
  <p align="center">A decorator-driven TypeScript web framework — build web services declaratively with decorators</p>
</p>

<p align="center">
  <a href="README.md">简体中文</a> · <b>English</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/typespeed"><img src="https://badgen.net/npm/v/typespeed?color=cyan" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/typespeed"><img src="https://badgen.net/npm/dt/typespeed?color=pink" alt="npm downloads"></a>
  <a href="https://github.com/speedphp/typespeed/blob/main/LICENSE"><img src="https://badgen.net/github/license/speedphp/typespeed" alt="license"></a>
  <a href="https://github.com/speedphp/typespeed/actions"><img src="https://img.shields.io/github/actions/workflow/status/speedphp/typespeed/test.yml?label=CI" alt="build"></a>
  <a href="https://badgen.net/badge/icon/TypeScript?icon=typescript&label"><img src="https://badgen.net/badge/icon/TypeScript?icon=typescript&label" alt="TypeScript"></a>
</p>

---

TypeSpeed is a **web framework written in TypeScript**, built on top of [Express](https://expressjs.com/). It organizes your application declaratively through **decorators** — dependency injection, routing, database, caching, authentication, and message queues are all declared with decorators, with zero configuration to start.

> 📖 The companion book **《TypeScript 框架开发实践（微课视频版）》(TypeScript Framework Development in Practice, Tsinghua University Press)** systematically explains the design and implementation of this framework, taking you from zero to building a framework.

---

## ✨ Features

### 🎯 Decorator-Driven
Provides **30+ decorators** covering the full spectrum of web development — object management, web routing, parameter binding, database operations, caching, authentication, message queues, and sockets. One annotation, one feature:

| Category | Decorators | Description |
|---|---|---|
| **Object management** | `@component` `@bean` `@autoware` `@resource` | Component registration & dependency injection |
| **Web routing** | `@getMapping` `@postMapping` `@requestMapping` | REST route declaration |
| **Route parameters** | `@req` `@res` `@next` `@reqBody` `@reqParam` `@reqQuery` `@reqForm` | Request parameter injection |
| **AOP** | `@before` `@after` | Before / after interception |
| **Database** | `@insert` `@update` `@remove` `@select` `@param` `@resultType` `@cache` | Declarative SQL operations |
| **Security / upload** | `@jwt` `@upload` | JWT authentication, file upload |
| **Scheduling / config** | `@schedule` `@value` `@config` | Scheduled tasks, config injection |
| **Messaging / cache** | `@rabbitListener` `@redisSubscriber` | MQ listener, Redis subscriber |
| **Socket.IO** | `@SocketIo.onEvent` `@onConnected` `@onDisconnect` `@onError` | Real-time communication events |
| **Parameter binding** (2.5+) | `@bind` | Method-level parameter binding under standard decorators |

### 🧩 Core Mechanisms
- **Dependency Injection (DI)**: `@autoware` / `@resource` auto-inject instances, `@bean` provides factory methods, with explicit token support (standard decorator mode)
- **AOP**: `@before` / `@after` intercept methods non-invasively
- **Middleware**: pluggable middleware chain + global authentication (`AuthenticationFactory`)
- **Startup scanning**: automatically scans core and application modules, zero-config startup

### 🗄️ Database (two styles)
- **Decorator style**: `@select("SQL")` + `@param` / `@resultType` / `@cache` — declarative SQL execution, result type mapping, automatic caching
- **Model ORM style**: extend `Model` — `findAll` / `find` / `create` / `update` / `delete` / `findCount` / `incr` / `decr` / `pager`, chainable queries, condition building, pagination

### 🔌 Built-in Components
- **Cache**: `NodeCache` (in-memory) + Redis (extensible via `CacheFactory`)
- **Message queue**: RabbitMQ wrapper (`RabbitMQ` / `@rabbitListener`)
- **Redis**: connection management + `@redisSubscriber` + leaderboards (`zranking` / `zrevranking`)
- **Socket.IO**: event decorators + rooms + connection management
- **Session / static / templates / upload**: session (Redis store), static assets, multi template engines (consolidate), file upload

### 🚀 Standard Decorator Dual-Track (2.5+)
Supports both **legacy decorators** (`experimentalDecorators: true`, the book's style) and **TC39 standard decorators** (Stage 2.7, `experimentalDecorators: false`), auto-detected at runtime from a single codebase — legacy code works unchanged.

---

## 📦 Quick Start

**Requirements**: Node.js 16+ (18/20/22 recommended), TypeScript.

```bash
# 1. Install the CLI globally
npm install typespeed -g

# 2. Create a project (zero config)
typespeed new blog
cd blog

# 3. Install dependencies and start
npm install
npm run start
```

---

## 📝 Example

A minimal example combining component, routing, database, and caching:

```typescript
import { component, app, autoware, getMapping, insert, select, resultType, cache, CacheFactory, ServerFactory } from "typespeed";

// Component (service)
@component
class UserService {

    // Dependency injection
    @autoware
    private cacheBean: CacheFactory;

    // Route + parameter injection
    @getMapping("/user/:id")
    async getUser(@reqParam id: number, @res res) {
        res.json({ id, name: "typespeed" });
    }

    // Database: declarative SQL
    @insert("Insert into `user` (id, name) values (#{id}, #{name})")
    async addUser(@param("id") id: number, @param("name") name: string) {}

    // Query + result type mapping + caching
    @cache(1800)
    @select("Select * from `user` where id = #{id}")
    @resultType(UserDto)
    async findUser(@param("id") id: number): Promise<UserDto[]> { return; }
}

// Application entry: @app auto-starts main()
@app
class Main {
    @autoware
    private server: ServerFactory;

    main() {
        this.server.start(8081);
    }
}
```

> See the [`app/`](https://github.com/speedphp/typespeed/tree/main/app) directory and the book's companion source for more complete examples.

---

## 📚 Learning Resources

TypeSpeed is not just a framework — it comes with a complete **"book + video + dual source code" learning system**:

| Resource | Description | Link |
|---|---|---|
| 📖 **Book** | 《TypeScript 框架开发实践（微课视频版）》by 曾振中, Tsinghua University Press | [JD.com](https://item.jd.com/14275373.html) |
| 🎬 **Video course** | Accompanying micro-lecture videos, one source snapshot per lesson | Bundled with the book |
| 📂 **Book source · ts-book** | Organized by chapter (chapter01~chapter06), runnable examples per chapter | [github.com/speedphp/ts-book](https://github.com/speedphp/ts-book) |
| 🏷️ **Video code · ts-practice** | Tagged by book section number (e.g. `4.10.4` = Chapter 4, Section 10, Step 4), one runnable snapshot per lesson | [github.com/speedphp/ts-practice](https://github.com/speedphp/ts-practice) |

> To learn the framework's design and implementation systematically, start with the book + ts-book; to follow along hands-on, use ts-practice.

---

## 🗺️ Roadmap

| Version | Content | Status |
|---|---|---|
| 2.4.x | Documentation revival, CI modernization, all tests green | ✅ Released |
| 2.5.x | **Standard decorator dual-track** (TC39 Stage 2.7) + `@bind` + explicit token | ✅ Released (latest) |
| 2.6.x | Node/TS upgrade + health checks + graceful shutdown + Docker/k8s manifests | 🚧 In progress |

---

## 🤝 Contributing

Issues and pull requests are welcome. Development and testing:

```bash
npm run build   # compile
npm test        # test (requires MySQL / Redis / RabbitMQ)
```

## 📄 License

[MIT](LICENSE) © [speedphp](https://github.com/speedphp)
