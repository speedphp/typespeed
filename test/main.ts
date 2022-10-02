import ServerFactory from "../src/factory/server-factory.class";
import { app, log, inject } from "../src/speed";
import * as basicAuth from "express-basic-auth"

@app
class Main {

    @inject
    public server : ServerFactory;

    public main(){
        // this.server.setMiddleware(basicAuth({
        //     users: { 'admin': 'supersecret' }
        // }));
        this.server.start(8080);
        log('start application');
    }
}