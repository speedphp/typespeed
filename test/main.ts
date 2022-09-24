import ServerFactory from "../src/factory/server-factory.class";
import { app, log, autoware } from "../src/speed";


@app
class Main {

    @autoware
    public server : ServerFactory;

    public main(){
        this.server.start(8080);
        log('start application');

        const config = require("./config.json");
        const testConfig = require("./config-test.json");

        let realConfig = Object.assign(config, testConfig);
        console.log(realConfig);
    }
}