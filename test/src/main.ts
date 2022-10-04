import { app, log, autoware, ServerFactory } from "../../src/speed";
//import * as basicAuth from "express-basic-auth"

@app
class Main {

    @autoware
    public server : ServerFactory;

    public main(){
        // this.server.setMiddleware(basicAuth({
        //     users: { 'admin': 'supersecret' }
        // }));
        this.server.start(8081);
        log('start application');
    }
}