import ExpressServer from "../src/default/express-server.class";
import { app, log } from "../src/speed";


@app
class Main {

    public main(){
        const server = new ExpressServer();
        server.start(8080);
        log('start application');
    }
}