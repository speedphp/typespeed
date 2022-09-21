import * as express from "express";
import ServerFactory from "../factory/server-factory.class";
import { bean, log } from "../speed";

export default class ExpressServer extends ServerFactory {
    @bean
    public getSever(): ServerFactory {
        return new ExpressServer();
    }
    public setMiddleware(middleware: any) {
        this.middlewareList.push(middleware);
    }
    public start(port: number) {
        const app: express.Application = express();
        this.middlewareList.forEach(middleware => {
            app.use(middleware);
        });
        app.listen(port, () => {
            log("server start at port: " + port);
        });
    }
}
