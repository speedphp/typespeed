"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedule = exports.getComponent = exports.getBean = exports.autoware = exports.error = exports.log = exports.resource = exports.bean = exports.component = void 0;
require("reflect-metadata");
const cron = require("cron");
const log_factory_class_1 = require("./factory/log-factory.class");
const resourceObjects = new Map();
const beanMapper = new Map();
const objectMapper = new Map();
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
