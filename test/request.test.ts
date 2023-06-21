import MutilUsers from "../app/src/entities/mutil-users.class";
import UserDto from "../app/src/entities/user-dto.class";
const chaiObj = require('chai');
chaiObj.use(require("chai-http"));
const expect = chaiObj.expect;

describe("Test Request Paramters", () => {
    it("/request/res", (done) => {
        chaiObj.request("http://localhost:8081").get("/request/res").end((err, res) => {
            expect(res.text).to.be.equal("test res");
            done();
        });
    });
    it("/request/query", (done) => {
        chaiObj.request("http://localhost:8081").get("/request/query?id=100").end((err, res) => {
            expect(res.text).to.be.equal(JSON.stringify(
                new MutilUsers("group", [new UserDto(1, "name"), new UserDto(2, "name")]
            )));
            done();
        });
    });
    it("/request/body", (done) => {
        const sendUser = new UserDto(100, "name100");
        chaiObj.request("http://localhost:8081").post("/request/body")
            .send(sendUser)
            .end((err, res) => {
            expect(res.text).to.be.equal(JSON.stringify(new MutilUsers("group", [sendUser])));
            done();
        });
    });
    it("/request/form", (done) => {
        const sendName = "name200";
        chaiObj.request("http://localhost:8081").post("/request/form")
            .type("form")
            .send({ name: sendName })
            .end((err, res) => {
            expect(res.text).to.be.equal("Got name: " + sendName);
            done();
        });
    });
    it("/request/param", (done) => {
        const sendId = 200;
        chaiObj.request("http://localhost:8081").get("/request/param/" + sendId).end((err, res) => {
            expect(res.text).to.be.equal("test param: " + sendId);
            done();
        });
    });
});

export {};