import { SocketIo, getMapping, component } from "../../src/typespeed";

@component
export default class TestSocket {

    static names = ["LiLei", "HanMeiMei"];

    static loginUsers: Map<string, string> = new Map<string, string>();

    @SocketIo.onConnected
    public connected(socket, next) {
        // 从 names 里面取出一个名字
        let name = TestSocket.names.pop();
        TestSocket.loginUsers.set(socket.id, name);
        //SocketIo.server().sockets.emit("all", "We have a new member: " + name);
        
        //next(new Error("test-error"));
    }

    @SocketIo.onDisconnect
    public disconnet(socket, reason) {
        SocketIo.server().sockets.emit("all", "We lost a member by: " + reason);
    }

    @SocketIo.onEvent("test-error") 
    public testError(socket, message) {
        throw new Error("test-error");
    }

    @SocketIo.onError
    public error(socket, err) {
        SocketIo.server().sockets.emit("all", "We have a problem!");
    }

    @SocketIo.onEvent("say") 
    public say(socket, message) {
        SocketIo.server().sockets.emit("all", TestSocket.loginUsers.get(socket.id) + " said: " + message);
    }

    @getMapping("/socketIo")
    public socketIoPage(req, res) {
        res.render("socket");
    }
}