import * as jwttoken from "jsonwebtoken";
import * as fs from "fs";
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
    it("/second/testSession", (done) => {
        chaiObj.request("http://localhost:8081").get("/second/testSession").end((err, res) => {
            chaiObj.assert.equal(res.text, "testForSession: 1");
            done();
        });
    });
    it("/upload", (done) => {
        const uploadfile = "./app/static/k.jpg";
        chaiObj.request("http://localhost:8081").post("/upload")
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
        chaiObj.request("http://localhost:8081").post("/form")
            .set({ "Authorization": `Bearer ${token}` })
            .end((err, res) => {
                chaiObj.assert.equal(res.text, fileContents);
                done();
            });
    });
});

export { };