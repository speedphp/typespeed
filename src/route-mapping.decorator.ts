import * as express from "express";
import * as multiparty from "multiparty";
import BeanFactory from "./bean-factory.class";
import { log } from "./speed"
const routerMapper = {
  "get": {},
  "post": {},
  "all": {}
};

const uploadMapper = [];

function setRouter(app: express.Application) {
  ["get", "post", "all"].forEach(method => {
    for (let key in routerMapper[method]) {
      let rounterFunction = routerMapper[method][key];
      if (method === "post" && uploadMapper.includes(rounterFunction["name"])) {
        app[method](key, uploadMiddleware, rounterFunction["invoker"]);
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
      "invoker": (req, res) => {
        const routerBean = BeanFactory.getBean(target.constructor);
        const testResult = routerBean[propertyKey](req, res);
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
  uploadMapper.push(target.constructor.name + "#" + propertyKey)
}

function uploadMiddleware(req, res, next) {
  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    req.files = files["upload"] || undefined;
    next();
  });
}

const GetMapping = (value: string) => mapperFunction("get", value);
const PostMapping = (value: string) => mapperFunction("post", value);
const RequestMapping = (value: string) => mapperFunction("all", value);

export { GetMapping, PostMapping, RequestMapping, setRouter, upload };