const chaiObj = require('chai');
chaiObj.use(require("chai-http"));
const expect = chaiObj.expect;

describe("Test Health Check", () => {
    const testAddr = `http://${process.env.LOCAL_HOST || "localhost"}:8081`;
    it("/health (liveness)", (done) => {
        chaiObj.request(testAddr).get("/health").end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({ status: "up" });
            done();
        });
    });
    it("/ready (readiness)", (done) => {
        chaiObj.request(testAddr).get("/ready").end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({ status: "ready" });
            done();
        });
    });
});

export {};
