const chaiObj = require('chai');
chaiObj.use(require("chai-http"));
const expect = chaiObj.expect;

describe("Test @bind and token", () => {
    const testAddr = `http://${process.env.LOCAL_HOST || "localhost"}:8081`;
    it("/bind/param (route @bind)", (done) => {
        chaiObj.request(testAddr).get("/bind/param/100?name=testname").end((err, res) => {
            expect(JSON.parse(res.text)).to.deep.equal({ id: "100", name: "testname" });
            done();
        });
    });
    it("/bind/token (@bean(Token) + @autoware(Token) + @resource(Token, args))", (done) => {
        chaiObj.request(testAddr).get("/bind/token").end((err, res) => {
            expect(res.text).to.equal("test-bean|model-ok");
            done();
        });
    });
    it("/bind/db (database @bind scalar)", (done) => {
        const id = Math.floor(Math.random() * 900000) + 100000;
        chaiObj.request(testAddr).get(`/bind/db?id=${id}`).end((err, res) => {
            expect(res.text).to.match(/^bind insert: \d+/);
            done();
        });
    });
});

export {};
