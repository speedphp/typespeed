import { Server as IoServer } from "socket.io";
import { createServer } from "http";
import { getComponent } from "../core.decorator";

let io: IoServer = null;
const listeners = { "event": [], "disconnect": null, "error": null, "connected": null };

class SocketIo {

    public static setIoServer(app, ioSocketConfig) {
        const httpServer = createServer(app);
        io = new IoServer(httpServer, ioSocketConfig);
        io.use(async (socket, next) => {
            if (listeners["connected"] !== null) {
                await getComponent(listeners["connected"].target.constructor)[listeners["connected"].propertyKey](socket, async (err) => {
                    if (listeners["error"] !== null && err) {
                        await getComponent(listeners["error"].target.constructor)[listeners["error"].propertyKey](socket, err);
                    }
                });
            }
            next();
        });
        io.on("connection", async (socket) => {
            if (listeners["disconnect"] !== null) {
                socket.on("disconnect", async (reason) => {
                    await getComponent(listeners["disconnect"].target.constructor)[listeners["disconnect"].propertyKey](socket, reason);
                });
            }
            socket.use(async ([event, ...args], next) => {
                try {
                    for (let listener of listeners["event"]) {
                        if (listener[1] === event) {
                            await getComponent(listener[0].target.constructor)[listener[0].propertyKey](socket, ...args);
                        }
                    }
                } catch (err) {
                    next(err);
                }
            });

            if (listeners["error"] !== null) {
                socket.on("error", async (err) => {
                    await getComponent(listeners["error"].target.constructor)[listeners["error"].propertyKey](socket, err);
                });
            }
        });
        return httpServer;
    }

    public static onEvent(event: string) {
        return (target: any, propertyKey: string) => {
            listeners["event"].push([{
                target: target,
                propertyKey: propertyKey
            }, event]);
        }
    }

    public static onError(target: any, propertyKey: string) {
        listeners["error"] = {
            target: target,
            propertyKey: propertyKey
        };
    }

    public static onDisconnect(target: any, propertyKey: string) {
        listeners["disconnect"] = {
            target: target,
            propertyKey: propertyKey
        };
    }

    public static onConnected(target: any, propertyKey: string) {
        listeners["connected"] = {
            target: target,
            propertyKey: propertyKey
        };
    }
}

export { SocketIo, io }