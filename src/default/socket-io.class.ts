import { Server as IoServer } from "socket.io";
import { createServer } from "http";

let ioObj: IoServer = null;
const listeners = { "event": [], "disconnect": null, "error": null, "recovered": null, "handshake": null };

class SocketIo{

    public static getIoServer(): IoServer {
        return ioObj;
    }

    public static setIoServer(app, ioSocketConfig) {
        const httpServer = createServer(app);
        ioObj = new IoServer(httpServer, ioSocketConfig);
        ioObj.on("connection", (socket) => {
            if (listeners["disconnect"] !== null) {
                socket.on("disconnect", (reason) => {
                    listeners["disconnect"](socket, reason);
                });
            }

            if (listeners["handshake"] !== null) {
                socket.use(([event, ...args], next) => {
                    listeners["handshake"](socket, next);
                });
            }

            for (let listener of listeners["event"]) {
                socket.on(listener[1], (...args) => {
                    listener[0](socket, ...args);
                });
            }

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

    public static onHandshake(target: any, propertyKey: string) {
        listeners["handshake"] = target[propertyKey];
    }

    public static onError(target: any, propertyKey: string) {
        listeners["error"] = target[propertyKey];
    }

    public static onDisconnect(target: any, propertyKey: string) {
        listeners["disconnect"] = target[propertyKey];
    }
}

export { SocketIo }