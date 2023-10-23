"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.SocketIo = void 0;
const socket_io_1 = require("socket.io");
const http_1 = require("http");
let io = null;
exports.io = io;
const listeners = { "event": [], "disconnect": null, "error": null, "connected": null };
class SocketIo {
    static setIoServer(app, ioSocketConfig) {
        const httpServer = (0, http_1.createServer)(app);
        exports.io = io = new socket_io_1.Server(httpServer, ioSocketConfig);
        io.use((socket, next) => {
            if (listeners["connected"] !== null) {
                listeners["connected"](socket, async (err) => {
                    if (listeners["error"] !== null && err) {
                        await listeners["error"](socket, err);
                    }
                });
            }
            next();
        });
        io.on("connection", (socket) => {
            if (listeners["disconnect"] !== null) {
                socket.on("disconnect", async (reason) => {
                    await listeners["disconnect"](socket, reason);
                });
            }
            socket.use(async ([event, ...args], next) => {
                try {
                    for (let listener of listeners["event"]) {
                        if (listener[1] === event) {
                            await listener[0](socket, ...args);
                        }
                    }
                }
                catch (err) {
                    next(err);
                }
            });
            if (listeners["error"] !== null) {
                socket.on("error", async (err) => {
                    await listeners["error"](socket, err);
                });
            }
        });
        return httpServer;
    }
    static onEvent(event) {
        return (target, propertyKey) => {
            listeners["event"].push([target[propertyKey], event]);
        };
    }
    static onError(target, propertyKey) {
        listeners["error"] = target[propertyKey];
    }
    static onDisconnect(target, propertyKey) {
        listeners["disconnect"] = target[propertyKey];
    }
    static onConnected(target, propertyKey) {
        listeners["connected"] = target[propertyKey];
    }
}
exports.SocketIo = SocketIo;
