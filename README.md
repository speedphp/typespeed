# TypeSpeed Framework

[![typescript](https://badgen.net/badge/icon/TypeScript?icon=typescript&label)](https://www.npmjs.com/package/typespeed)
[![npm](https://badgen.net/npm/v/typespeed?color=cyan)](https://www.npmjs.com/package/typespeed)
[![downloads](https://badgen.net/npm/dt/typespeed?color=pink)](https://www.npmjs.com/package/typespeed)
[![license](https://badgen.net/github/license/speedphp/typespeed)](https://github.com/SpeedPHP/typespeed/blob/main/LICENSE)
[![GitHub Build Status](https://img.shields.io/github/actions/workflow/status/speedphp/typespeed/test.yml)](https://github.com/SpeedPHP/typespeed/commits/main)
[![Codecov](https://img.shields.io/codecov/c/github/speedphp/typespeed)
](https://codecov.io/gh/SpeedPHP/typespeed)

### 特点

- 遵循 MIT 许可的开源项目。
- 提供 31 个 TypeScript 装饰器，这些装饰器构成了完整的 Web 框架功能，包括对象管理、Web 路由、数据库操作等。
- 通过命令行脚手架，可以快速创建项目，零配置启动。
- 基于依赖注入、AOP、中间件和启动扫描等编程理念开发实现。
- 底层采用 ExpressJS 实现，提供稳定、快速的 Web 服务。
- 框架提供了两种风格不同却各具优点的数据操作模式。

### 安装

TypeSpeed 环境要求 NodeJS 16+，TypeScript 运行时。

```sh
npm install typespeed -g
```
### 使用

```sh
typespeed new blog

cd ./blog

npm install

npm run test
```

### 开源协议

[MIT](LICENSE) © speedphp