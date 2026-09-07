import * as fs from "fs";
import * as express from "express";
import * as consolidate from "consolidate";
import * as serveFavicon from "serve-favicon";
import * as compression from "compression";
import * as cookieParser from "cookie-parser";
import * as expressSession from "express-session";
import * as connectRedis from "connect-redis";
import ServerFactory from "../factory/server-factory.class";
import { setRouter } from "../route.decorator";
import { SocketIo } from "../default/socket-io.class";
import { value, config } from "../typespeed";
import { bean, error, autoware, resource, getBean, log } from "../core.decorator";
import HealthFactory from "../factory/health-factory.class";
import { Redis } from "./redis.class";
import AuthenticationFactory from "../factory/authentication-factory.class";

export default class ExpressServer extends ServerFactory {

    @value("view")
    public view: string;

    @value("static")
    private static: string;

    @value("favicon")
    private favicon: string;

    @value("compression")
    private compression: object;

    @value("cookie")
    private cookieConfig: object;

    @value("session")
    private session: object;

    @value("redis")
    private redisConfig: object;

    @value("socket")
    private socketIoConfig: object;

    @value("MAIN_PATH")
    private mainPath: string;

    @autoware
    private redisClient: Redis;

    @autoware
    public authentication: AuthenticationFactory;

    @bean
    public getSever(): ServerFactory {
        const server = new ExpressServer();
        server.app = express();
        return server;
    }

    public setMiddleware(middleware: any) {
        this.middlewareList.push(middleware);
    }

    public httpServer: any = null;

    public start(port: number): any {
        this.middlewareList.forEach(middleware => {
            this.app.use(middleware);
        });

        this.setDefaultMiddleware();
        let server;
        if(this.socketIoConfig) {
            const newSocketApp = SocketIo.setIoServer(this.app, this.socketIoConfig);
            server = newSocketApp.listen(port);
        }else{
            server = this.app.listen(port);
        }
        this.httpServer = server;
        this.registerGracefulShutdown();
        return server;
    }

    public stop(): Promise<void> {
        return new Promise((resolve) => {
            if (this.httpServer) {
                this.httpServer.close(() => resolve());
            } else {
                resolve();
            }
        });
    }

    private registerGracefulShutdown() {
        const shutdown = (signal: string) => {
            log(`received ${signal}, gracefully shutting down...`);
            // 30 秒兜底强制退出，防止连接迟迟不关闭
            const forceExit = setTimeout(() => {
                log("forced shutdown after timeout");
                process.exit(1);
            }, 30000);
            forceExit.unref();
            Redis.close().catch(() => {});
            this.httpServer.close(() => {
                clearTimeout(forceExit);
                log("server closed");
                process.exit(0);
            });
        };
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    }

    private setDefaultMiddleware() {
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        if (this.view) {
            const viewConfig = this.view;
            this.app.engine(viewConfig["suffix"], consolidate[viewConfig["engine"]]);
            this.app.set('view engine', viewConfig["suffix"]);
            this.app.set('views', this.mainPath + viewConfig["path"]);
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
            const faviconPath = this.mainPath + this.favicon;
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
            const staticPath = this.mainPath + this.static;
            this.app.use(express.static(staticPath))
        }
        setRouter(this.app);
        this.app.use(this.authentication.afterCompletion);
        
        // 健康检查（k8s liveness / readiness 探针）
        const healthConfig = config("health") || {};
        const livenessPath = healthConfig["liveness"] || "/health";
        const readinessPath = healthConfig["readiness"] || "/ready";
        this.app.get(livenessPath, (req, res) => {
            res.status(200).json({ status: "up" });
        });
        this.app.get(readinessPath, (req, res) => {
            let ready = true;
            try {
                ready = getBean(HealthFactory).ready();
            } catch (e) {
                ready = false;
            }
            res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not-ready" });
        });

        const errorPageDir = __dirname + "/pages";
        this.app.use((req, res) => {
            error("404 not found, for page: " + req.url);
            res.status(404);
            if (req.accepts('html')) {
                res.type('html').send(fs.readFileSync(errorPageDir + "/404.html", "utf-8"));
            } else if (req.accepts('json')) {
                res.json({ error: 'Not found' });
            } else {
                res.type('txt').send('Not found');
            }
        });

        this.app.use((err, req, res, next) => {
            if (!err) {
                next();
            }
            error(err);
            res.status(err.status || 500);
            if (req.accepts('html')) {
                res.type('html').send(fs.readFileSync(errorPageDir + "/500.html", "utf-8"));
            } else if (req.accepts('json')) {
                res.json({ error: 'Internal Server Error' });
            } else {
                res.type('txt').send('Internal Server Error');
            }
        });
    }
}
