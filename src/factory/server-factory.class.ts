export default abstract class ServerFactory {
    public app;
    protected middlewareList: Array<any> = [];
    public abstract setMiddleware(middleware: any);
    public abstract start(port: number, callback?: Function): any;
}