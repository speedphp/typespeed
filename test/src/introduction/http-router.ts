import { createServer, Server, IncomingMessage, ServerResponse } from "http";

interface Page {
    page(response: ServerResponse): void;
}

class First implements Page {
    page(response: ServerResponse): void {
        response.end("I am first page.");
    }
}

class Root implements Page {
    page(response: ServerResponse): void {
        response.end("I am main page.");
    }
}

const router = new Map<string, Page>();
router.set("/first", new First());
router.set("/main", new Root());
const server = createServer((request: IncomingMessage, response: ServerResponse) => {
    let page = router.get(request.url === undefined ? "" : request.url);
    if (page === undefined) {
        page = new Root();
    }
    page.page(response);
}).listen(3000);
