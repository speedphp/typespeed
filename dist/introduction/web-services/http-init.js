"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
// 简单的 HTTP 服务
const server = (0, http_1.createServer)((request, response) => {
    response.end("Hello World");
}).listen(3000);
