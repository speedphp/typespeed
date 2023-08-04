const chaiObj = require('chai');
chaiObj.use(require("chai-http"));
import { io as Client } from "socket.io-client";
const expect = chaiObj.expect;

describe("Test Socket IO", () => {
    const testAddr = `http://${process.env.LOCAL_HOST || "localhost"}:8081`;
    let clientHanMeiMei, clientLiLei;
    before((done) => {
        clientHanMeiMei = Client(testAddr);
        clientLiLei = Client(testAddr);
        clientHanMeiMei.on("connect", done);
    });
    after(() => {
        clientHanMeiMei.close();
        clientLiLei.close();
    });
    it("send and receive message", (done) => {
        clientHanMeiMei.on("all", (arg) => {
            expect(arg).to.be.include("LiLei");
            clientHanMeiMei.removeAllListeners("all");
            done();
        });
        clientLiLei.emit("say", "test-from-client-1");
    });
    it("test join room", (done) => {
        clientHanMeiMei.emit("join", "");
        clientHanMeiMei.on("all", (arg) => {
            expect(arg).to.be.include("joined private-room");
            clientHanMeiMei.removeAllListeners("all");
            done();
        });
    });
    it("test say in room", (done) => {
        const message = "I said in Room";
        clientHanMeiMei.on("all", (arg) => {
            expect(arg).to.be.include(message);
            clientHanMeiMei.removeAllListeners("all");
            done();
        });
        clientHanMeiMei.emit("say-inroom", message);
    });
    it("test error catching", (done) => {
        clientHanMeiMei.on("all", (arg) => {
            expect(arg).to.be.include("We have a problem!");
            clientHanMeiMei.removeAllListeners("all");
            done();
        });
        clientHanMeiMei.emit("test-error", "");
    });
    it("test disconnecting", (done) => {
        clientLiLei.on("all", (arg) => {
            expect(arg).to.be.include("lost a member");
            clientLiLei.removeAllListeners("all");
            done();
        });
        clientHanMeiMei.disconnect();
    });
});

