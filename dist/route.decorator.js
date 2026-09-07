"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestMapping = exports.postMapping = exports.getMapping = void 0;
exports.next = next;
exports.reqBody = reqBody;
exports.reqQuery = reqQuery;
exports.reqForm = reqForm;
exports.reqParam = reqParam;
exports.req = req;
exports.request = req;
exports.res = res;
exports.response = res;
exports.before = before;
exports.after = after;
exports.setRouter = setRouter;
exports.upload = upload;
exports.jwt = jwt;
const multiparty = require("multiparty");
const express_jwt_1 = require("express-jwt");
const core_decorator_1 = require("./core.decorator");
const decorator_utils_1 = require("./decorator-utils");
const bind_decorator_1 = require("./bind.decorator");
const routerMapper = {
    "get": {},
    "post": {},
    "all": {}
};
const routerParams = {};
const routerParamsTotal = {};
const routerMiddleware = {};
function setRouter(app) {
    ["get", "post", "all"].forEach(method => {
        for (let key in routerMapper[method]) {
            const rounterFunction = routerMapper[method][key];
            if (routerMiddleware[rounterFunction["name"]]) {
                const args = [key, ...routerMiddleware[rounterFunction["name"]], rounterFunction["invoker"]];
                app[method].apply(app, args);
            }
            else {
                app[method](key, rounterFunction["invoker"]);
            }
        }
    });
}
function mapperFunction(method, value) {
    return (...args) => {
        if ((0, decorator_utils_1.isStd)(args)) {
            const [methodFn, ctx] = (0, decorator_utils_1.getStdArgs)(args);
            ctx.addInitializer(function () {
                const className = this.constructor.name;
                const propertyKey = String(ctx.name);
                applyRouteBind(className, propertyKey, methodFn);
                routerMapper[method][value] = {
                    "path": value,
                    "name": [className, propertyKey].toString(),
                    "target": this.constructor,
                    "propertyKey": propertyKey,
                    "invoker": async (req, res, next) => {
                        const routerBean = (0, core_decorator_1.getComponent)(this.constructor);
                        try {
                            let paramTotal = routerBean[propertyKey].length;
                            if (routerParamsTotal[[className, propertyKey].toString()]) {
                                paramTotal = Math.max(paramTotal, routerParamsTotal[[className, propertyKey].toString()]);
                            }
                            const callArgs = [req, res, next];
                            if (paramTotal > 0) {
                                for (let i = 0; i < paramTotal; i++) {
                                    if (routerParams[[className, propertyKey, i].toString()]) {
                                        callArgs[i] = routerParams[[className, propertyKey, i].toString()](req, res, next);
                                    }
                                }
                            }
                            const testResult = await routerBean[propertyKey].apply(routerBean, callArgs);
                            if (typeof testResult === "object") {
                                res.json(testResult);
                            }
                            else if (typeof testResult !== "undefined") {
                                res.send(testResult);
                            }
                            return testResult;
                        }
                        catch (err) {
                            next(err);
                        }
                    }
                };
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1];
        applyRouteBind(target.constructor.name, propertyKey, target[propertyKey]);
        routerMapper[method][value] = {
            "path": value,
            "name": [target.constructor.name, propertyKey].toString(),
            "target": target.constructor,
            "propertyKey": propertyKey,
            "invoker": async (req, res, next) => {
                const routerBean = (0, core_decorator_1.getComponent)(target.constructor);
                try {
                    let paramTotal = routerBean[propertyKey].length;
                    if (routerParamsTotal[[target.constructor.name, propertyKey].toString()]) {
                        paramTotal = Math.max(paramTotal, routerParamsTotal[[target.constructor.name, propertyKey].toString()]);
                    }
                    const args = [req, res, next];
                    if (paramTotal > 0) {
                        for (let i = 0; i < paramTotal; i++) {
                            if (routerParams[[target.constructor.name, propertyKey, i].toString()]) {
                                args[i] = routerParams[[target.constructor.name, propertyKey, i].toString()](req, res, next);
                            }
                        }
                    }
                    const testResult = await routerBean[propertyKey].apply(routerBean, args);
                    if (typeof testResult === "object") {
                        res.json(testResult);
                    }
                    else if (typeof testResult !== "undefined") {
                        res.send(testResult);
                    }
                    return testResult;
                }
                catch (err) {
                    next(err);
                }
            }
        };
    };
}
function upload(...args) {
    if ((0, decorator_utils_1.isStd)(args)) {
        const [, ctx] = (0, decorator_utils_1.getStdArgs)(args);
        ctx.addInitializer(function () {
            const key = [this.constructor.name, String(ctx.name)].toString();
            if (routerMiddleware[key]) {
                routerMiddleware[key].push(uploadMiddleware);
            }
            else {
                routerMiddleware[key] = [uploadMiddleware];
            }
        });
        return;
    }
    const target = args[0];
    const propertyKey = args[1];
    const key = [target.constructor.name, propertyKey].toString();
    if (routerMiddleware[key]) {
        routerMiddleware[key].push(uploadMiddleware);
    }
    else {
        routerMiddleware[key] = [uploadMiddleware];
    }
}
function uploadMiddleware(req, res, next) {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        req.files = files || undefined;
        next();
    });
}
function jwt(jwtConfig) {
    return (...args) => {
        if ((0, decorator_utils_1.isStd)(args)) {
            const [, ctx] = (0, decorator_utils_1.getStdArgs)(args);
            ctx.addInitializer(function () {
                const key = [this.constructor.name, String(ctx.name)].toString();
                if (routerMiddleware[key]) {
                    routerMiddleware[key].push((0, express_jwt_1.expressjwt)(jwtConfig));
                }
                else {
                    routerMiddleware[key] = [(0, express_jwt_1.expressjwt)(jwtConfig)];
                }
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1];
        const key = [target.constructor.name, propertyKey].toString();
        if (routerMiddleware[key]) {
            routerMiddleware[key].push((0, express_jwt_1.expressjwt)(jwtConfig));
        }
        else {
            routerMiddleware[key] = [(0, express_jwt_1.expressjwt)(jwtConfig)];
        }
    };
}
function before(constructorFunction, methodName) {
    const targetBean = (0, core_decorator_1.getComponent)(constructorFunction);
    return function (...args) {
        if ((0, decorator_utils_1.isStd)(args)) {
            const [, ctx] = (0, decorator_utils_1.getStdArgs)(args);
            const hookKey = String(ctx.name);
            ctx.addInitializer(function () {
                const currentMethod = this[methodName];
                if (currentMethod && currentMethod.length > 0) {
                    routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
                }
                Object.assign(this, {
                    [methodName]: function (...innerArgs) {
                        this[hookKey](...innerArgs);
                        return currentMethod.apply(this, innerArgs);
                    }
                });
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1];
        const currentMethod = targetBean[methodName];
        if (currentMethod.length > 0) {
            routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
        }
        Object.assign(targetBean, {
            [methodName]: function (...innerArgs) {
                target[propertyKey](...innerArgs);
                return currentMethod.apply(targetBean, innerArgs);
            }
        });
    };
}
function after(constructorFunction, methodName) {
    const targetBean = (0, core_decorator_1.getComponent)(constructorFunction);
    return function (...args) {
        if ((0, decorator_utils_1.isStd)(args)) {
            const [, ctx] = (0, decorator_utils_1.getStdArgs)(args);
            const hookKey = String(ctx.name);
            ctx.addInitializer(function () {
                const currentMethod = this[methodName];
                if (currentMethod && currentMethod.length > 0) {
                    routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
                }
                Object.assign(this, {
                    [methodName]: function (...innerArgs) {
                        const result = currentMethod.apply(this, innerArgs);
                        const afterResult = this[hookKey](result);
                        return afterResult !== null && afterResult !== void 0 ? afterResult : result;
                    }
                });
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1];
        const currentMethod = targetBean[methodName];
        if (currentMethod.length > 0) {
            routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
        }
        Object.assign(targetBean, {
            [methodName]: function (...innerArgs) {
                const result = currentMethod.apply(targetBean, innerArgs);
                const afterResult = target[propertyKey](result);
                return afterResult !== null && afterResult !== void 0 ? afterResult : result;
            }
        });
    };
}
function req(target, propertyKey, parameterIndex) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => req;
}
function res(target, propertyKey, parameterIndex) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => res;
}
function next(target, propertyKey, parameterIndex) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => next;
}
function reqBody(target, propertyKey, parameterIndex) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => req.body;
}
function reqParam(target, propertyKey, parameterIndex) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    const paramName = getParamInFunction(target[propertyKey], parameterIndex);
    routerParams[key] = (req, res, next) => req.params[paramName];
}
function getParamInFunction(fn, index) {
    const code = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '').replace(/=>.*$/mg, '').replace(/=[^,]+/mg, '');
    const result = code.slice(code.indexOf('(') + 1, code.indexOf(')')).match(/([^\s,]+)/g);
    return result[index] || null;
}
/** 解析函数参数名列表（供 route @bind 做「参数名 → 索引」映射） */
function getParamNames(fn) {
    const code = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '').replace(/=>.*$/mg, '').replace(/=[^,)]+/g, '');
    const paramsStr = code.slice(code.indexOf('(') + 1, code.indexOf(')'));
    if (!paramsStr.trim())
        return [];
    return paramsStr.split(',').map(p => {
        const matched = p.trim().match(/([A-Za-z_$][\w$]*)/);
        return matched ? matched[1] : p.trim();
    }).filter(Boolean);
}
/** 把 route @bind 的「来源字符串」转成参数解析器 */
function getRouteSourceResolver(source, paramName) {
    switch (source) {
        case "req": return (req, res, next) => req;
        case "res": return (req, res, next) => res;
        case "next": return (req, res, next) => next;
        case "reqBody": return (req, res, next) => req.body;
        case "reqParam": return (req, res, next) => req.params[paramName];
        case "reqQuery": return (req, res, next) => req.query[paramName];
        case "reqForm": return (req, res, next) => req.body[paramName];
        default: return null;
    }
}
/** 读取 @bind 声明，把「参数名 → 来源」转成 routerParams 的「索引 → 解析器」 */
function applyRouteBind(className, propertyKey, method) {
    const bindMapping = (0, bind_decorator_1.getBindMapping)(className, propertyKey);
    if (!bindMapping)
        return;
    const paramNames = getParamNames(method);
    const nameToIndex = {};
    paramNames.forEach((paramName, index) => {
        if (paramName && nameToIndex[paramName] === undefined)
            nameToIndex[paramName] = index;
    });
    for (const bindName in bindMapping) {
        const source = bindMapping[bindName];
        if (typeof source !== "string")
            continue; // 跳过 database 的数值映射
        const index = nameToIndex[bindName];
        if (index === undefined)
            continue;
        const resolver = getRouteSourceResolver(source, bindName);
        if (resolver) {
            routerParams[[className, propertyKey, index].toString()] = resolver;
        }
    }
}
function reqQuery(target, propertyKey, parameterIndex) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    const paramName = getParamInFunction(target[propertyKey], parameterIndex);
    routerParams[key] = (req, res, next) => req.query[paramName];
}
function reqForm(paramName) {
    return (target, propertyKey, parameterIndex) => {
        const key = [target.constructor.name, propertyKey, parameterIndex].toString();
        routerParams[key] = (req, res, next) => req.body[paramName];
    };
}
const getMapping = (value) => mapperFunction("get", value);
exports.getMapping = getMapping;
const postMapping = (value) => mapperFunction("post", value);
exports.postMapping = postMapping;
const requestMapping = (value) => mapperFunction("all", value);
exports.requestMapping = requestMapping;
