import "reflect-metadata";
import * as fs from "fs"
import * as walkSync from "walk-sync";
import * as cron from "cron";
import LogFactory from "./factory/log-factory.class";

let globalConfig = {};
const resourceObjects = new Map<string, object>();
const beanMapper: Map<string, any> = new Map<string, any>();
const objectMapper: Map<string, any> = new Map<string, any>();
const configPath = process.cwd() + "/test/config.json";

if (fs.existsSync(configPath)) {
    globalConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const nodeEnv = process.env.NODE_ENV || "development";
    const envConfigFile = process.cwd() + "/test/config-" + nodeEnv + ".json";
    if (fs.existsSync(envConfigFile)) {
        globalConfig = Object.assign(globalConfig, JSON.parse(fs.readFileSync(envConfigFile, "utf-8")));
    }
}

function app<T extends { new(...args: any[]): {} }>(constructor: T) {
    const srcDir = process.cwd() + "/src";
    const srcFiles = walkSync(srcDir, { globs: ['**/*.ts'] });

    const testDir = process.cwd() + "/test";
    const testFiles = walkSync(testDir, { globs: ['**/*.ts'] });

    (async function () {
        try {
            for (let p of srcFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                await import(srcDir + "/" + moduleName);
            }

            for (let p of testFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                await import(testDir + "/" + moduleName);
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

function before(constructorFunction, methodName: string) {
    const targetBean = getComponent(constructorFunction);
    return function (target, propertyKey: string) {
        const currentMethod = targetBean[methodName];
        Object.assign(targetBean, {
            [methodName]: function (...args) {
                target[propertyKey](...args);
                log("========== before ==========");
                return currentMethod.apply(targetBean, args);
            }
        })
    };
}

function after(constructorFunction, methodName: string) {
    const targetBean = getComponent(constructorFunction);
    return function (target, propertyKey: string) {
        const currentMethod = targetBean[methodName];
        Object.assign(targetBean, {
            [methodName]: function (...args) {
                const result = currentMethod.apply(targetBean, args);
                const afterResult = target[propertyKey](result);
                log("========== after ==========");
                return afterResult ?? result;
            }
        })
    };
}

function schedule(cronTime: string | Date) {
    return (target: any, propertyKey: string) => {
        new cron.CronJob(cronTime, target[propertyKey]).start();
    }
}

export { component, bean, resource, log, app, before, after, value, error, config, autoware, getBean, getComponent, schedule };