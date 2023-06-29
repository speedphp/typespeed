const chaiObj = require('chai');
chaiObj.use(require("chai-http"));
const expect = chaiObj.expect;

describe("Test Redis", () => {
    const testAddr = `http://${process.env.LOCAL_HOST || "localhost"}:8081`;
    const ranking = {
        "zhangsan": 93, "lisi": 99, "wangwu": 96, "zhaoliu": 97, "qianqi": 98, "sunba": 92, "zhoujiu": 94, "wushi": 95
    };
    it("/redis", (done) => {
        chaiObj.request(testAddr).get("/redis").end((err, res) => {
            expect(res.text).to.be.equal("get from redis: " + "Hello World");
            done();
        });
    });
    it("/redis/publish", (done) => {
        chaiObj.request(testAddr).get("/redis/publish").end((err, res) => {
            expect(res.text).to.be.equal("Published!");
            done();
        });
    });
    Object.keys(ranking).forEach((item) => {
        it("/redis/add " + item, (done) => {
            chaiObj.request(testAddr).get(`/redis/add?name=${item}&score=${ranking[item]}`).end((err, res) => {
                expect(res.text).to.be.equal("add zset success");
                done();
            });
        });
    });
    it("/redis/list", (done) => {
        chaiObj.request(testAddr).get("/redis/list").end((err, res) => {
            const dataList = JSON.parse(res.text);
            const rankingAsc = Object.fromEntries(Object.entries(ranking).sort((a, b) => a[1] - b[1]));
            expect(JSON.stringify(dataList)).to.be.equal(JSON.stringify(rankingAsc));
            done();
        });
    });
    it("/redis/ranking", (done) => {
        chaiObj.request(testAddr).get("/redis/ranking").end((err, res) => {
            const dataList = JSON.parse(res.text);
            const rankingDesc = Object.fromEntries(Object.entries(ranking).sort((a, b) => b[1] - a[1]));
            expect(JSON.stringify(dataList)).to.be.equal(JSON.stringify(rankingDesc));
            done();
        });
    });
});

export { };