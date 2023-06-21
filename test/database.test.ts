const chaiObj = require('chai');
chaiObj.use(require("chai-http"));
const expect = chaiObj.expect;
describe("Test Database", () => {
    const testDatabase = [
        {
            "url": "/db/insert?id=" + Math.ceil(Math.random() * 1000),
            "expect": "Insert success",
        },
        {
            "url": "/db/insert2",
            "expect": "Insert success",
        },
        {
            "url": "/db/update",
            "expect": "update success",
        },
        {
            "url": "/db/set-cache?value=zzz",
            "expect": "set cache success",
        },
        {
            "url": "/db/get-cache",
            "expect": "zzz",
        }
    ]
    testDatabase.forEach((testRequest) => {
        it(testRequest.url, (done) => {
            chaiObj.request("http://localhost:8081").get(testRequest.url).end((err, res) => {
                chaiObj.assert.equal(testRequest.expect, res.text);
                return done();
            });
        });
    });
    it("/db/select1", (done) => {
        chaiObj.request("http://localhost:8081").get("/db/select1").end((err, res) => {
            const dataList = JSON.parse(res.text);
            expect(dataList).to.be.an('array');
            expect(dataList[0]).to.have.property("id").which.is.a("number").equal(1);
            done();
        });
    });
    it("/db/select", (done) => {
        chaiObj.request("http://localhost:8081").get("/db/select").end((err, res) => {
            const dataList = JSON.parse(res.text);
            expect(dataList).to.be.an('array');
            expect(dataList[0]).to.have.property('id');
            done();
        });
    });
    it("/db/select-user", (done) => {
        chaiObj.request("http://localhost:8081").get("/db/select-user").end((err, res) => {
            const dataList = JSON.parse(res.text);
            expect(dataList).to.be.an('array');
            expect(dataList[0]).to.have.property('id');
            done();
        });
    });
});

export {};