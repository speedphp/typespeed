const chaiObj = require('chai');

chaiObj.use(require("chai-http"));

const expect = chaiObj.expect;

describe("Test RabbitMQ", () => {
    const testAddr = `http://${process.env.LOCAL_HOST || "localhost"}:8081`;
    it("/mq/sendByMQClass", (done) => {
        chaiObj.request(testAddr).get("/mq/sendByMQClass").end((err, res) => {
            expect(res.text).to.be.equal("Sent by MQClass");
            done();
        });
    });
});

export { };