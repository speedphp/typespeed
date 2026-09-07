// Symbol.metadata polyfill：Node 22/24/26 都没有 Symbol.metadata，
// 标准装饰器的 context.metadata 依赖它，缺失会 TypeError，必须最先执行。
(Symbol as { metadata?: symbol }).metadata ??= Symbol("Symbol.metadata");

import express from "express";
import {
    component, getComponent, autoware, bean, getBean,
    getMapping, bind, setRouter,
} from "../../../dist/typespeed";

class CacheBean {
    name = "cache-bean";
}

@component
class TestService {

    @bean(CacheBean)
    getCache() { return new CacheBean(); }

    @autoware(CacheBean)
    cache!: CacheBean;

    // 标准模式：无参数装饰器，@bind 声明「参数名 → 来源」
    @getMapping("/std/test/:id")
    @bind({ id: "reqParam" })
    async test(id: string) {
        return { id, cache: this.cache.name };
    }
}

// 验证 1：@component / @autoware / @bean
const svc = getComponent(TestService);
console.log("[component] registered:", svc !== undefined);
console.log("[autoware(CacheBean)] injected:", svc && (svc as any).cache?.name);
console.log("[bean(CacheBean)] factory:", getBean(CacheBean)?.name);

// 验证 2：@getMapping + @bind 路由，走 setRouter 真实 HTTP 请求
const app = express();
setRouter(app);
const server = app.listen(0, () => {
    const addr = server.address() as any;
    const port = addr.port;
    httpGet(`http://127.0.0.1:${port}/std/test/123`, (body) => {
        console.log("[route @bind] response:", body);
        const parsed = JSON.parse(body);
        const ok = svc !== undefined
            && (svc as any).cache?.name === "cache-bean"
            && getBean(CacheBean)?.name === "cache-bean"
            && parsed.id === "123"
            && parsed.cache === "cache-bean";
        console.log(ok ? "STANDARD DECORATORS OK" : "STANDARD DECORATORS FAILED");
        server.close();
        process.exit(ok ? 0 : 1);
    });
});

function httpGet(url: string, cb: (body: string) => void) {
    require("http").get(url, (res: any) => {
        let data = "";
        res.on("data", (chunk: any) => { data += chunk; });
        res.on("end", () => cb(data));
    });
}
