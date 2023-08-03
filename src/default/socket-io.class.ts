import { Server as IoServer } from "socket.io";
import { createServer } from "http";
import { bean } from "../core.decorator";

let ioObj: IoServer = null;
const listeners = { "event": [], "disconnect": null, "error": null, "connected": null };

class SocketIo {

    public static server() {
        return ioObj;
    }
    
    public static setIoServer(app, ioSocketConfig) {
        const httpServer = createServer(app);
        ioObj = new IoServer(httpServer, ioSocketConfig);
        ioObj.use((socket, next) => {
            if (listeners["connected"] !== null) {
                listeners["connected"](socket, async (err) => {
                    if (listeners["error"] !== null && err) {
                        await listeners["error"](socket, err);
                    }
                });
            }
            next();
        });
        ioObj.on("connection", (socket) => {
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
                } catch (err) {
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