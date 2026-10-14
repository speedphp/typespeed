export default abstract class ServerFactory {
    public app;
    /**HTTP 服务实例（listen 返回，start 后可用） */
    public httpServer: any = null;
    protected middlewareList: Array<any> = [];
    public abstract setMiddleware(middleware: any);
    public abstract start(port: number): any;

    /**
     * 真实监听端口。start() 后调用即可（Node 的 listen 在调用栈内完成 bind，
     * address() 同步可读）；动态端口（listen(0)）场景也能拿到实际分配值。
     * httpServer 未就绪时返回 0。
     */
    public getPort(): number {
        const addr = this.getAddress();
        return addr && typeof addr === "object" ? addr.port : 0;
    }

    /**
     * 监听地址（绑定地址）。IPv6 双栈是 "::"，IPv4 是 "0.0.0.0" 或具体 IP。
     * 注意这是「服务器绑定地址」，对外可达 host 请用部署配置/环境变量。
     * httpServer 未就绪时返回 "127.0.0.1"。
     */
    public getHost(): string {
        const addr = this.getAddress();
        return addr && typeof addr === "object" ? addr.address : "127.0.0.1";
    }

    private getAddress(): any {
        return this.httpServer && typeof this.httpServer.address === "function"
            ? this.httpServer.address()
            : null;
    }
}
