import ServerFactory from "../factory/server-factory.class";
export default class ExpressServer extends ServerFactory {
    view: string;
    private static;
    private favicon;
    private compression;
    private cookieConfig;
    private session;
    private redisConfig;
    private redisClient;
    getSever(): ServerFactory;
    setMiddleware(middleware: any): void;
    start(port: number): void;
    private setDefaultMiddleware;
}
