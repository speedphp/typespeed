import "reflect-metadata";
declare function app<T extends {
    new (...args: any[]): {};
}>(constructor: T): void;
declare function config(node: string): any;
declare function component(constructorFunction: any): void;
declare function getComponent(constructorFunction: any): any;
declare function bean(target: any, propertyKey: string): void;
declare function getBean(mappingClass: Function): any;
declare function value(configPath: string): any;
declare function autoware(target: any, propertyKey: string): void;
declare function resource(...args: any[]): any;
declare function log(message?: any, ...optionalParams: any[]): void;
declare function error(message?: any, ...optionalParams: any[]): void;
declare function before(constructorFunction: any, methodName: string): (target: any, propertyKey: string) => void;
declare function after(constructorFunction: any, methodName: string): (target: any, propertyKey: string) => void;
declare function schedule(cronTime: string | Date): (target: any, propertyKey: string) => void;
export { component, bean, resource, log, app, before, after, value, error, config, autoware, getBean, getComponent, schedule };
