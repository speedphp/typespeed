"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const mysql2_1 = require("mysql2");
class First {
    page(response) {
        response.end("I am first page.");
    }
}
class User {
    page(response) {
        const database = Database.getInstance();
        const databaseCopy = Database.getInstance();
        console.log("两个对象是否一致：", database === databaseCopy);
        database.query('SELECT * FROM `user`', (err, results) => {
            response.end(JSON.stringify(results));
        });
    }
}
class Root {
    page(response) {
        response.end("I am main page.");
    }
}
class Database {
    constructor(connection) {
        this.connection = connection;
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database((0, mysql2_1.createConnection)({ host: 'localhost', user: 'root', "password": "qwer1234", database: 'test' }));
        }
        return Database.instance;
    }
    query(sql, callback) {
        this.connection.query('SELECT * FROM `user`', callback);
    }
}
const router = new Map();
router.set("/first", new First());
router.set("/main", new Root());
router.set("/user", new User());
const server = (0, http_1.createServer)((request, response) => {
    let page = router.get(request.url === undefined ? "" : request.url);
    if (page === undefined) {
        page = new Root();
    }
    page.page(response);
}).listen(3000);
