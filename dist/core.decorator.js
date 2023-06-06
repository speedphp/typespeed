"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedule = exports.getComponent = exports.getBean = exports.autoware = exports.config = exports.error = exports.value = exports.app = exports.log = exports.resource = exports.bean = exports.component = void 0;
require("reflect-metadata");
const fs = require("fs");
const path = require("path");
const walkSync = require("walk-sync");
const cron = require("cron");
const log_factory_class_1 = require("./factory/log-factory.class");
let globalConfig = {};
const resourceObjects = new Map();
const beanMapper = new Map();
const objectMapper = new Map();
const coreDir = __dirname;
const mainPath = path.dirname(process.argv[1]);
const configFile = mainPath + "/config.json";
if (fs.existsSync(configFile)) {
    globalConfig = JSON.parse(fs.readFileSync(configFile, "utf-8"));
    const nodeEnv = process.env.NODE_ENV || "development";
    const envConfigFile = mainPath + "/config-" + nodeEnv + ".json";
    if (fs.existsSync(envConfigFile)) {
        globalConfig = Object.assign(globalConfig, JSON.parse(fs.readFileSync(envConfigFile, "utf-8")));
    }
}
function app(constructor) {
    const coreFiles = walkSync(coreDir, { globs: ['**/*.ts'], ignore: ['**/*.d.ts', 'scaffold/**'] });
    const mainFiles = walkSync(mainPath, { globs: ['**/*.ts'] });
    (async function () {
        try {
            for (let p of coreFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                await Promise.resolve().then(() => require(coreDir + "/" + moduleName));
            }
            for (let p of mainFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                await Promise.resolve().then(() => require(mainPath + "/" + moduleName));
            }
        }
        catch (err) {
            console.error(err);
        }
        //log("main start")
        const main = new constructor();
        main["main"]();
    }());
}
exports.app = app;
function config(node) {
    return globalConfig[node] || null;
}
exports.config = config;
function component(constructorFunction) {
    objectMapper.set(constructorFunction.name, new constructorFunction());
}
exports.component = component;
function getComponent(constructorFunction) {
    return objectMapper.get(constructorFunction.name);
}
exports.getComponent = getComponent;
function bean(target, propertyKey) {
    let returnType = Reflect.getMetadata("design:returntype", target, propertyKey);
    //const targetObject = new target.constructor();
    beanMapper.set(returnType.name, {
        "target": target, "propertyKey": propertyKey,
        "factory": target[propertyKey]()
    });
}
exports.bean = bean;
function getBean(mappingClass) {
    const bean = beanMapper.get(mappingClass.name);
    return bean["factory"];
}
exports.getBean = getBean;
function value(configPath) {
    return function (target, propertyKey) {
        if (globalConfig === undefined) {
            Object.defineProperty(target, propertyKey, {
                get: () => {
                    return undefined;
                }
            });
        }
        else {
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
exports.value = value;
function autoware(target, propertyKey) {
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
exports.autoware = autoware;
function resource(...args) {
    return (target, propertyKey) => {
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
    };
}
exports.resource = resource;
function log(message, ...optionalParams) {
    const logObject = beanMapper.get(log_factory_class_1.default.name);
    if (logObject) {
        logObject["factory"].log(message, ...optionalParams);
    }
    else {
        console.log(message, ...optionalParams);
    }
}
exports.log = log;
function error(message, ...optionalParams) {
    const logObject = beanMapper.get(log_factory_class_1.default.name);
    if (logObject) {
        logObject["factory"].error(message, ...optionalParams);
    }
    else {
        console.error(message, ...optionalParams);
    }
}
exports.error = error;
function schedule(cronTime) {
    return (target, propertyKey) => {
        new cron.CronJob(cronTime, target[propertyKey]).start();
    };
}
exports.schedule = schedule;
