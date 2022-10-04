export default abstract class ServerFactory {
    app: any;
    protected middlewareList: Array<any>;
    abstract setMiddleware(middleware: any): any;
    abstract start(port: number): any;
}
