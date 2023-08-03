import { Server as IoServer } from "socket.io";

const ioObj:IoServer = new IoServer({
    cors: {
      origin: "http://localhost:8081"
    }
  });

class SocketIo extends IoServer {

    constructor() {
        super();
        return ioObj;
    }

    public static onEvent(event: string) {
        console.log("onEvent");
        return (target: any, propertyKey: string) => {
            console.log("onEvent-callback");
            ioObj.on("connection", (socket) => {
                console.log("onEvent-connection")
                socket.on(event, (message) => {
                    console.log("onEvent-socket",event, message)
                    ioObj.emit("test", "test-from-server1");
                    target[propertyKey](socket, message);
                    
                });
            });
            ioObj.listen(8085);
        }
    }



}

export { SocketIo }