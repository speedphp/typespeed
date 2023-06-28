const chaiObj = require('chai');
chaiObj.use(require("chai-http"));
const expect = chaiObj.expect;
describe("Test Database", () => {
    const randomId = random(3000, 5000);
    const testDatabase = [
        {
            "url": "/db/insert?id=" + randomId,
            "expect": "Insert success: " + randomId,
        },
        {
            "url": "/db/insert2?id=" + (randomId + 1),
            "expect": "Insert success: " + (randomId + 1),
        },
        {
            "url": "/db/update?id=" + randomId,
            "expect": "update success: 1",
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
    it("/db/select-row", (done) => {
        chaiObj.request("http://localhost:8081").get("/db/select-row?id=" + randomId).end((err, res) => {
            const dataList = JSON.parse(res.text);
            expect(dataList).to.be.an('array');
            expect(dataList[0]).to.have.property("id").which.is.a("number").equal(randomId);
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

function random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

export {};