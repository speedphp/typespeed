import * as express from "express";
import BeanFactory from "./bean-factory.class";
import {log} from "./speed"
const routerMapper = {
  "get" : {},
  "post" : {},
  "all" : {}
}

function setRouter(app: express.Application) {
  ["get", "post", "all"].forEach(method => {
    for (let key in routerMapper[method]) {
      app[method](key, routerMapper[method][key]);
    }
  });
}

function mapperFunction(method: string, value: string) {
  return (target: any, propertyKey: string) => {
    routerMapper[method][value] = (req, res, next) => {
      const routerBean = BeanFactory.getBean(target.constructor);
      const testResult = routerBean[propertyKey](req, res, next);
      if (typeof testResult === "object") {
        res.json(testResult);
      } else if (typeof testResult !== "undefined") {
        res.send(testResult);
      }
      return testResult;
    }
  }
}

const GetMapping = (value: string) => mapperFunction("get", value);
const PostMapping = (value: string) => mapperFunction("post", value);
const RequestMapping = (value: string) => mapperFunction("all", value);

export { GetMapping, PostMapping, RequestMapping, setRouter };