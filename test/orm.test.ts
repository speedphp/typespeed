const chaiObj = require('chai');
chaiObj.use(require("chai-http"));
const expect = chaiObj.expect;

describe("Test Request Paramters", () => {
    it("/redis", (done) => {
        chaiObj.request("http://localhost:8081").get("/redis").end((err, res) => {
            expect(res.text).to.be.equal("get from redis: " + "Hello World");
            done();
        });
    });
    it("/orm/first", (done) => {
        chaiObj.request("http://localhost:8081").get("/orm/first").end((err, res) => {
            expect(res.text).to.be.equal("first test, to getUsers");
            done();
        });
    });
    it("/orm/one", (done) => {
        chaiObj.request("http://localhost:8081").get("/orm/one?id=1").end((err, res) => {
            expect(res.text).to.be.equal("find one test, to getUser");
            done();
        });
    });
    it("/orm/delete", (done) => {
        chaiObj.request("http://localhost:8081").get("/orm/delete?id=0").end((err, res) => {
            expect(res.text).to.be.equal("remove user, results: remove rows: 0");
            done();
        });
    });
    it("/orm/count", (done) => {
        chaiObj.request("http://localhost:8081").get("/orm/count").end((err, res) => {
            expect(JSON.parse(res.text)).to.have.property("count").which.is.a("number").above(0);
            done();
        });
    });
    it("/orm/new", (done) => {
        chaiObj.request("http://localhost:8081").get("/orm/new").end((err, res) => {
            expect(JSON.parse(res.text)).to.have.property("newId").which.is.a("number").above(0);
            done();
        });
    });
    it("/orm/page/calculate", (done) => {
        chaiObj.request("http://localhost:8081").get("/orm/page/calculate").end((err, res) => {
            expect(JSON.parse(res.text)).to.have.property("totalPage").which.is.a("number").equal(38);
            done();
        });
    });
    it("/orm/pages", (done) => {
        chaiObj.request("http://localhost:8081").get("/orm/pages/1").end((err, res) => {
            expect(JSON.parse(res.text)).is.a("array").lengthOf(3);
            done();
        });
    });
    it("/orm/edit", (done) => {
        chaiObj.request("http://localhost:8081").post("/orm/edit")
            .type("form")
            .send({ id: 1, name: "new name" })
            .end((err, res) => {
                expect(JSON.parse(res.text)).to.have.property("effectRows").which.to.be.oneOf([0, 1]);
                done();
            });
    });
});

export { };