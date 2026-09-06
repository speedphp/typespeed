# TypeSpeed Framework



![typescript](https://badgen.net/badge/icon/TypeScript?icon=typescript\&label)



![npm](https://badgen.net/npm/v/typespeed?color=cyan)



![downloads](https://badgen.net/npm/dt/typespeed?color=pink)



![license](https://badgen.net/github/license/speedphp/typespeed)



![GitHub Build Status](https://img.shields.io/github/actions/workflow/status/speedphp/typespeed/test.yml)



![Codecov](https://img.shields.io/codecov/c/github/speedphp/typespeed)

### 资料体系

TypeSpeed 不只提供一个框架，还配有完整的「书 + 视频 + 双源码」学习资料：



* **书**：《TypeScript 框架开发实践（微课视频版）》（曾振中 著，清华大学出版社）——[京东购买](https://item.jd.com/14275373.html)

* **视频课程**：随书微课视频（每节配套源码快照见 ts-practice）

* **附书源码・ts-book**：[https://github.com/speedphp/ts-book](https://github.com/speedphp/ts-book)—— 按章组织（chapter01 \~ chapter06），每章含可运行示例

* **视频代码・ts-practice**：[https://github.com/speedphp/ts-practice](https://github.com/speedphp/ts-practice)—— 按书籍章节号打 tag（如 `4.10.4` = 第 4 章第 10 节第 4 步），每节视频对应一份可跑源码快照

### 特点



* 遵循 MIT 许可的开源项目。

* 提供 31 个 TypeScript 装饰器，这些装饰器构成了完整的 Web 框架功能，包括对象管理、Web 路由、数据库操作等。

* 通过命令行脚手架，可以快速创建项目，零配置启动。

* 基于依赖注入、AOP、中间件和启动扫描等编程理念开发实现。

* 底层采用 ExpressJS 实现，提供稳定、快速的 Web 服务。

* 框架提供了两种风格不同却各具优点的数据操作模式。

### 安装

TypeSpeed 环境要求 NodeJS 16+，TypeScript 运行时。



```
npm install typespeed -g
```

### 使用



```
typespeed new blog

cd ./blog

npm install

npm run test
```

### 开源协议

[MIT](LICENSE) © speedphp