import * as express from "express";
import IoRedis from "ioredis";
import "reflect-metadata";


declare function setRouter(app: express.Application): void;
declare function upload(target: any, propertyKey: string): void;
declare function jwt(jwtConfig: any): (target: any, propertyKey: string) => void;
declare const getMapping: (value: string) => (target: any, propertyKey: string) => void;
declare const postMapping: (value: string) => (target: any, propertyKey: string) => void;
declare const requestMapping: (value: string) => (target: any, propertyKey: string) => void;

declare function insert(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function update(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function remove(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function select(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function resultType(dataClass: any): (target: any, propertyKey: string) => void;
declare function param(name: string): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
declare function cache(ttl: number): (target: any, propertyKey: string) => void;
declare class Model {
    page: any;
    private table;
    constructor(table?: string);
    findAll<T>(conditions: object | string, sort?: string | object, fields?: string | [string], limit?: number | object): Promise<T[]>;
    create(rows: any): Promise<number>;
    find<T>(conditions: any, sort: any, fields?: string): Promise<T>;
    update(conditions: any, fieldToValues: any): Promise<number>;
    delete(conditions: any): Promise<number>;
    findCount(conditions: any): Promise<number>;
    incr(conditions: any, field: any, optval?: number): Promise<number>;
    decr(conditions: any, field: any, optval?: number): Promise<number>;
    pager(page: any, total: any, pageSize?: number, scope?: number): any;
    private where;
    private range;
}

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
declare abstract class ServerFactory {
    app: any;
    protected middlewareList: Array<any>;
    abstract setMiddleware(middleware: any): any;
    abstract start(port: number): any;
}
declare abstract class LogFactory {
    abstract log(message?: any, ...optionalParams: any[]): void;
    abstract error(message?: any, ...optionalParams: any[]): void;
}
declare abstract class DataSourceFactory {
    abstract readConnection(): any;
    abstract writeConnection(): any;
}
declare abstract class CacheFactory {
    abstract get(key: string): any;
    abstract set(key: string, value: any, expire?: number): void;
    abstract del(key: string): void;
    abstract has(key: string): boolean;
    abstract flush(): void;
}


declare class Redis extends IoRedis {
    getRedis(): Redis;
    constructor(config: any);
}
declare class ReadWriteDb extends DataSourceFactory {
    private readonly readSession;
    private readonly writeSession;
    getDataSource(): DataSourceFactory;
    constructor();
    private getConnectionByConfig;
    readConnection(): any;
    writeConnection(): any;
}

declare class RabbitMQ {
    getRabbitMQ(): RabbitMQ;
    publishMessageToExchange(exchange: string, routingKey: string, message: string): Promise<void>;
    sendMessageToQueue(queue: string, message: string): Promise<void>;
    publish(exchange: string, routingKey: string, message: string): Promise<void>;
    send(queue: string, message: string): Promise<void>;
}
declare function rabbitListener(queue: string): (target: any, propertyKey: string) => void;

declare class NodeCache extends CacheFactory {
    private NodeCache;
    private nodeCacheOptions;
    private config;
    constructor();
    getNodeCache(): CacheFactory;
    get(key: string): any;
    set(key: string, value: any, expire?: number): void;
    del(key: string): void;
    has(key: string): boolean;
    flush(): void;
}

declare class LogDefault extends LogFactory {
    createLog(): LogFactory;
    log(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
}

declare class ExpressServer extends ServerFactory {
    view: string;
    private static;
    private favicon;
    private compression;
    private cookieConfig;
    private session;
    private redisConfig;
    private redisClient;
    getSever(): ServerFactory;
    setMiddleware(middleware: any): void;
    start(port: number): void;
    private setDefaultMiddleware;
}

export { ExpressServer, LogDefault, NodeCache, RabbitMQ, rabbitListener, ReadWriteDb, Redis, CacheFactory, DataSourceFactory, LogFactory, ServerFactory, component, bean, resource, log, app, before, after, value, error, config, autoware, getBean, getComponent, schedule, getMapping, postMapping, requestMapping, setRouter, upload, jwt, insert, update, remove, select, param, resultType, cache, Model };
