# Changelog

typespeed 版本演进记录。本文件 2026-09-06 从 git 历史反推建立；git 最早提交 2022-09-18（ch01）。

## 2.6.x

- **2.6.6**：D1.0 长文——新增「把 typespeed 跑进 k8s」章节级教程（`docker/教程.md`，为什么→怎么用→原理→怎么扩展）（2026-09-07）
- **2.6.5**：测试——新增健康检查冒烟测试（`/health`、`/ready` 断言）+ 优雅停机冒烟脚本（`npm run test:shutdown`，SIGTERM → 退出码 0）；`npm test` 63 passing（2026-09-07）
- **2.6.4**：官方部署清单——多阶段 `Dockerfile`（build/run 分离 + 非 root + HEALTHCHECK）；`docker-compose.yml`（app + MySQL/Redis/RabbitMQ，depends_on + healthcheck）；k8s 清单（Deployment 带 readinessProbe→`/ready`、livenessProbe→`/health` + Service + Ingress）；Helm chart（Chart/values/templates）（2026-09-07）
- **2.6.3**：框架内建优雅停机——`ExpressServer` 存储 `httpServer` + 新增 `stop()`（Promise 化 graceful close）；SIGTERM/SIGINT 优雅停机（close 后 exit 0，30s 兜底强制退出），停机时关闭 Redis；socket 模式一并处理（2026-09-07）
- **2.6.2**：框架内建健康检查——新增 `HealthFactory`（abstract `ready()`）+ `HealthDefault`（默认恒就绪）；`ExpressServer` 内建 `GET /health`（liveness）与 `GET /ready`（readiness，读 HealthFactory，200/503），路径可经 config 覆盖（2026-09-07）
- **2.6.1**：Node/TS 升级——TypeScript 4.9 → 5.9.3（legacy 装饰器零改动兼容，标准装饰器双轨同步验证）；`@types/node` 对齐 22；声明 `engines`（node >=18）（2026-09-07）

## 2.5.x

- **2.5.2**：README 重写（专业丰富版：30+ 装饰器分类、书籍体系突出）+ 新增英文版 `README.en.md`（中英切换，默认中文）（2026-09-07）
- **2.5.1**：补全 `default/` 族装饰器双签名（`rabbitListener` / `redisSubscriber` / `SocketIo.onEvent`/`onError`/`onDisconnect`/`onConnected`）；打包瘦身（`files` 白名单 108→31 文件）；`npm pkg fix` 修正 bin 字段；修正 `redisSubscriber` 的 d.ts 签名（2026-09-07）
- **2.5.0**：装饰器双轨——支持 TC39 标准装饰器（Stage 2.7），legacy 装饰器零破坏。单份源码运行时双签名感知（`isStd` 判据），覆盖 core/route/database 三族 + 入口 `app`/`value`；新增方法级 `@bind` 装饰器（route 参数名→来源、database 占位符→索引，替代标准模式删除的参数装饰器）；`@autoware`/`@resource`/`@bean` 支持显式 token（标准模式无 `design:type`）；类型声明宽松化；新增标准模式示例 `introduction/decorator-next/` + `isStd` 单测（2026-09-07）

## 2.4.x

- **2.4.11**：README 四入口、CI 修复（action 升 v4、node 22）、CHANGELOG 建立、getRootPath 兼容 Node22/mocha（2026-09-06）
- **2.4.10**：升级 jsonwebtoken 和 mysql2 库（2024-05-07）
- **2.4.9**：修复 SocketIO、MQ、Redis 等对象获取不准确问题（2024-04-22）
- **2.4.8**：修复 socket.io 未从 bean 工厂获取装饰类的问题；修复 select 返回值不为 null 的问题（2024-04-22）
- **2.4.7**：logx 日志模块（2024-04-21）
- **2.4.6**：修复 redis 实例错误问题（2024-03-17）
- **2.4.5**：版本发布（2023-12-14）
- **2.4.4**：版本发布（2023-12-01）
- **2.4.3**：`@redisSubscriber` 装饰器在无 redis 配置时抛异常；修复生成 dist 目录问题；getRootPath 兼容 Windows（2023-11-15）
- **2.4.2**：修复 database where 条件 AND 匹配超过 2 个时拼装出错的问题（2023-10-23）
- **2.4.1**：补充 introduction 目录的装饰器允许配置（2023-08-04）
- **2.4.0**：socket.io 完成——disconnect / handshake（connected）/ 房间示例 / 全部测试用例（2023-08-04）

