import { expect } from "chai";
import * as http from "http";
import { ServerFactory } from "../src/typespeed";

class FakeServer extends ServerFactory {
    public setMiddleware() { /* no-op */ }
    public start() { /* no-op */ }
}

describe("ServerFactory 真实监听地址（2.6.8）", () => {
    it("getPort/getHost 从 httpServer.address() 读取", () => {
        const server = new FakeServer();
        server.httpServer = { address: () => ({ port: 8080, address: "::" }) };
        expect(server.getPort()).to.equal(8080);
        expect(server.getHost()).to.equal("::");
    });

    it("httpServer 未就绪时 getPort 返回 0、getHost 返回 127.0.0.1", () => {
        const server = new FakeServer();
        expect(server.getPort()).to.equal(0);
        expect(server.getHost()).to.equal("127.0.0.1");
    });

    it("真实 listen 后 getPort 返回实际监听端口（含动态端口）", (done) => {
        const server = new FakeServer();
        server.httpServer = http.createServer().listen(0, () => {
            try {
                const port = server.getPort();
                expect(port).to.be.a("number").and.greaterThan(0);
                done();
            } catch (err) {
                done(err);
            } finally {
                server.httpServer.close();
            }
        });
    });
});
