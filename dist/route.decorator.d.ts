import * as express from "express";
declare function setRouter(app: express.Application): void;
declare function upload(target: any, propertyKey: string): void;
declare function jwt(jwtConfig: any): (target: any, propertyKey: string) => void;
declare const getMapping: (value: string) => (target: any, propertyKey: string) => void;
declare const postMapping: (value: string) => (target: any, propertyKey: string) => void;
declare const requestMapping: (value: string) => (target: any, propertyKey: string) => void;
export { getMapping, postMapping, requestMapping, setRouter, upload, jwt };
