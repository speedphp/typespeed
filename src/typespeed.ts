import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";
import * as walkSync from "walk-sync";

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

function app<T extends { new(...args: any[]): {} }>(constructor: T) {
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
    return function (target: any, propertyKey: string) {
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
    const macths = ["at Function.Module._load", "at Module.require", "at require", "at Object.<anonymous>"];
    let matchIndex = 0;
    for (let line of lines) {
        if (line.includes(macths[matchIndex])) {
            if(matchIndex === macths.length - 1) {
                let arr = line.split("(")[1].split(":")
                arr.pop()
                arr.pop()
                return arr.join(':')
            }
            matchIndex++;
        }else{
            matchIndex = 0;
        }
    }
    return undefined;
}

export { app, value, config };
export * from "./core.decorator";
export * from "./route.decorator";
export * from "./database.decorator";

export { default as LogFactory} from "./factory/log-factory.class";
export { default as CacheFactory} from "./factory/cache-factory.class";
export { default as DataSourceFactory} from "./factory/data-source-factory.class";
export { default as ServerFactory} from "./factory/server-factory.class";
export { default as AuthenticationFactory} from "./factory/authentication-factory.class";

export { default as ExpressServer} from "./default/express-server.class";
export { default as LogDefault} from "./default/log-default.class";
export { default as NodeCache} from "./default/node-cache.class";
export { Redis, redisSubscriber } from "./default/redis.class";
export { default as ReadWriteDb} from "./default/read-write-db.class";
export * from "./default/rabbitmq.class";
export * from "./default/socket-io.class";