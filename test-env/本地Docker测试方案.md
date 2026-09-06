# 本地 Docker 测试方案

typespeed 测试依赖三个外部服务（MySQL / Redis / RabbitMQ），本机没有常驻服务时用 Docker 起一套与 CI 一致的环境来跑测试。

## 一、前置条件

- 本机已安装 **OrbStack**（或 Docker Desktop），Docker CLI 可用：`docker --version`
- 若 OrbStack 未运行，先启动它（菜单栏点开即可，或 `open -a OrbStack`）
- 端口占用：默认映射 `3306 / 6379 / 5672`，起容器前确认空闲（`nc -z localhost 3306` 等）

## 二、一键启动测试依赖

```bash
cd /Users/zzz/book/typespeed
docker compose -f test-env/docker-compose.test.yml up -d
```

启动三个容器：

| 服务 | 容器名 | 端口 | 账号 |
|------|--------|------|------|
| MySQL 8.0 | typespeed-test-mysql | 127.0.0.1:3306 | root / root，库 `test` |
| Redis 7 | typespeed-test-redis | 127.0.0.1:6379 | 无 |
| RabbitMQ 3.8 | typespeed-test-rabbitmq | 127.0.0.1:5672 | guest / guest |

MySQL 首次启动会自动执行 `test-env/mysql-init/init.sql`（建 `test` 库 + `user` 表，与 CI 的 Setup MySQL 步骤一致）。

检查就绪状态：

```bash
docker compose -f test-env/docker-compose.test.yml ps          # 三容器 Up 且 mysql 为 healthy
docker exec typespeed-test-mysql mysql -uroot -proot -e "USE test; SHOW TABLES;"
docker exec typespeed-test-redis redis-cli ping        # PONG
docker exec typespeed-test-rabbitmq rabbitmq-diagnostics -q ping   # Ping succeeded
```

## 三、跑测试

```bash
npm test
```

预期：`51 passing`。

> 说明：`package.json` 的 test 脚本已加 `NODE_OPTIONS=--no-experimental-strip-types`，这是 Node 22 下 mocha 加载 CJS 风格 .ts 测试的必需项（否则报 `require is not defined`）。

## 四、收尾

```bash
docker compose -f test-env/docker-compose.test.yml down        # 停容器（保留数据卷需加 -v）
```

## 五、本次排障记录（2026-09-06）

本地 `npm test` 曾长期 0 passing / 47 failing，所有请求返回 404 错误页（`src/default/pages/404.html`，即 MIT License 模板页）。曾误判为"缺本地服务"（环境差异），用 Docker 起齐服务后依然全挂，最终定位为**框架根因**：

1. `src/typespeed.ts` 的 `getRootPath()` 靠匹配调用栈推断应用根目录（`mainPath`），原匹配写死旧版 Node 栈帧格式 `at Function.Module._load` 和 `at Object.<anonymous>`：
   - Node 22 的帧是 `at Function._load`（少了 `Module.`）；
   - mocha 下 hooks 的帧是 `at Context.<anonymous>`（不是 `Object.`），且 `Function._load` 与 `Module.require` 之间会插入 `wrapModuleLoad` 帧。
   - 匹配全部落空 → `mainPath` 回退成 mocha 的 bin 目录 → config 不加载、app/src 下组件不加载、路由不注册 → 一切请求 404。
2. 修复：`getRootPath` 改为**按顺序出现匹配**（不要求帧严格相邻），帧格式用正则兼容新旧 Node 与 mocha。改动见 `src/typespeed.ts`（未提交）。
3. 修复后本地 `npm test` 全绿 **51 passing (3s)**。
4. 连带影响：CI 若从 node 16 升到 node 22（见 0.4 改动），旧的栈匹配同样会失效——本修复对 CI 也是必需的。

## 六、附：docker-compose.test.yml 内容要点

- 服务定义与 CI（`.github/workflows/test.yml`）的 services 保持一致：mysql root/root + `test` 库、redis、rabbitmq guest/guest。
- MySQL 加了 healthcheck，避免测试启动时库还没就绪。
- 初始化 SQL 挂在 `test-env/mysql-init/init.sql`，与 CI 建表语句一致。
