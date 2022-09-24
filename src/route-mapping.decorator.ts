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
    routerMapper[method][value] = (...args) => {
      const getBean = BeanFactory.getBean(target.constructor);
      return getBean[propertyKey](...args);
    }
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