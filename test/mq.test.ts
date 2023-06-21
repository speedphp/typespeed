const chaiObj = require('chai');

chaiObj.use(require("chai-http"));

const expect = chaiObj.expect;

describe("Test RabbitMQ", () => {
    it("/mq/listen", (done) => {
        chaiObj.request("http://localhost:8081").get("/mq/listen").end((err, res) => {
            expect(res.text).to.be.equal("ok");
            done();
        });
    });
    it("/mq/sendByMQClass", (done) => {
        chaiObj.request("http://localhost:8081").get("/mq/sendByMQClass").end((err, res) => {
            expect(res.text).to.be.equal("sent by MQClass");
            done();
        });
    });
    it("/mq/sendByQueue", (done) => {
        chaiObj.request("http://localhost:8081").get("/mq/sendByQueue").end((err, res) => {
            expect(res.text).to.be.equal("sent by queue");
            done();
        });
    });
    it("/mq/sendByExchange", (done) => {
        chaiObj.request("http://localhost:8081").get("/mq/sendByExchange").end((err, res) => {
            expect(res.text).to.be.equal("sent by exchange");
            done();
        });
    });
});

export { };