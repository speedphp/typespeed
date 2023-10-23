"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
class First {
    page(response) {
        response.end("I am first page.");
    }
}
class Root {
    page(response) {
        response.end("I am main page.");
    }
}
const router = new Map();
router.set("/first", new First());
router.set("/main", new Root());
const server = (0, http_1.createServer)((request, response) => {
    let page = router.get(request.url === undefined ? "" : request.url);
    if (page === undefined) {
        page = new Root();
    }
    page.page(response);
}).listen(3000);
