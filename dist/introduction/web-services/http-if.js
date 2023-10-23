"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
// 使用 IF 语句来判断请求的 URL
const server = (0, http_1.createServer)((request, response) => {
    if (request.url === "/first") {
        response.end("I am first page.");
    }
    else {
        response.end("I am main page.");
    }
}).listen(3000);
