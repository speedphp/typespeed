import "reflect-metadata";
import * as cron from "cron";
import LogFactory from "./factory/log-factory.class";
import { isStd, getStdArgs } from "./decorator-utils";

const resourceObjects = new Map<string, object>();
const beanMapper: Map<string, any> = new Map<string, any>();
const objectMapper: Map<string, any> = new Map<string, any>();

function component(...args: any[]): any {
    if (isStd(args)) {
        const [ctor, ctx] = getStdArgs(args);
        ctx.addInitializer(function (this: any) {
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

function bean(...args: any[]): any {
    if (args.length >= 2) {
        // 直接装饰器形式：@bean（无 token，走 legacy design:returntype）
        return beanWithToken(undefined)(...args);
    }
    // 工厂形式：@bean(Token)（显式返回类型 token，标准模式必需）
    return beanWithToken(args[0]);
}

function beanWithToken(token?: any) {
    return function (...args: any[]): any {
        if (isStd(args)) {
            const [, ctx] = getStdArgs(args);
            const key = String(ctx.name);
            ctx.addInitializer(function (this: any) {
                beanMapper.set(token ? token.name : key, {
                    "target": this, "propertyKey": key,
                    "factory": this[key]()
                });
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1] as string;
        let returnType = token || Reflect.getMetadata("design:returntype", target, propertyKey);
        beanMapper.set(returnType.name, {
            "target": target, "propertyKey": propertyKey,
            "factory": target[propertyKey]()
        });
    };
}

function getBean(mappingClass: Function): any {
    const bean = beanMapper.get(mappingClass.name);
    return bean["factory"];
}


function autoware(...args: any[]): any {
    if (args.length >= 2) {
        // 直接装饰器形式：@autoware（无 token，走 legacy design:type）
        return autowareWithToken(undefined)(...args);
    }
    // 工厂形式：@autoware(Token)（显式 token，标准模式必需）
    return autowareWithToken(args[0]);
}

function autowareWithToken(token?: any) {
    return function (...args: any[]): any {
        if (isStd(args)) {
            // 标准 field 装饰器：标准模式无 design:type，有 token 才能注入。
            return (initialValue: any) => {
                if (!token) return initialValue;
                const bean = beanMapper.get(token.name);
                if (bean !== undefined) return bean["factory"];
                return new token();
            };
        }
        const target = args[0];
        const propertyKey = args[1] as string;
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
function extractTokenAndArgs(args: any[]): [any, any[]] {
    if (args.length > 0 && typeof args[0] === "function") {
        return [args[0], args.slice(1)];
    }
    return [undefined, args];
}

function resource(...args): any {
    const [token, initArgs] = extractTokenAndArgs(args);
    return (...decoratorArgs: any[]): any => {
        if (isStd(decoratorArgs)) {
            // 标准 field 装饰器：标准模式无 design:type，需显式 token。
            return (initialValue: any) => {
                if (!token) return initialValue;
                const bean = beanMapper.get(token.name);
                if (bean !== undefined) return bean["factory"];
                return new token(...initArgs);
            };
        }
        const target = decoratorArgs[0];
        const propertyKey = decoratorArgs[1] as string;
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

function logx(message) {
    message = JSON.stringify(message);
    const logObject = beanMapper.get(LogFactory.name);
    if (logObject) {
        logObject["factory"].log(message);
    } else {
        console.log(message);
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

function schedule(cronTime: string | Date) {
    return (...args: any[]): any => {
        if (isStd(args)) {
            const [, ctx] = getStdArgs(args);
            ctx.addInitializer(function (this: any) {
                new cron.CronJob(cronTime, this[String(ctx.name)]).start();
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1] as string;
        new cron.CronJob(cronTime, target[propertyKey]).start();
    }
}

export { component, bean, resource, log, logx, error, autoware, getBean, getComponent, schedule };