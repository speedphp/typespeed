import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";
import * as walkSync from "walk-sync";
import { isStd, getStdArgs } from "./decorator-utils";

let globalConfig = {};
const corePath = __dirname;
const mainPath = path.dirname(getRootPath(new Error().stack.split("\n")) || process.argv[1]);
const configFile = mainPath + "/config.json";
if (fs.existsSync(configFile)) {
    globalConfig = JSON.parse(fs.readFileSync(configFile, "utf-8"));
    const nodeEnv = process.env.NODE_ENV || "development";
    const envConfigFile = mainPath + "/config-" + nodeEnv + ".json";
    if (fs.existsSync(envConfigFile)) {
        globalConfig = Object.assign(globalConfig, JSON.parse(fs.readFileSync(envConfigFile, "utf-8")));
    }
}
globalConfig["MAIN_PATH"] = mainPath;
globalConfig["CORE_PATH"] = corePath;

function app(...args: any[]): any {
    if (isStd(args)) {
        const [, ctx] = getStdArgs(args);
        ctx.addInitializer(function (this: any) {
            // 标准类装饰器 initializer 的 this 是类本身（TS 实现：initializers.call(class)），
            // 不是实例；用 this.constructor 会拿到 Function，导致 new Function() 后 main.main is not a function。
            startApp(this);
        });
        return;
    }
    startApp(args[0]);
}

function startApp(constructor: any) {
    const coreFiles = walkSync(corePath, { globs: ['**/*.ts'], ignore: ['**/*.d.ts', 'scaffold/**'] });
    const mainFiles = walkSync(mainPath, { globs: ['**/*.ts'] });

    (async function () {
        try {
            for (let p of coreFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                await import(corePath + "/" + moduleName);
            }

            for (let p of mainFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                await import(mainPath + "/" + moduleName);
            }
        } catch (err) {
            console.error(err);
        }
        //log("main start")
        const main = new constructor();
        main["main"]();
    }());
}

function config(node: string) {
    return globalConfig[node] || null;
}

function value(configPath: string): any {
    return function (...args: any[]): any {
        if (isStd(args)) {
            // 标准 field 装饰器：返回 initializer 注入配置值（标准模式下无 design:type）。
            return (initialValue: any) => {
                if (globalConfig === undefined) {
                    return initialValue;
                }
                let pathNodes = configPath.split(".");
                let nodeValue = globalConfig;
                for (let i = 0; i < pathNodes.length; i++) {
                    nodeValue = nodeValue[pathNodes[i]];
                }
                return nodeValue === undefined ? initialValue : nodeValue;
            };
        }
        const target = args[0];
        const propertyKey = args[1] as string;
        if (globalConfig === undefined) {
            Object.defineProperty(target, propertyKey, {
                get: () => {
                    return undefined;
                }
            });
        } else {
            let pathNodes = configPath.split(".");
            let nodeValue = globalConfig;
            for (let i = 0; i < pathNodes.length; i++) {
                nodeValue = nodeValue[pathNodes[i]];
            }
            Object.defineProperty(target, propertyKey, {
                get: () => {
                    return nodeValue;
                }
            });
        }
    };
}

function getRootPath(lines: string[]) {
    // 兼容新旧 Node 栈帧（Node<22: "Function.Module._load" / Node22+: "Function._load"）、
    // mocha(ts-node) 下 "Context.<anonymous>" 与中间可能插入的 "wrapModuleLoad" 帧：
    // 按顺序出现匹配（不要求严格相邻），提高在各种加载器下的容错。
    const macths = [/at Function(\.Module)?\._load/, "at Module.require", /at require\b/, /at (Object|Context)\.<anonymous>/];
    let matchIndex = 0;
    for (let line of lines) {
        const matcher = macths[matchIndex];
        if (matcher instanceof RegExp ? matcher.test(line) : line.includes(matcher)) {
            if (matchIndex === macths.length - 1) {
                let arr = line.split("(")[1].split(":")
                arr.pop()
                arr.pop()
                return arr.join(':')
            }
            matchIndex++;
        }
    }
    return undefined;
}

export { app, value, config };
export * from "./core.decorator";
export * from "./route.decorator";
export * from "./database.decorator";
export * from "./bind.decorator";

export { default as LogFactory} from "./factory/log-factory.class";
export { default as CacheFactory} from "./factory/cache-factory.class";
export { default as DataSourceFactory} from "./factory/data-source-factory.class";
export { default as ServerFactory} from "./factory/server-factory.class";
export { default as AuthenticationFactory} from "./factory/authentication-factory.class";
export { default as HealthFactory} from "./factory/health-factory.class";

export { default as ExpressServer} from "./default/express-server.class";
export { default as LogDefault} from "./default/log-default.class";
export { default as HealthDefault} from "./default/health-default.class";
export { default as NodeCache} from "./default/node-cache.class";
export { Redis, redisSubscriber } from "./default/redis.class";
export { default as ReadWriteDb} from "./default/read-write-db.class";
export * from "./default/rabbitmq.class";
export * from "./default/socket-io.class";