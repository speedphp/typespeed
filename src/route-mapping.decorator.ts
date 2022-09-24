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

const GetMapping = (value: string) => mapperFunction("get", value);
const PostMapping = (value: string) => mapperFunction("post", value);
const RequestMapping = (value: string) => mapperFunction("all", value);

export { GetMapping, PostMapping, RequestMapping, setRouter };