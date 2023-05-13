import {createServer, Server, IncomingMessage, ServerResponse} from "http";

// 简单的 HTTP 服务
const server = createServer((request: IncomingMessage, response: ServerResponse) => {
    response.end("Hello World");
}).listen(3000);
