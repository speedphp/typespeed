let appClose;
before(() => {
    appClose = require("../app/src/main");
});

after(() => {
    if(appClose != null){
        appClose.default();
    }
});
