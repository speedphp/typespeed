import * as express from "express";
import { Redis as IoRedis, RedisKey } from "ioredis";
import { Server as IoServer } from "socket.io";
import "reflect-metadata";

/**设置路由中间件 */
declare function setRouter(app: express.Application): void;
/**上传文件装饰器，装饰页面具备解析上传文件的能力 */
declare function upload(target: any, propertyKey: string): void;
/**
 * 页面支持 JWT 鉴权能力
 * @param jwtConfig jwt 配置
 */
declare function jwt(jwtConfig: any): (target: any, propertyKey: string) => void;
/**
 * GET 请求装饰器
 * @param value 请求路径
 */
declare const getMapping: (value: string) => (target: any, propertyKey: string) => void;
/**
 * POST 请求装饰器
 * @param value 请求路径
 */
declare const postMapping: (value: string) => (target: any, propertyKey: string) => void;
/**
 * 请求装饰器，不区分请求类型
 * @param value 请求路径
 */
declare const requestMapping: (value: string) => (target: any, propertyKey: string) => void;
/**
 * INSERT 装饰器
 * 将方法作为 INSERT SQL 使用
 * @param sql INSERT SQL 语句
 */
declare function insert(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
/**
 * UPDATE 装饰器
 * 将方法作为 UPDATE SQL 使用
 * @param sql UPDATE SQL 语句
 */
declare function update(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
/**
 * DELETE 装饰器
 * 将方法作为 DELETE SQL 使用
 * @param sql DELETE SQL 语句
 */
declare function remove(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
/**
 * SELECT 装饰器
 * 将方法作为 SELECT SQL 使用
 * @param sql SELECT SQL 语句
 */
declare function select(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
/**
 * SELECT 结果类型装饰器，和 @select 配合使用
 * @param dataClass 结果类型
 */
declare function resultType(dataClass: any): (target: any, propertyKey: string) => void;
/**
 * SQL 参数装饰器，标注 SQL 语句的绑定参数值，和 @select @insert @update @remove 配合使用
 * @param name 参数在 SQL 语句内的标记值
 */
declare function param(name: string): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
/**
 * SELECT 缓存装饰器，自动缓存 SELECT 查询结果，和 @select 配合使用
 * 当执行 @insert @update @remove 时，会自动清除缓存。
 * @param ttl 缓存时间，单位秒
 */
declare function cache(ttl: number): (target: any, propertyKey: string) => void;
/**模型数据操作类 */
declare class Model {
    /**分页数据 */
    page: any;
    private table;
    constructor(table?: string);
    /**
     * 查询多条数据
     * @param conditions 查询条件，支持对象和字符串
     * @param sort 排序字段
     * @param fields 定义返回字段
     * @param limit 限制返回数据条数
     */
    findAll<T>(conditions: object | string, sort?: string | object, fields?: string | [string], limit?: number | object): Promise<T[]>;
    /**
     * 插入数据，支持单条或多条数据同时插入
     * @param rows 插入数据，支持对象和数组；对象为单条数据，数组为多条数据。
     */
    create(rows: any): Promise<number>;
    /**
     * 查询单条数据
     * @param conditions 查询条件，支持对象和字符串
     * @param sort 排序字段
     * @param fields 定义返回字段
     */
    find<T>(conditions: any, sort: any, fields?: string): Promise<T>;
    /**
     * 更新数据
     * @param conditions 更新条件，支持对象和字符串，符合条件的数据将被更新
     * @param fieldToValues 更新字段和值
     */
    update(conditions: any, fieldToValues: any): Promise<number>;
    /**
     * 删除数据
     * @param conditions 删除条件，支持对象和字符串，符合条件的数据将被删除
     */
    delete(conditions: any): Promise<number>;
    /**
     * 查询数据条数，返回符合条件的记录条数
     * @param conditions 查询条件，支持对象和字符串
     */
    findCount(conditions: any): Promise<number>;
    /**
     * 增加字段值
     * @param conditions 查询条件，支持对象和字符串，符合条件的数据将被增加
     * @param field 需要增加的字段
     * @param optval 增加数量值，默认为 1
     */
    incr(conditions: any, field: any, optval?: number): Promise<number>;
    /**
     * 减少字段值
     * @param conditions 查询条件，支持对象和字符串，符合条件的数据将被减少
     * @param field 需要减少的字段
     * @param optval 减少数量值，默认为 1
     */
    decr(conditions: any, field: any, optval?: number): Promise<number>;
    /**
     * 计算分页数据
     * @param page 当前页码
     * @param total 记录总条数
     * @param pageSize 每页显示条数
     * @param scope 分页显示页码数量
     */
    pager(page: any, total: any, pageSize?: number, scope?: number): any;
    private where;
    private range;
}
/**
 * 应用程序入口装饰器
 * 
 * 被装饰的类将作为应用程序入口，框架将启动该类的 main 方法
 */
declare function app<T extends {
    new(...args: any[]): {};
}>(constructor: T): void;
/**获取配置文件中的配置项 */
declare function config(node: string): any;
/**组件装饰器，被装饰的类可以通过 @autoware 取得实例 */
declare function component(constructorFunction: any): void;
/**获取组件实例函数，返回结果同 @autoware */
declare function getComponent(constructorFunction: any): any;
/**提供对象装饰器，框架将使用 @bean 装饰的方法来获取对象实例 */
declare function bean(target: any, propertyKey: string): void;
/**获取对象实例函数，返回结果由 @bean 装饰的方法提供 */
declare function getBean(mappingClass: Function): any;
/**配置装饰器，装饰类成员变量值，获取配置文件中的配置项 */
declare function value(configPath: string): any;
/**自动装配装饰器，无参数版本，被装饰的类成员变量将自动注入实例 */
declare function autoware(target: any, propertyKey: string): void;
/**自动装配装饰器，带参数版本，可输入参数作为实例初始化参数，被装饰的类成员变量将自动注入实例 */
declare function resource(...args: any[]): any;
/**日志函数，输出打印日志 */
declare function log(message?: any, ...optionalParams: any[]): void;
/**错误日志函数，输出打印错误日志 */
declare function error(message?: any, ...optionalParams: any[]): void;
/**路由页面前置执行装饰器，参数指向路由页面方法，被装饰的方法将在路由页面之前执行 */
declare function before(constructorFunction: any, methodName: string): (target: any, propertyKey: string) => void;
/**路由页面后置执行装饰器，参数指向路由页面方法，被装饰的方法将在路由页面之后执行 */
declare function after(constructorFunction: any, methodName: string): (target: any, propertyKey: string) => void;
/**定时程序装饰器，参数支持 crontab 格式字符串，可根据参数定时执行被装饰的方法 */
declare function schedule(cronTime: string | Date): (target: any, propertyKey: string) => void;
/**RabbitMQ 监听装饰器，参数是监听的队列名称，当接受到消息时将执行被装饰方法 */
declare function rabbitListener(queue: string): (target: any, propertyKey: string) => void;
/**Redis 监听装饰器，参数是监听的队列名称，当接受到消息时将执行被装饰方法 */
declare function redisSubscriber(target: any, propertyKey: string): void;
/** request 对象装饰器，作为路由页面方法参数，获取 request 对象 */
declare function req(target: any, propertyKey: string, parameterIndex: number): void;
/** response 对象装饰器，作为路由页面方法参数，获取 response 对象 */
declare function res(target: any, propertyKey: string, parameterIndex: number): void;
/** next 函数装饰器，作为路由页面方法参数，获取  next 函数 */
declare function next(target: any, propertyKey: string, parameterIndex: number): void;
/** request.body 对象装饰器，作为路由页面方法参数，获取 request.body 对象 */
declare function reqBody(target: any, propertyKey: string, parameterIndex: number): void;
/** request.param 值装饰器，作为路由页面方法参数，获取 request.params 内容 */
declare function reqParam(target: any, propertyKey: string, parameterIndex: number): void;
/** request.query 值装饰器，作为路由页面方法参数，获取 request.query 内容 */
declare function reqQuery(target: any, propertyKey: string, parameterIndex: number): void;
/** request 表单值装饰器，作为路由页面方法参数，获取 request.body 表单内容 */
declare function reqForm(paramName: string): (target: any, propertyKey: string, parameterIndex: number) => void;

/**框架 Web 服务工厂类 */
declare abstract class ServerFactory {
    /**Web 服务实例 */
    app: any;
    /**中间件列表 */
    protected middlewareList: Array<any>;
    /**
     * 设置一个中间件
     * @param middleware 中间件
     */
    abstract setMiddleware(middleware: any): any;
    /**
     * 启动 Web 服务
     * @param port 端口号
     */
    abstract start(port: number, callback?: Function): any;
}
/**日志工厂类 */
declare abstract class LogFactory {
    /**
     * 日志打印方法
     * @param message 日志内容
     */
    log(message?: any, ...optionalParams: any[]): void;
    /**
     * 错误日志打印方法
     * @param message 日志内容
     */
    error(message?: any, ...optionalParams: any[]): void;
    /**
     * 调试日志打印方法
     * @param message 日志内容
     */
    debug(message?: any, ...optionalParams: any[]): void;
}
/**数据源工厂类 */
declare abstract class DataSourceFactory {
    /**获取读库连接 */
    abstract readConnection(): any;
    /**获取写库连接 */
    abstract writeConnection(): any;
}
/**缓存工厂类 */
declare abstract class CacheFactory {
    /**
     * 获取缓存
     * @param key 缓存键
     */
    abstract get(key: string): any;
    /**
     * 设置缓存
     * @param key 缓存键
     * @param value 缓存值
     * @param expire 过期时间，单位秒
     */
    abstract set(key: string, value: any, expire?: number): void;
    /**
     * 删除缓存
     * @param key 缓存键
     */
    abstract del(key: string): void;
    /**
     * 判断缓存是否存在
     * @param key 缓存键
     * @returns 是否存在
     */
    abstract has(key: string): boolean;
    /**清空缓存 */
    abstract flush(): void;
}
/**认证类 */
declare abstract class AuthenticationFactory {
    /**
     * 路由页面执行前认证
     * @param req 请求对象
     * @param res 响应对象
     * @param next 下一步函数
     */
    preHandle(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * 开始执行中间件前认证
     * @param req 请求对象
     * @param res 响应对象
     * @param next 下一步函数
     */
    afterCompletion(req: express.Request, res: express.Response, next: express.NextFunction): void;
}
/**Redis 操作类 */
declare class Redis extends IoRedis {
    /**获取 Redis 实例 */
    getRedis(): Redis;
    /**
     * 获取有序集合（sorted set），按照分数从大到小排序，返回 Map 对象
     * @param key 键
     * @param start 开始位置，0 表示第一个元素，-1 表示最后一个元素
     * @param stop 结束位置，0 表示第一个元素，-1 表示最后一个元素
     * @returns Map 对象，key 为有序集合的成员，value 为成员的分数
     */
    zrevranking(key: RedisKey, start: number | string, stop: number | string): Promise<Map<string, number>>;
    /**
     * 获取有序集合（sorted set），按照分数从小到大排序，返回 Map 对象
     * @param key 键
     * @param start 开始位置，0 表示第一个元素，-1 表示最后一个元素
     * @param stop 结束位置，0 表示第一个元素，-1 表示最后一个元素
     * @returns Map 对象，key 为有序集合的成员，value 为成员的分数
     */
    zranking(key: RedisKey, start: number | string, stop: number | string): Promise<Map<string, number>>;
}
/**读写数据源实现类 */
declare class ReadWriteDb extends DataSourceFactory {
    private readonly readSession;
    private readonly writeSession;
    /**获取数据源实例 */
    getDataSource(): DataSourceFactory;
    constructor();
    private getConnectionByConfig;
    readConnection(): any;
    writeConnection(): any;
}
/**RabbitMQ 操作类 */
declare class RabbitMQ {
    /**获取 RabbitMQ 实例 */
    getRabbitMQ(): RabbitMQ;
    /**
     * 发送消息到交换机
     * @alias publish
     * @param exchange 交换机名称
     * @param routingKey 交换机路由名称，默认为 ''
     * @param message 发送的消息
     */
    publishMessageToExchange(exchange: string, routingKey: string, message: string): Promise<void>;
    /**
     * 发送消息到队列
     * @alias send
     * @param queue 队列名称
     * @param message 发送的消息
     */
    sendMessageToQueue(queue: string, message: string): Promise<void>;
    /**
     * 发送消息到交换机
     * @param exchange 交换机名称
     * @param routingKey 交换机路由名称，默认为 ''
     * @param message 发送的消息
     */
    publish(exchange: string, routingKey: string, message: string): Promise<void>;
    /**
     * 发送消息到队列
     * @param queue 队列名称
     * @param message 发送的消息
     */
    send(queue: string, message: string): Promise<void>;
}
/**缓存实现类 */
declare class NodeCache extends CacheFactory {
    private NodeCache;
    private nodeCacheOptions;
    private config;
    constructor();
    /**获取缓存对象 */
    getNodeCache(): CacheFactory;
    get(key: string): any;
    set(key: string, value: any, expire?: number): void;
    del(key: string): void;
    has(key: string): boolean;
    flush(): void;
}
/**日志实现类 */
declare class LogDefault extends LogFactory {
    /**获取日志实例 */
    createLog(): LogFactory;
    log(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
}
/**Web 服务实现类，使用 ExpressJS 提供 Web 服务 */
declare class ExpressServer extends ServerFactory {
    view: string;
    private static;
    private favicon;
    private compression;
    private cookieConfig;
    private session;
    private redisConfig;
    private redisClient;
    /**获取 Web 服务实例 */
    getSever(): ServerFactory;
    setMiddleware(middleware: any): void;
    start(port: number): void;
    private setDefaultMiddleware;
}
/**Socket IO 装饰器类 */
declare class SocketIo {
    public static setIoServer(app, ioSocketConfig);
    /**
     * Socket IO 事件装饰器
     * @param event 事件名称
     */
    public static onEvent(event: string): (target: any, propertyKey: string) => void;
    /**Socket IO 错误捕获装饰器 */
    public static onError(target: any, propertyKey: string): void;
    /**Socket IO 客户端断开连接事件装饰器 */
    public static onDisconnect(target: any, propertyKey: string): void;
    /**Socket IO 客户端连接成功事件装饰器 */
    public static onConnected(target: any, propertyKey: string): void;
}
/**Socket IO 服务实现类 */
declare const io: IoServer;

export { ExpressServer, LogDefault, NodeCache, RabbitMQ, rabbitListener, redisSubscriber, ReadWriteDb, Redis, CacheFactory, DataSourceFactory, LogFactory, ServerFactory, AuthenticationFactory, next, reqBody, reqQuery, reqForm, reqParam, req, req as request, res, res as response, component, bean, resource, log, app, before, after, value, error, config, autoware, getBean, getComponent, schedule, getMapping, postMapping, requestMapping, setRouter, upload, jwt, insert, update, remove, select, param, resultType, cache, Model, SocketIo, io };
