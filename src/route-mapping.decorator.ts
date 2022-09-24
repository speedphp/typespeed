import * as express from "express";
import BeanFactory from "./bean-factory.class";
import {log} from "./speed"
const routerMapper = {
  "get" : {},
  "post" : {},
  "all" : {}
}

function setRouter(app: express.Application) {
  for (let key in routerMapper["get"]) {
    app.get(key, routerMapper["get"][key]);
  }
  for (let key in routerMapper["post"]) {
    app.post(key, routerMapper["post"][key]);
  }
  for (let key in routerMapper["all"]) {
    app.all(key, routerMapper["all"][key]);
  }
}

function GetMapping(value: string) {
  return function (target, propertyKey: string) {
    routerMapper["get"][value] = (...args) => {
      log(target.constructor.name + " " + propertyKey);
      let getBean = BeanFactory.getBean(target.constructor);

      log("getBean: " + getBean);

      return getBean[propertyKey](...args);
    }
  };
}

function PostMapping(value: string) {
  return function (target, propertyKey: string) {
    routerMapper["post"][value] = target[propertyKey];
  };
}

function RequestMapping(value: string) {
  return function (target, propertyKey: string) {
    routerMapper["all"][value] = target[propertyKey];
  };
}


export { GetMapping, PostMapping, RequestMapping, setRouter };