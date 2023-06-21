const chaiObj = require('chai');

chaiObj.use(require("chai-http"));


describe("Sencond Page", () => {
    it("/second/setCookie", (done) => {
        chaiObj.request("http://localhost:8081").get("/second/setCookie").end((err, res) => {
            chaiObj.assert.equal(res.headers["set-cookie"].includes("name=zzz; Path=/"), true);
            done();
        });
    });
    it("/second/getCookie", (done) => {
        const cookieSet = "mycookie"
        chaiObj.request("http://localhost:8081").get("/second/getCookie")
            .set("Cookie", "name=" + cookieSet).end((err, res) => {
                chaiObj.assert.equal(res.text, "getCookie: " + cookieSet);
            done();
        });
    });
});

export {};