let appClose;
before(function () {
    this.timeout(50000);
    appClose = require("../app/src/main");
});

after(() => {
    if(appClose != null){
        appClose.default();
    }
});
