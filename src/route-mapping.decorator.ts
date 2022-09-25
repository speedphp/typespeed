import * as express from "express";
import * as multiparty from "multiparty";
import BeanFactory from "./bean-factory.class";
import { log } from "./speed"
const routerMapper = {
  "get": {},
  "post": {},
  "all": {}
}

const uploadMapper = {}

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
      if (uploadMapper[target.constructor.name + "#" + propertyKey]) {
        uploadMapper[target.constructor.name + "#" + propertyKey](req, res, next);
      }
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

function upload(target: any, propertyKey: string) {
  uploadMapper[target.constructor.name + "#" + propertyKey] = (req, res, next) => {
    if (req.method === 'POST') {
      const form = new multiparty.Form();
      const getFiles = (req) => {
        return new Promise((resolve) => {
          form.parse(req, function(err, fields, files) {
            log("uploaded files: " + JSON.stringify(files));
            resolve(files)
          });
        });
    }
    (async() => {
      let files = await getFiles(req);
      log("set to res files: " + JSON.stringify(files));
    })();
    };
  }
}

const GetMapping = (value: string) => mapperFunction("get", value);
const PostMapping = (value: string) => mapperFunction("post", value);
const RequestMapping = (value: string) => mapperFunction("all", value);

export { GetMapping, PostMapping, RequestMapping, setRouter, upload };