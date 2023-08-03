const chaiObj = require('chai');
chaiObj.use(require("chai-http"));
import { io as Client } from "socket.io-client";
const expect = chaiObj.expect;

describe("Test Socket IO", () => {
    let clientSocket;
    before((done) => {
        clientSocket = Client("http://localhost:8081");
        clientSocket.on("connect", done);
    });
    after(() => {
        clientSocket.close();
      });
    it("should work", (done) => {
        clientSocket.on("test1", (arg) => {
            expect(arg).to.be.equal("test-from-server-1");
            done();
        });
        clientSocket.emit("test1", "world");
    });

});

