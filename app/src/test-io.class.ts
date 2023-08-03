import { SocketIo, getMapping,value, component, autoware } from "../../src/typespeed";

@component
export default class TestIo {

    @value("view")
    public view: string;

    @SocketIo.onHandshake
    public handshake(socket, next) {
        console.log("handshake");
        console.log(socket.handshake.auth);
        next();
    }

    @SocketIo.onDisconnect
    public disconnet(socket, reason) {
        console.log(reason);
    }

    @SocketIo.onError
    public error(socket, err) {
        console.log(err.message);
    }

    @SocketIo.onEvent("test1") 
    public test1(socket, message) {
        console.log(message);
        console.log(SocketIo.getIoServer().sockets.emit("all", "test-from-server-all"));
        socket.emit("test1", "test-from-server-1");
    }

    @SocketIo.onEvent("test2") 
    public test2(socket, message) {
        console.log(message);
        console.log(SocketIo.getIoServer().sockets.emit("all", "test-from-server-all"));
        socket.emit("test2", "test-from-server-2");
    }

    @SocketIo.onEvent("test-error") 
    public testError(socket, message) {
        throw new Error("test-error");
    }

    @getMapping("/socketIo")
    public socketIoPage(req, res) {
        res.render("socket");
    }
}