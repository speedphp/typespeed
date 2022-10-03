import * as express from "express";
import * as multiparty from "multiparty";
import { expressjwt } from "express-jwt";
import { getComponent } from "./speed";

const routerMapper = {
  "get": {},
  "post": {},
  "all": {}
};

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
      "name": target.constructor.name + "#" + propertyKey,
      "invoker": async (req, res) => {
        const routerBean = getComponent(target.constructor);
        const testResult = await routerBean[propertyKey](req, res);
        if (typeof testResult === "object") {
          res.json(testResult);
        } else if (typeof testResult !== "undefined") {
          res.send(testResult);
        }
        return testResult;
      }
    }
  }
}

function upload(target: any, propertyKey: string) {
  if (routerMiddleware[target.constructor.name + "#" + propertyKey]) {
    routerMiddleware[target.constructor.name + "#" + propertyKey].push(uploadMiddleware);
  } else {
    routerMiddleware[target.constructor.name + "#" + propertyKey] = [uploadMiddleware];
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
    if (routerMiddleware[target.constructor.name + "#" + propertyKey]) {
      routerMiddleware[target.constructor.name + "#" + propertyKey].push(expressjwt(jwtConfig));
    } else {
      routerMiddleware[target.constructor.name + "#" + propertyKey] = [expressjwt(jwtConfig)];
    }
  }
}

const GetMapping = (value: string) => mapperFunction("get", value);
const PostMapping = (value: string) => mapperFunction("post", value);
const RequestMapping = (value: string) => mapperFunction("all", value);

export { GetMapping, PostMapping, RequestMapping, setRouter, upload, jwt };