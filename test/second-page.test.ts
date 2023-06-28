import * as jwttoken from "jsonwebtoken";
import * as fs from "fs";
const chaiObj = require('chai');
chaiObj.use(require("chai-http"));

describe("Test Sencond Page", () => {
    const testAddr = `http://${process.env.LOCAL_HOST || "localhost"}:8081`;
    it("/second/setCookie", (done) => {
        chaiObj.request(testAddr).get("/second/setCookie").end((err, res) => {
            chaiObj.assert.equal(res.headers["set-cookie"].includes("name=zzz; Path=/"), true);
            done();
        });
    });
    it("/second/getCookie", (done) => {
        const cookieSet = "mycookie"
        chaiObj.request(testAddr).get("/second/getCookie")
            .set("Cookie", "name=" + cookieSet).end((err, res) => {
                chaiObj.assert.equal(res.text, "getCookie: " + cookieSet);
                done();
            });
    });
    it("/second/testSession", (done) => {
        chaiObj.request(testAddr).get("/second/testSession").end((err, res) => {
            chaiObj.assert.equal(res.text, "testForSession: 1");
            done();
        });
    });
    it("/upload", (done) => {
        const uploadfile = "./app/static/k.jpg";
        chaiObj.request(testAddr).post("/upload")
            .set('Content-Type', 'multipart/form-data')
            .attach("file", uploadfile)
            .end((err, res) => {
                chaiObj.assert.equal(res.text, "upload success");
                done();
            });
    });
    it("/form", (done) => {
        const token = jwttoken.sign({ foo: 'bar' }, 'shhhhhhared-secret');
        const fileContents = fs.readFileSync("./app/src/views/upload.html", "utf8");
        chaiObj.request(testAddr).post("/form")
            .set({ "Authorization": `Bearer ${token}` })
            .end((err, res) => {
                chaiObj.assert.equal(res.text, fileContents);
                done();
            });
    });
});

export { };