import * as express from "express";
import * as multiparty from "multiparty";
import { expressjwt } from "express-jwt";
import { getComponent } from "./core.decorator";
import { param } from "./database.decorator";

const routerMapper = {
  "get": {},
  "post": {},
  "all": {}
};
const routerParams = {};
const routerParamsTotal = {};
const routerMiddleware = {};
function setRouter(app: express.Application) {
  ["get", "post", "all"].forEach(method => {
    for (let key in routerMapper[method]) {
      let rounterFunction = routerMapper[method][key];
      if (routerMiddleware[rounterFunction["name"]]) {
        let args: Array<any> = [key, ...routerMiddleware[rounterFunction["name"]], rounterFunction["invoker"]];
        app[method].apply(app, args);
      } else {
        app[method](key, rounterFunction["invoker"]);
      }
    }
  });
}

function mapperFunction(method: string, value: string) {
  return (target: any, propertyKey: string) => {
    routerMapper[method][value] = {
      "path": value,
      "name": [target.constructor.name, propertyKey].toString(),
      "invoker": async (req, res, next) => {
        const routerBean = getComponent(target.constructor);
        try {
          console.log(routerParamsTotal)
          let paramTotal = routerBean[propertyKey].length;
          if(routerParamsTotal[[target.constructor.name, propertyKey].toString()]){
            paramTotal = Math.max(paramTotal, routerParamsTotal[[target.constructor.name, propertyKey].toString()]);
          }
          console.log("routing method param lenght: ", [target.constructor.name, propertyKey].toString(), paramTotal);
          const testResult = await routerBean[propertyKey](req, res);
          if (typeof testResult === "object") {
            res.json(testResult);
          } else if (typeof testResult !== "undefined") {
            res.send(testResult);
          }
          return testResult;
        } catch (err) {
          next(err)
        }
      }
    }
  }
}

function upload(target: any, propertyKey: string) {
  const key = [target.constructor.name, propertyKey].toString();
  if (routerMiddleware[key]) {
    routerMiddleware[key].push(uploadMiddleware);
  } else {
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
  return (target: any, propertyKey: string) => {
    const key = [target.constructor.name, propertyKey].toString();
    if (routerMiddleware[key]) {
      routerMiddleware[key].push(expressjwt(jwtConfig));
    } else {
      routerMiddleware[key] = [expressjwt(jwtConfig)];
    }
  }
}

function before(constructorFunction, methodName: string) {
  const targetBean = getComponent(constructorFunction);
  return function (target, propertyKey: string) {
      const currentMethod = targetBean[methodName];
      if(currentMethod.length > 0){
        routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
      }
      Object.assign(targetBean, {
          [methodName]: function (...args) {
              target[propertyKey](...args);
              return currentMethod.apply(targetBean, args);
          }
      })
  };
}

function after(constructorFunction, methodName: string) {
  const targetBean = getComponent(constructorFunction);
  return function (target, propertyKey: string) {
      const currentMethod = targetBean[methodName];
      if(currentMethod.length > 0){
        routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
      }
      Object.assign(targetBean, {
          [methodName]: function (...args) {
              const result = currentMethod.apply(targetBean, args);
              const afterResult = target[propertyKey](result);
              return afterResult ?? result;
          }
      })
  };
}

function req(target: any, propertyKey: string, parameterIndex: number) {
  const key = [target.constructor.name, propertyKey, parameterIndex].toString();
  routerParams[key] = (req, res, next) => req;
}

function res(target: any, propertyKey: string, parameterIndex: number) {
  const key = [target.constructor.name, propertyKey, parameterIndex].toString();
  routerParams[key] = (req, res, next) => res;
}

function next(target: any, propertyKey: string, parameterIndex: number) {
  const key = [target.constructor.name, propertyKey, parameterIndex].toString();
  routerParams[key] = (req, res, next) => next;
}

function requestBody(target: any, propertyKey: string, parameterIndex: number) {
  const key = [target.constructor.name, propertyKey, parameterIndex].toString();
  routerParams[key] = (req, res, next) => req.body;
}

function requestParam(paramName: string) {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => req.params[paramName];
  }
}

function requestQuery(paramName: string) {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => req.query[paramName];
  }
}

function formData(paramName: string) {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => req.body[paramName];
  }
}

const getMapping = (value: string) => mapperFunction("get", value);
const postMapping = (value: string) => mapperFunction("post", value);
const requestMapping = (value: string) => mapperFunction("all", value);

export { req, req as request, res, res as response, before, after, getMapping, postMapping, requestMapping, setRouter, upload, jwt };