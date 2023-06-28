let appClose;
before(function () {
    this.timeout(20000);
    appClose = require("../app/src/main");
});

after(() => {
    if(appClose != null){
        appClose.default();
    }
});
