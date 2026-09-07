import * as express from "express";
import * as multiparty from "multiparty";
import { expressjwt } from "express-jwt";
import { getComponent } from "./core.decorator";
import { isStd, getStdArgs } from "./decorator-utils";
import { getBindMapping } from "./bind.decorator";

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
      const rounterFunction = routerMapper[method][key];
      if (routerMiddleware[rounterFunction["name"]]) {
        const args: Array<any> = [key, ...routerMiddleware[rounterFunction["name"]], rounterFunction["invoker"]];
        app[method].apply(app, args);
      } else {
        app[method](key, rounterFunction["invoker"]);
      }
    }
  });
}

function mapperFunction(method: string, value: string) {
  return (...args: any[]): any => {
    if (isStd(args)) {
      const [methodFn, ctx] = getStdArgs(args);
      ctx.addInitializer(function (this: any) {
        const className = this.constructor.name;
        const propertyKey = String(ctx.name);
        applyRouteBind(className, propertyKey, methodFn);
        routerMapper[method][value] = {
          "path": value,
          "name": [className, propertyKey].toString(),
          "target": this.constructor,
          "propertyKey": propertyKey,
          "invoker": async (req, res, next) => {
            const routerBean = getComponent(this.constructor);
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
              } else if (typeof testResult !== "undefined") {
                res.send(testResult);
              }
              return testResult;
            } catch (err) {
              next(err);
            }
          }
        };
      });
      return;
    }
    const target = args[0];
    const propertyKey = args[1] as string;
    applyRouteBind(target.constructor.name, propertyKey, target[propertyKey]);
    routerMapper[method][value] = {
      "path": value,
      "name": [target.constructor.name, propertyKey].toString(),
      "target": target.constructor,
      "propertyKey": propertyKey,
      "invoker": async (req, res, next) => {
        const routerBean = getComponent(target.constructor);
        try {
          let paramTotal = routerBean[propertyKey].length;
          if(routerParamsTotal[[target.constructor.name, propertyKey].toString()]){
            paramTotal = Math.max(paramTotal, routerParamsTotal[[target.constructor.name, propertyKey].toString()]);
          }
          const args = [req, res, next];
          if(paramTotal > 0) {
            for(let i = 0; i < paramTotal; i++) {
              if(routerParams[[target.constructor.name, propertyKey, i].toString()]){
                args[i] = routerParams[[target.constructor.name, propertyKey, i].toString()](req, res, next);
              }
            }
          }
          const testResult = await routerBean[propertyKey].apply(routerBean, args);
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

function upload(...args: any[]): any {
  if (isStd(args)) {
    const [, ctx] = getStdArgs(args);
    ctx.addInitializer(function (this: any) {
      const key = [this.constructor.name, String(ctx.name)].toString();
      if (routerMiddleware[key]) {
        routerMiddleware[key].push(uploadMiddleware);
      } else {
        routerMiddleware[key] = [uploadMiddleware];
      }
    });
    return;
  }
  const target = args[0];
  const propertyKey = args[1] as string;
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
  return (...args: any[]): any => {
    if (isStd(args)) {
      const [, ctx] = getStdArgs(args);
      ctx.addInitializer(function (this: any) {
        const key = [this.constructor.name, String(ctx.name)].toString();
        if (routerMiddleware[key]) {
          routerMiddleware[key].push(expressjwt(jwtConfig));
        } else {
          routerMiddleware[key] = [expressjwt(jwtConfig)];
        }
      });
      return;
    }
    const target = args[0];
    const propertyKey = args[1] as string;
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
  return function (...args: any[]) {
      if (isStd(args)) {
        const [, ctx] = getStdArgs(args);
        const hookKey = String(ctx.name);
        ctx.addInitializer(function (this: any) {
          const currentMethod = this[methodName];
          if (currentMethod && currentMethod.length > 0) {
            routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
          }
          Object.assign(this, {
              [methodName]: function (...innerArgs: any[]) {
                  this[hookKey](...innerArgs);
                  return currentMethod.apply(this, innerArgs);
              }
          })
        });
        return;
      }
      const target = args[0];
      const propertyKey = args[1] as string;
      const currentMethod = targetBean[methodName];
      if(currentMethod.length > 0){
        routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
      }
      Object.assign(targetBean, {
          [methodName]: function (...innerArgs) {
              target[propertyKey](...innerArgs);
              return currentMethod.apply(targetBean, innerArgs);
          }
      })
  };
}

function after(constructorFunction, methodName: string) {
  const targetBean = getComponent(constructorFunction);
  return function (...args: any[]) {
      if (isStd(args)) {
        const [, ctx] = getStdArgs(args);
        const hookKey = String(ctx.name);
        ctx.addInitializer(function (this: any) {
          const currentMethod = this[methodName];
          if (currentMethod && currentMethod.length > 0) {
            routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
          }
          Object.assign(this, {
              [methodName]: function (...innerArgs: any[]) {
                  const result = currentMethod.apply(this, innerArgs);
                  const afterResult = this[hookKey](result);
                  return afterResult ?? result;
              }
          })
        });
        return;
      }
      const target = args[0];
      const propertyKey = args[1] as string;
      const currentMethod = targetBean[methodName];
      if(currentMethod.length > 0){
        routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
      }
      Object.assign(targetBean, {
          [methodName]: function (...innerArgs) {
              const result = currentMethod.apply(targetBean, innerArgs);
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

function reqBody(target: any, propertyKey: string, parameterIndex: number) {
  const key = [target.constructor.name, propertyKey, parameterIndex].toString();
  routerParams[key] = (req, res, next) => req.body;
}

function reqParam(target: any, propertyKey: string, parameterIndex: number) {
  const key = [target.constructor.name, propertyKey, parameterIndex].toString();
  const paramName = getParamInFunction(target[propertyKey], parameterIndex);
  routerParams[key] = (req, res, next) => req.params[paramName];
}

function getParamInFunction(fn: Function, index: number) {
  const code = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '').replace(/=>.*$/mg, '').replace(/=[^,]+/mg, '');
  const result = code.slice(code.indexOf('(') + 1, code.indexOf(')')).match(/([^\s,]+)/g);
  return result[index] || null;
}

/** 解析函数参数名列表（供 route @bind 做「参数名 → 索引」映射） */
function getParamNames(fn: Function): string[] {
  const code = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '').replace(/=>.*$/mg, '').replace(/=[^,)]+/g, '');
  const paramsStr = code.slice(code.indexOf('(') + 1, code.indexOf(')'));
  if (!paramsStr.trim()) return [];
  return paramsStr.split(',').map(p => {
    const matched = p.trim().match(/([A-Za-z_$][\w$]*)/);
    return matched ? matched[1] : p.trim();
  }).filter(Boolean);
}

/** 把 route @bind 的「来源字符串」转成参数解析器 */
function getRouteSourceResolver(source: string, paramName: string) {
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
function applyRouteBind(className: string, propertyKey: string, method: Function) {
  const bindMapping = getBindMapping(className, propertyKey);
  if (!bindMapping) return;
  const paramNames = getParamNames(method);
  const nameToIndex: Record<string, number> = {};
  paramNames.forEach((paramName, index) => {
    if (paramName && nameToIndex[paramName] === undefined) nameToIndex[paramName] = index;
  });
  for (const bindName in bindMapping) {
    const source = bindMapping[bindName];
    if (typeof source !== "string") continue;   // 跳过 database 的数值映射
    const index = nameToIndex[bindName];
    if (index === undefined) continue;
    const resolver = getRouteSourceResolver(source, bindName);
    if (resolver) {
      routerParams[[className, propertyKey, index].toString()] = resolver;
    }
  }
}

function reqQuery(target: any, propertyKey: string, parameterIndex: number) {
  const key = [target.constructor.name, propertyKey, parameterIndex].toString();
  const paramName = getParamInFunction(target[propertyKey], parameterIndex);
  routerParams[key] = (req, res, next) => req.query[paramName];
}

function reqForm(paramName: string) {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => req.body[paramName];
  }
}

const getMapping = (value: string) => mapperFunction("get", value);
const postMapping = (value: string) => mapperFunction("post", value);
const requestMapping = (value: string) => mapperFunction("all", value);

export { next, reqBody, reqQuery, reqForm, reqParam, req, req as request, res, res as response, before, after, getMapping, postMapping, requestMapping, setRouter, upload, jwt };