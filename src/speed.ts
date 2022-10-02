import "reflect-metadata";
import * as fs from "fs"
import * as walkSync from "walk-sync";
import BeanFactory from "./bean-factory.class";
import LogFactory from "./factory/log-factory.class";

let globalConfig = {};
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
    return globalConfig[node] ?? {};
}

function component(constructorFunction) {
    BeanFactory.putObject(constructorFunction, new constructorFunction());
}

function bean(target: any, propertyName: string) {
    let returnType = Reflect.getMetadata("design:returntype", target, propertyName);
    const targetObject = new target.constructor();
    BeanFactory.putBean(returnType, {
        "target": target, "propertyKey": propertyName,
        "factory": targetObject[propertyName]()
    });
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
            const targetObject = BeanFactory.getBean(type);
            if (targetObject === undefined) {
                return new type();
            }
            return targetObject["factory"];
        }
    });
}

function log(message?: any, ...optionalParams: any[]) {
    const logObject = BeanFactory.getBean(LogFactory);
    if (logObject) {
        logObject["factory"].log(message, ...optionalParams);
    } else {
        console.log(message, ...optionalParams);
    }
}

function error(message?: any, ...optionalParams: any[]) {
    const logObject = BeanFactory.getBean(LogFactory);
    if (logObject) {
        logObject["factory"].error(message, ...optionalParams);
    } else {
        console.error(message, ...optionalParams);
    }
}

function before(constructorFunction, methodName: string) {
    const targetBean = BeanFactory.getObject(constructorFunction);
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
    const targetBean = BeanFactory.getObject(constructorFunction);
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



export { component, bean, autoware, log, app, before, after, value, error, config };