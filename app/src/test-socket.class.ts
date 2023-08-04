import { SocketIo, getMapping, component, io } from "../../src/typespeed";

@component
export default class TestSocket {

    static names = ["LiLei", "HanMeiMei"];

    static loginUsers: Map<string, string> = new Map<string, string>();

    @SocketIo.onConnected
    public connected(socket, next) {
        // 从 names 里面取出一个名字
        let name = TestSocket.names.pop();
        TestSocket.loginUsers.set(socket.id, name);
        //io.sockets.emit("all", "We have a new member: " + name);
        //console.log(socket.handshake);
        //console.log(socket.id);
        //next(new Error("test-error"));
    }

    @SocketIo.onDisconnect
    public disconnet(socket, reason) {
        io.sockets.emit("all", "We lost a member by: " + reason);
    }

    @SocketIo.onEvent("test-error") 
    public testError(socket, message) {
        throw new Error("test-error");
    }

    @SocketIo.onError
    public error(socket, err) {
        io.sockets.emit("all", "We have a problem!");
    }

    @SocketIo.onEvent("say") 
    public say(socket, message) {
        io.sockets.emit("all", TestSocket.loginUsers.get(socket.id) + " said: " + message);
    }

    @SocketIo.onEvent("join") 
    public join(socket, message) {
        socket.join("private-room");
        io.to("private-room").emit("all", TestSocket.loginUsers.get(socket.id) + " joined private-room");
    }

    @SocketIo.onEvent("say-inroom") 
    public sayInRoom(socket, message) {
        io.to("private-room").emit("all", TestSocket.loginUsers.get(socket.id) + " said in Room: " + message);
    }

    @getMapping("/socketIo")
    public socketIoPage(req, res) {
        res.render("socket");
    }
}