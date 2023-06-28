const chaiObj = require('chai');

chaiObj.use(require("chai-http"));

const expect = chaiObj.expect;

describe("Test RabbitMQ", () => {
    const testAddr = `http://${process.env.LOCAL_HOST || "localhost"}:8081`;
    it("/mq/listen", (done) => {
        chaiObj.request(testAddr).get("/mq/listen").end((err, res) => {
            expect(res.text).to.be.equal("ok");
            done();
        });
    });
    it("/mq/sendByMQClass", (done) => {
        chaiObj.request(testAddr).get("/mq/sendByMQClass").end((err, res) => {
            expect(res.text).to.be.equal("sent by MQClass");
            done();
        });
    });
    it("/mq/sendByQueue", (done) => {
        chaiObj.request(testAddr).get("/mq/sendByQueue").end((err, res) => {
            expect(res.text).to.be.equal("sent by queue");
            done();
        });
    });
    it("/mq/sendByExchange", (done) => {
        chaiObj.request(testAddr).get("/mq/sendByExchange").end((err, res) => {
            expect(res.text).to.be.equal("sent by exchange");
            done();
        });
    });
});

export { };