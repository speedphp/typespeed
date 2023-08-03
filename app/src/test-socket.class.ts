import { SocketIo, getMapping,value, component } from "../../src/typespeed";

@component
export default class TestSocket {

    @value("view")
    public view: string;

    @SocketIo.onConnected
    public connected(socket, next) {
        SocketIo.getIoServer().sockets.emit("all", "We have a new member: " + socket.id);
        console.log(SocketIo.getIoServer().engine.clientsCount);
        next();
    }

    @SocketIo.onDisconnect
    public disconnet(socket, reason) {
        SocketIo.getIoServer().sockets.emit("all", "We lost a member by: " + reason);
    }

    @SocketIo.onEvent("test-error") 
    public testError(socket, message) {
        throw new Error("test-error");
    }

    @SocketIo.onError
    public error(socket, err) {
        console.log(err.message);
        SocketIo.getIoServer().sockets.emit("all", "We have a problem!");
    }

    @SocketIo.onEvent("say") 
    public say(socket, message) {
        SocketIo.getIoServer().sockets.emit("all", "");
        socket.emit("message", "test-from-server-1");
    }

    @SocketIo.onEvent("test2") 
    public test2(socket, message) {
        console.log(message);
        console.log(SocketIo.getIoServer().sockets.emit("all", "test-from-server-all"));
        socket.emit("test2", "test-from-server-2");
    }

    @getMapping("/socketIo")
    public socketIoPage(req, res) {
        res.render("socket");
    }
}