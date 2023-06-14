"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwt = exports.upload = exports.setRouter = exports.requestMapping = exports.postMapping = exports.getMapping = exports.after = exports.before = exports.response = exports.res = exports.request = exports.req = exports.reqParam = exports.reqForm = exports.reqQuery = exports.reqBody = exports.next = void 0;
const multiparty = require("multiparty");
const express_jwt_1 = require("express-jwt");
const core_decorator_1 = require("./core.decorator");
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
exports.setRouter = setRouter;
function mapperFunction(method, value) {
    return (target, propertyKey) => {
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
function upload(target, propertyKey) {
    const key = [target.constructor.name, propertyKey].toString();
    if (routerMiddleware[key]) {
        routerMiddleware[key].push(uploadMiddleware);
    }
    else {
        routerMiddleware[key] = [uploadMiddleware];
    }
}
exports.upload = upload;
function uploadMiddleware(req, res, next) {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        req.files = files || undefined;
        next();
    });
}
function jwt(jwtConfig) {
    return (target, propertyKey) => {
        const key = [target.constructor.name, propertyKey].toString();
        if (routerMiddleware[key]) {
            routerMiddleware[key].push((0, express_jwt_1.expressjwt)(jwtConfig));
        }
        else {
            routerMiddleware[key] = [(0, express_jwt_1.expressjwt)(jwtConfig)];
        }
    };
}
exports.jwt = jwt;
function before(constructorFunction, methodName) {
    const targetBean = (0, core_decorator_1.getComponent)(constructorFunction);
    return function (target, propertyKey) {
        const currentMethod = targetBean[methodName];
        if (currentMethod.length > 0) {
            routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
        }
        Object.assign(targetBean, {
            [methodName]: function (...args) {
                target[propertyKey](...args);
                return currentMethod.apply(targetBean, args);
            }
        });
    };
}
exports.before = before;
function after(constructorFunction, methodName) {
    const targetBean = (0, core_decorator_1.getComponent)(constructorFunction);
    return function (target, propertyKey) {
        const currentMethod = targetBean[methodName];
        if (currentMethod.length > 0) {
            routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
        }
        Object.assign(targetBean, {
            [methodName]: function (...args) {
                const result = currentMethod.apply(targetBean, args);
                const afterResult = target[propertyKey](result);
                return afterResult !== null && afterResult !== void 0 ? afterResult : result;
            }
        });
    };
}
exports.after = after;
function req(target, propertyKey, parameterIndex) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => req;
}
exports.req = req;
exports.request = req;
function res(target, propertyKey, parameterIndex) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => res;
}
exports.res = res;
exports.response = res;
function next(target, propertyKey, parameterIndex) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => next;
}
exports.next = next;
function reqBody(target, propertyKey, parameterIndex) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => req.body;
}
exports.reqBody = reqBody;
function reqParam(target, propertyKey, parameterIndex) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    const paramName = getParamInFunction(target[propertyKey], parameterIndex);
    routerParams[key] = (req, res, next) => req.params[paramName];
}
exports.reqParam = reqParam;
function getParamInFunction(fn, index) {
    const code = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '').replace(/=>.*$/mg, '').replace(/=[^,]+/mg, '');
    const result = code.slice(code.indexOf('(') + 1, code.indexOf(')')).match(/([^\s,]+)/g);
    return result[index] || null;
}
function reqQuery(target, propertyKey, parameterIndex) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    const paramName = getParamInFunction(target[propertyKey], parameterIndex);
    routerParams[key] = (req, res, next) => req.query[paramName];
}
exports.reqQuery = reqQuery;
function reqForm(paramName) {
    return (target, propertyKey, parameterIndex) => {
        const key = [target.constructor.name, propertyKey, parameterIndex].toString();
        routerParams[key] = (req, res, next) => req.body[paramName];
    };
}
exports.reqForm = reqForm;
const getMapping = (value) => mapperFunction("get", value);
exports.getMapping = getMapping;
const postMapping = (value) => mapperFunction("post", value);
exports.postMapping = postMapping;
const requestMapping = (value) => mapperFunction("all", value);
exports.requestMapping = requestMapping;
