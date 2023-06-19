import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";
import * as walkSync from "walk-sync";
import * as cron from "cron";
import LogFactory from "./factory/log-factory.class";

let globalConfig = {};
const resourceObjects = new Map<string, object>();
const beanMapper: Map<string, any> = new Map<string, any>();
const objectMapper: Map<string, any> = new Map<string, any>();

function app<T extends { new(...args: any[]): {} }>(constructor: T) {
    const coreDir = __dirname;
    const mainPath = path.dirname(getRootPath() || process.argv[1]);
    const configFile = mainPath + "/config.json";
    if (fs.existsSync(configFile)) {
        globalConfig = JSON.parse(fs.readFileSync(configFile, "utf-8"));
        const nodeEnv = process.env.NODE_ENV || "development";
        const envConfigFile = mainPath + "/config-" + nodeEnv + ".json";
        if (fs.existsSync(envConfigFile)) {
            globalConfig = Object.assign(globalConfig, JSON.parse(fs.readFileSync(envConfigFile, "utf-8")));
        }
    }

    const coreFiles = walkSync(coreDir, { globs: ['**/*.ts'], ignore: ['**/*.d.ts', 'scaffold/**'] });
    const mainFiles = walkSync(mainPath, { globs: ['**/*.ts'] });

    (async function () {
        try {
            for (let p of coreFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                await import(coreDir + "/" + moduleName);
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

function component(constructorFunction) {
    objectMapper.set(constructorFunction.name, new constructorFunction());
}

function getComponent(constructorFunction) {
    return objectMapper.get(constructorFunction.name);
}

function bean(target: any, propertyKey: string) {
    let returnType = Reflect.getMetadata("design:returntype", target, propertyKey);
    //const targetObject = new target.constructor();
    beanMapper.set(returnType.name, {
        "target": target, "propertyKey": propertyKey,
        "factory": target[propertyKey]()
    });
}

function getBean(mappingClass: Function): any {
    const bean = beanMapper.get(mappingClass.name);
    return bean["factory"];
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

function autoware(target: any, propertyKey: string): void {
    const type = Reflect.getMetadata("design:type", target, propertyKey);
    Object.defineProperty(target, propertyKey, {
        get: () => {
            const targetObject = beanMapper.get(type.name);
            if (targetObject === undefined) {
                const resourceKey = [target.constructor.name, propertyKey, type.name].toString();
                if (!resourceObjects[resourceKey]) {
                    resourceObjects[resourceKey] = new type();
                }
                return resourceObjects[resourceKey];
            }
            return targetObject["factory"];
        }
    });
}

function resource(...args): any {
    return (target: any, propertyKey: string) => {
        const type = Reflect.getMetadata("design:type", target, propertyKey);
        Object.defineProperty(target, propertyKey, {
            get: () => {
                const resourceKey = [target.constructor.name, propertyKey, type.name].toString();
                if (!resourceObjects[resourceKey]) {
                    resourceObjects[resourceKey] = new type(...args);
                }
                return resourceObjects[resourceKey];
            }
        });
    }
}

function log(message?: any, ...optionalParams: any[]) {
    const logObject = beanMapper.get(LogFactory.name);
    if (logObject) {
        logObject["factory"].log(message, ...optionalParams);
    } else {
        console.log(message, ...optionalParams);
    }
}

function error(message?: any, ...optionalParams: any[]) {
    const logObject = beanMapper.get(LogFactory.name);
    if (logObject) {
        logObject["factory"].error(message, ...optionalParams);
    } else {
        console.error(message, ...optionalParams);
    }
}

function getRootPath() {
    const lines = new Error().stack.split("\n");
    let rootPath = "";
    let lastLine = "";
    for (let line of lines) {
        if (line.includes("at ") &&
            line.includes("node:internal/modules/cjs/loader") &&
            line.includes("Module._compile") &&
            lastLine.includes("at ") &&
            lastLine.includes("Object.<anonymous>")) {
            rootPath = lastLine.split("(")[1].split(":")[0];
            break;
        }
        lastLine = line;
    }
    return rootPath;
}

function schedule(cronTime: string | Date) {
    return (target: any, propertyKey: string) => {
        new cron.CronJob(cronTime, target[propertyKey]).start();
    }
}

export { component, bean, resource, log, app, value, error, config, autoware, getBean, getComponent, schedule };