"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.component = component;
exports.bean = bean;
exports.resource = resource;
exports.log = log;
exports.logx = logx;
exports.error = error;
exports.autoware = autoware;
exports.getBean = getBean;
exports.getComponent = getComponent;
exports.schedule = schedule;
require("reflect-metadata");
const cron = require("cron");
const log_factory_class_1 = require("./factory/log-factory.class");
const decorator_utils_1 = require("./decorator-utils");
const resourceObjects = new Map();
const beanMapper = new Map();
const objectMapper = new Map();
function component(...args) {
    if ((0, decorator_utils_1.isStd)(args)) {
        const [ctor, ctx] = (0, decorator_utils_1.getStdArgs)(args);
        ctx.addInitializer(function () {
            objectMapper.set(this.name, new this());
        });
        return;
    }
    const constructorFunction = args[0];
    objectMapper.set(constructorFunction.name, new constructorFunction());
}
function getComponent(constructorFunction) {
    return objectMapper.get(constructorFunction.name);
}
function bean(...args) {
    if (args.length >= 2) {
        // 直接装饰器形式：@bean（无 token，走 legacy design:returntype）
        return beanWithToken(undefined)(...args);
    }
    // 工厂形式：@bean(Token)（显式返回类型 token，标准模式必需）
    return beanWithToken(args[0]);
}
function beanWithToken(token) {
    return function (...args) {
        if ((0, decorator_utils_1.isStd)(args)) {
            const [, ctx] = (0, decorator_utils_1.getStdArgs)(args);
            const key = String(ctx.name);
            ctx.addInitializer(function () {
                beanMapper.set(token ? token.name : key, {
                    "target": this, "propertyKey": key,
                    "factory": this[key]()
                });
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1];
        let returnType = token || Reflect.getMetadata("design:returntype", target, propertyKey);
        beanMapper.set(returnType.name, {
            "target": target, "propertyKey": propertyKey,
            "factory": target[propertyKey]()
        });
    };
}
function getBean(mappingClass) {
    const bean = beanMapper.get(mappingClass.name);
    return bean["factory"];
}
function autoware(...args) {
    if (args.length >= 2) {
        // 直接装饰器形式：@autoware（无 token，走 legacy design:type）
        return autowareWithToken(undefined)(...args);
    }
    // 工厂形式：@autoware(Token)（显式 token，标准模式必需）
    return autowareWithToken(args[0]);
}
function autowareWithToken(token) {
    return function (...args) {
        if ((0, decorator_utils_1.isStd)(args)) {
            // 标准 field 装饰器：标准模式无 design:type，有 token 才能注入。
            return (initialValue) => {
                if (!token)
                    return initialValue;
                const bean = beanMapper.get(token.name);
                if (bean !== undefined)
                    return bean["factory"];
                return new token();
            };
        }
        const target = args[0];
        const propertyKey = args[1];
        const type = token || Reflect.getMetadata("design:type", target, propertyKey);
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
    };
}
/**
 * 解析 @resource(...args) 的首参：若首参是 Function（类/token），作为显式 token，
 * 其余作为构造参数；否则全部作为构造参数（legacy 行为，如 @resource("user")）。
 */
function extractTokenAndArgs(args) {
    if (args.length > 0 && typeof args[0] === "function") {
        return [args[0], args.slice(1)];
    }
    return [undefined, args];
}
function resource(...args) {
    const [token, initArgs] = extractTokenAndArgs(args);
    return (...decoratorArgs) => {
        if ((0, decorator_utils_1.isStd)(decoratorArgs)) {
            // 标准 field 装饰器：标准模式无 design:type，需显式 token。
            return (initialValue) => {
                if (!token)
                    return initialValue;
                const bean = beanMapper.get(token.name);
                if (bean !== undefined)
                    return bean["factory"];
                return new token(...initArgs);
            };
        }
        const target = decoratorArgs[0];
        const propertyKey = decoratorArgs[1];
        const type = token || Reflect.getMetadata("design:type", target, propertyKey);
        Object.defineProperty(target, propertyKey, {
            get: () => {
                const resourceKey = [target.constructor.name, propertyKey, type.name].toString();
                if (!resourceObjects[resourceKey]) {
                    resourceObjects[resourceKey] = new type(...initArgs);
                }
                return resourceObjects[resourceKey];
            }
        });
    };
}
function log(message, ...optionalParams) {
    const logObject = beanMapper.get(log_factory_class_1.default.name);
    if (logObject) {
        logObject["factory"].log(message, ...optionalParams);
    }
    else {
        console.log(message, ...optionalParams);
    }
}
function logx(message) {
    message = JSON.stringify(message);
    const logObject = beanMapper.get(log_factory_class_1.default.name);
    if (logObject) {
        logObject["factory"].log(message);
    }
    else {
        console.log(message);
    }
}
function error(message, ...optionalParams) {
    const logObject = beanMapper.get(log_factory_class_1.default.name);
    if (logObject) {
        logObject["factory"].error(message, ...optionalParams);
    }
    else {
        console.error(message, ...optionalParams);
    }
}
function schedule(cronTime) {
    return (...args) => {
        if ((0, decorator_utils_1.isStd)(args)) {
            const [, ctx] = (0, decorator_utils_1.getStdArgs)(args);
            ctx.addInitializer(function () {
                new cron.CronJob(cronTime, this[String(ctx.name)]).start();
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1];
        new cron.CronJob(cronTime, target[propertyKey]).start();
    };
}
