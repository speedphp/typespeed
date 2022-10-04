"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwt = exports.upload = exports.setRouter = exports.requestMapping = exports.postMapping = exports.getMapping = void 0;
const multiparty = require("multiparty");
const express_jwt_1 = require("express-jwt");
const core_decorator_1 = require("./core.decorator");
const routerMapper = {
    "get": {},
    "post": {},
    "all": {}
};
const routerMiddleware = {};
function setRouter(app) {
    ["get", "post", "all"].forEach(method => {
        for (let key in routerMapper[method]) {
            let rounterFunction = routerMapper[method][key];
            if (routerMiddleware[rounterFunction["name"]]) {
                let args = [key, ...routerMiddleware[rounterFunction["name"]], rounterFunction["invoker"]];
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
            "invoker": async (req, res, next) => {
                const routerBean = (0, core_decorator_1.getComponent)(target.constructor);
                try {
                    const testResult = await routerBean[propertyKey](req, res);
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
const getMapping = (value) => mapperFunction("get", value);
exports.getMapping = getMapping;
const postMapping = (value) => mapperFunction("post", value);
exports.postMapping = postMapping;
const requestMapping = (value) => mapperFunction("all", value);
exports.requestMapping = requestMapping;
//# sourceMappingURL=route.decorator.js.map