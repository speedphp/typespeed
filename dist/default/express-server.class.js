"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const express = require("express");
const consolidate = require("consolidate");
const serveFavicon = require("serve-favicon");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const connectRedis = require("connect-redis");
const server_factory_class_1 = require("../factory/server-factory.class");
const route_decorator_1 = require("../route.decorator");
const typespeed_1 = require("../typespeed");
const core_decorator_1 = require("../core.decorator");
const redis_class_1 = require("./redis.class");
const authentication_factory_class_1 = require("../factory/authentication-factory.class");
class ExpressServer extends server_factory_class_1.default {
    getSever() {
        const server = new ExpressServer();
        server.app = express();
        return server;
    }
    setMiddleware(middleware) {
        this.middlewareList.push(middleware);
    }
    start(port, callback) {
        this.app.use(this.authentication.afterCompletion);
        this.middlewareList.forEach(middleware => {
            this.app.use(middleware);
        });
        this.setDefaultMiddleware();
        return this.app.listen(port, callback);
    }
    setDefaultMiddleware() {
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        if (this.view) {
            const viewConfig = this.view;
            this.app.engine(viewConfig["suffix"], consolidate[viewConfig["engine"]]);
            this.app.set('view engine', viewConfig["suffix"]);
            this.app.set('views', process.cwd() + viewConfig["path"]);
        }
        if (this.session) {
            const sessionConfig = this.session;
            if (sessionConfig["trust proxy"] === 1) {
                this.app.set('trust proxy', 1);
            }
            if (this.redisConfig) {
                const RedisStore = connectRedis(expressSession);
                sessionConfig["store"] = new RedisStore({ client: this.redisClient });
            }
            this.app.use(expressSession(sessionConfig));
        }
        if (this.favicon) {
            const faviconPath = process.cwd() + this.favicon;
            this.app.use(serveFavicon(faviconPath));
        }
        if (this.compression) {
            this.app.use(compression(this.compression));
        }
        if (this.cookieConfig) {
            this.app.use(cookieParser(this.cookieConfig["secret"] || undefined, this.cookieConfig["options"] || {}));
        }
        this.app.use(this.authentication.preHandle);
        if (this.static) {
            const staticPath = process.cwd() + this.static;
            this.app.use(express.static(staticPath));
        }
        (0, route_decorator_1.setRouter)(this.app);
        const errorPageDir = __dirname + "/pages";
        this.app.use((req, res) => {
            (0, core_decorator_1.error)("404 not found, for page: " + req.url);
            res.status(404);
            if (req.accepts('html')) {
                res.type('html').send(fs.readFileSync(errorPageDir + "/404.html", "utf-8"));
            }
            else if (req.accepts('json')) {
                res.json({ error: 'Not found' });
            }
            else {
                res.type('txt').send('Not found');
            }
        });
        this.app.use((err, req, res, next) => {
            if (!err) {
                next();
            }
            (0, core_decorator_1.error)(err);
            res.status(err.status || 500);
            if (req.accepts('html')) {
                res.type('html').send(fs.readFileSync(errorPageDir + "/500.html", "utf-8"));
            }
            else if (req.accepts('json')) {
                res.json({ error: 'Internal Server Error' });
            }
            else {
                res.type('txt').send('Internal Server Error');
            }
        });
    }
}
__decorate([
    (0, typespeed_1.value)("view"),
    __metadata("design:type", String)
], ExpressServer.prototype, "view", void 0);
__decorate([
    (0, typespeed_1.value)("static"),
    __metadata("design:type", String)
], ExpressServer.prototype, "static", void 0);
__decorate([
    (0, typespeed_1.value)("favicon"),
    __metadata("design:type", String)
], ExpressServer.prototype, "favicon", void 0);
__decorate([
    (0, typespeed_1.value)("compression"),
    __metadata("design:type", Object)
], ExpressServer.prototype, "compression", void 0);
__decorate([
    (0, typespeed_1.value)("cookie"),
    __metadata("design:type", Object)
], ExpressServer.prototype, "cookieConfig", void 0);
__decorate([
    (0, typespeed_1.value)("session"),
    __metadata("design:type", Object)
], ExpressServer.prototype, "session", void 0);
__decorate([
    (0, typespeed_1.value)("redis"),
    __metadata("design:type", Object)
], ExpressServer.prototype, "redisConfig", void 0);
__decorate([
    core_decorator_1.autoware,
    __metadata("design:type", redis_class_1.default)
], ExpressServer.prototype, "redisClient", void 0);
__decorate([
    core_decorator_1.autoware,
    __metadata("design:type", authentication_factory_class_1.default)
], ExpressServer.prototype, "authentication", void 0);
__decorate([
    core_decorator_1.bean,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", server_factory_class_1.default)
], ExpressServer.prototype, "getSever", null);
exports.default = ExpressServer;