## 2.3.x（2023-06 ~ 2023-07）

- **2.3.6**：增加应用目录路径配置（2023-07-06）
- **2.3.5**：增加 redis 订阅模式（需开启两个 redis 实例）；增加 zranking / zrevranking 返回排名与分数的 Map，方便开发排行榜逻辑（2023-06-29）
- **2.3.4**：CI 完善——限制只有 main 分支执行测试、调整测试 node 版本为 16、增加覆盖率 badge；改正 MQ 测试方法（2023-06-28）
- **2.3.3**：修复 jwt 拦截器问题；fixed d.ts
- **2.3.2**：start 增加 callback 参数；修改拦截器逻辑
- **2.3.1**：版本发布
- **2.3.0**：测试体系搭建——首个测试程序、cookie / session 测试、second page 测试（header / 文件上传 / jwt）、数据库读写测试（修正 resultType 问题）、测试程序增加 rabbitmq 配置

## 2.2.x

- **2.2.1**：修改并增加测试逻辑
- **2.2.0**：express 返回 listen 对象方便停止服务；修改 core 获取应用程序 main 地址的方式，使通过其他方式启动的程序也能正常获得应用地址；更新获取应用程序路径方法（第一层引入时检查堆栈）

## 2.1.x

- **2.1.3**：去除无关依赖
- **2.1.2**：升级 consolidate；`@reqParam` / `@reqQuery` 可省略参数直接使用参数名
- **2.1.1**：版本发布
- **2.1.0**：去除实验相关代码，更新引用地址

## 2.0.x

- **2.0.23**：增加 9 个请求方法的注释
- **2.0.22**：完成 9 个请求参数的赋值装饰器；解决路由方法参数个数统计问题（before / after 一并处理）；增加全局权限认证方法，完成全局认证类测试（JWT）
- **2.0.21**：增加 debug 日志打印
- **2.0.20**：增加 README 内容
- **2.0.19**：修正 README 内一个图标失效问题
- **2.0.18**：增加导出内容的注释
- **2.0.17 / 2.0.16**：版本发布
- **2.0.15**：添加 d.ts 文件并去除自动生成的
- **2.0.14**：将 rabbitmq 整合
- **2.0.13**：初始情况 rabbitmq 不监听；解决 async / await 问题；初步完成 mq 装饰器与发送
- **2.0.12**：增加 Rabbit MQ 的测试
- **2.0.11 / 2.0.10 / 2.0.9 / 2.0.8 / 2.0.7**：发布与 package.json 脚本调整
- **2.0.6**：修正 command 命令出错问题；补充装饰器介绍示例代码、访问器装饰器、入门材料
- **2.0.5 / 2.0.4**：版本发布
- **2.0.3**：修正 command 命令出错问题；更新脚手架的模板文件以避免 tsc 编译
- **2.0.2**：增加脚手架（typespeed 命令行）
- **2.0.1**：首个 2.0 发布（调整 npm 发布脚本、统一载入入口）

## 早期原型期（2022-09 起，v2.0 之前）

基于 ch01 / ch02 系列实验提交（`685ee1b` 起）的框架核心能力开发：

- **装饰器体系**：`@start` / `@app` / `@bean` / `@log` / 注入 / 参数注入（autoware / inject 调整）
- **AOP**：before / after 拦截完成
- **Web 路由**：修饰器路由、路由中间件（basicAuth / jwt / upload 先后顺序处理）、404 与 500 错误页面、async / await 支持
- **数据层**：Insert / Update / Delete / Select 完成；SQL 参数注入（`?` 编号绑定）；ResultType 标记查询结果类型；ORM 化（Model 继承：findAll / findOne / create / delete / findCount / update / incr / decr）；分页查询；nodeCache 缓存（新增/修改时按版本号刷新）
- **基础设施**：静态资源、favicon、compression、cookies、session（Redis 存储）、文件上传（multiparty + 路由中间件）、多模版引擎（consolidate）、配置系统（全局配置 + 覆盖）、读写库（主从）接入
- **集成**：Redis 一般使用（避免启动连不上报错）、schedule 定时器、外部载入结构调整（统一载入入口）
