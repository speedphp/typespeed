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
            expect(arg).to.be.equal("LiLei said: test-from-client-1");
            done();
        });
        clientLiLei.emit("say", "test-from-client-1");
    });

});

