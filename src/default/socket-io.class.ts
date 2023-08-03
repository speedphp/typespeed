import { Server as IoServer } from "socket.io";
import { createServer } from "http";

let ioObj: IoServer = null;
const listeners = { "event": [], "disconnect": null, "error": null, "connected": null };

class SocketIo {

    public static getIoServer(): IoServer {
        return ioObj;
    }

    public static setIoServer(app, ioSocketConfig) {
        const httpServer = createServer(app);
        ioObj = new IoServer(httpServer, ioSocketConfig);
        ioObj.use((socket, next) => {
            if (listeners["connected"] !== null) {
                listeners["connected"](socket, next);
            }
            next();
        });
        ioObj.on("connection", (socket) => {
            if (listeners["disconnect"] !== null) {
                socket.on("disconnect", (reason) => {
                    listeners["disconnect"](socket, reason);
                });
            }
            socket.use(([event, ...args], next) => {
                try {
                    for (let listener of listeners["event"]) {
                        if (listener[1] === event) {
                            listener[0](socket, ...args);
                        }
                    }
                } catch (err) {
                    next(err);
                }
            });

            if (listeners["error"] !== null) {
                socket.on("error", (err) => {
                    listeners["error"](socket, err);
                });
            }
        });

        return httpServer;
    }

    public static onEvent(event: string) {
        return (target: any, propertyKey: string) => {
            listeners["event"].push([target[propertyKey], event]);
        }
    }

    public static onError(target: any, propertyKey: string) {
        listeners["error"] = target[propertyKey];
    }

    public static onDisconnect(target: any, propertyKey: string) {
        listeners["disconnect"] = target[propertyKey];
    }

    public static onConnected(target: any, propertyKey: string) {
        listeners["connected"] = target[propertyKey];
    }
}

export { SocketIo }