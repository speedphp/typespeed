"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.SocketIo = void 0;
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const core_decorator_1 = require("../core.decorator");
const decorator_utils_1 = require("../decorator-utils");
let io = null;
exports.io = io;
const listeners = { "event": [], "disconnect": null, "error": null, "connected": null };
class SocketIo {
    static setIoServer(app, ioSocketConfig) {
        const httpServer = (0, http_1.createServer)(app);
        exports.io = io = new socket_io_1.Server(httpServer, ioSocketConfig);
        io.use(async (socket, next) => {
            if (listeners["connected"] !== null) {
                await (0, core_decorator_1.getComponent)(listeners["connected"].target.constructor)[listeners["connected"].propertyKey](socket, async (err) => {
                    if (listeners["error"] !== null && err) {
                        await (0, core_decorator_1.getComponent)(listeners["error"].target.constructor)[listeners["error"].propertyKey](socket, err);
                    }
                });
            }
            next();
        });
        io.on("connection", async (socket) => {
            if (listeners["disconnect"] !== null) {
                socket.on("disconnect", async (reason) => {
                    await (0, core_decorator_1.getComponent)(listeners["disconnect"].target.constructor)[listeners["disconnect"].propertyKey](socket, reason);
                });
            }
            socket.use(async ([event, ...args], next) => {
                try {
                    for (let listener of listeners["event"]) {
                        if (listener[1] === event) {
                            await (0, core_decorator_1.getComponent)(listener[0].target.constructor)[listener[0].propertyKey](socket, ...args);
                        }
                    }
                }
                catch (err) {
                    next(err);
                }
            });
            if (listeners["error"] !== null) {
                socket.on("error", async (err) => {
                    await (0, core_decorator_1.getComponent)(listeners["error"].target.constructor)[listeners["error"].propertyKey](socket, err);
                });
            }
        });
        return httpServer;
    }
    static onEvent(event) {
        return (...args) => {
            if ((0, decorator_utils_1.isStd)(args)) {
                const [, ctx] = (0, decorator_utils_1.getStdArgs)(args);
                ctx.addInitializer(function () {
                    listeners["event"].push([{
                            target: this,
                            propertyKey: String(ctx.name)
                        }, event]);
                });
                return;
            }
            const target = args[0];
            const propertyKey = args[1];
            listeners["event"].push([{
                    target: target,
                    propertyKey: propertyKey
                }, event]);
        };
    }
    static onError(...args) {
        if ((0, decorator_utils_1.isStd)(args)) {
            const [, ctx] = (0, decorator_utils_1.getStdArgs)(args);
            ctx.addInitializer(function () {
                listeners["error"] = {
                    target: this,
                    propertyKey: String(ctx.name)
                };
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1];
        listeners["error"] = {
            target: target,
            propertyKey: propertyKey
        };
    }
    static onDisconnect(...args) {
        if ((0, decorator_utils_1.isStd)(args)) {
            const [, ctx] = (0, decorator_utils_1.getStdArgs)(args);
            ctx.addInitializer(function () {
                listeners["disconnect"] = {
                    target: this,
                    propertyKey: String(ctx.name)
                };
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1];
        listeners["disconnect"] = {
            target: target,
            propertyKey: propertyKey
        };
    }
    static onConnected(...args) {
        if ((0, decorator_utils_1.isStd)(args)) {
            const [, ctx] = (0, decorator_utils_1.getStdArgs)(args);
            ctx.addInitializer(function () {
                listeners["connected"] = {
                    target: this,
                    propertyKey: String(ctx.name)
                };
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1];
        listeners["connected"] = {
            target: target,
            propertyKey: propertyKey
        };
    }
}
exports.SocketIo = SocketIo;
