import { createServer, Server, IncomingMessage, ServerResponse } from "http";
import { createConnection, Connection } from "mysql2";

interface Page {
    page(response: ServerResponse): void;
}

class First implements Page {
    page(response: ServerResponse): void {
        response.end("I am first page.");
    }
}

class User implements Page {
    page(response: ServerResponse): void {
        const database: Database = Database.getInstance();
        const databaseCopy: Database = Database.getInstance();
        console.log("两个对象是否一致：", database === databaseCopy)
        database.query('SELECT * FROM `user`', (err, results) => {
            response.end(JSON.stringify(results));
        });
    }
}

class Root implements Page {
    page(response: ServerResponse): void {
        response.end("I am main page.");
    }
}

class Database {
    private static instance: Database;
    private connection: Connection;
    private constructor(connection: Connection) {
        this.connection = connection;
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database(createConnection({ host: 'localhost', user: 'root', "password": "qwer1234", database: 'test' }));
        }
        return Database.instance;
    }
    query(sql: string, callback: (err: any, results: any) => void): void {
        this.connection.query('SELECT * FROM `user`', callback);
    }
}


const router = new Map<string, Page>();
router.set("/first", new First());
router.set("/main", new Root());
router.set("/user", new User());
const server = createServer((request: IncomingMessage, response: ServerResponse) => {
    let page = router.get(request.url === undefined ? "" : request.url);
    if (page === undefined) {
        page = new Root();
    }
    page.page(response);
}).listen(3000);
