const chaiObj = require('chai');

chaiObj.use(require("chai-http"));


describe("sencond page", () => {

    it("/second", (done) => {
        chaiObj.assert.equal(1, 1);
        done();
    });

});

export {};