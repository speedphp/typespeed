import { SocketIo, resource, getMapping,value, component } from "../../src/typespeed";
@component
export default class TestIo {

    @resource()
    public socketIo: SocketIo;

    @value("view")
    public view: string;

    @SocketIo.onEvent("test")
    public connection(socket, message) {
        console.log(message);
        this.socketIo.sockets.emit("test","test-from-server2");
        socket.emit("test", "test-from-server3");
    }

    @getMapping("/socketIo")
    public socketIoPage(req, res) {
        console.log(this.view)
        res.render("socket");
    }
}