const chaiObj = require('chai');

chaiObj.use(require("chai-http"));

const firstPageRequests = [
    {
        "url": "/first",
        "expect": "FirstPage index running",
    },
    {
        "url": "/first/sendJson",
        "expect": JSON.stringify({
            "from": "sendJson",
            "to": "Browser"
        }),
    },
    {
        "url": "/first/sendResult",
        "expect": "sendResult",
    },
    {
        "url": "/first/renderTest",
        "expect": "Hello zzz!",
    },
]

describe("First page", () => {
    let appClose;
    before(() => {
        appClose = require("../app/src/main");
    });
    firstPageRequests.forEach((testRequest) => {
        it(testRequest.url, (done) => {
            chaiObj.request("http://localhost:8081").get(testRequest.url).end((err, res) => {
                chaiObj.assert.equal(testRequest.expect, res.text);
                return done();
            });
        });
    });
    after(() => {
        if(appClose != null){
            appClose.default();
        }
    });
});