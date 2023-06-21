const chaiObj = require('chai');
chaiObj.use(require("chai-http"));

describe("Test Database", () => {
    const testDatabase = [
        {
            "url": "/db/insert?id=" + Math.random() * 1000,
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
            "url": "/db/select1",
            "expect": "[{\"id\":1,\"name\":\"LiLei\"}]",
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

});

export {};