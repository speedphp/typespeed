import { app, log, autoware, ServerFactory } from "../../";
//import * as basicAuth from "express-basic-auth"
let appServer = null;

@app
class Main {

    @autoware
    public server : ServerFactory;

    public main(){
        // this.server.setMiddleware(basicAuth({
        //     users: { 'admin': 'supersecret' }
        // }));
        appServer = this.server.start(8081);
        log('start application');
    }
}

export default () => {
    if (appServer != null) {
        appServer.close();
    }
};