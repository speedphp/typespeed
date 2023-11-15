"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadWriteDb = exports.redisSubscriber = exports.Redis = exports.NodeCache = exports.LogDefault = exports.ExpressServer = exports.AuthenticationFactory = exports.ServerFactory = exports.DataSourceFactory = exports.CacheFactory = exports.LogFactory = exports.config = exports.value = exports.app = void 0;
require("reflect-metadata");
const fs = require("fs");
const path = require("path");
const walkSync = require("walk-sync");
let globalConfig = {};
const corePath = __dirname;
const mainPath = path.dirname(getRootPath(new Error().stack.split("\n")) || process.argv[1]);
const configFile = mainPath + "/config.json";
if (fs.existsSync(configFile)) {
    globalConfig = JSON.parse(fs.readFileSync(configFile, "utf-8"));
    const nodeEnv = process.env.NODE_ENV || "development";
    const envConfigFile = mainPath + "/config-" + nodeEnv + ".json";
    if (fs.existsSync(envConfigFile)) {
        globalConfig = Object.assign(globalConfig, JSON.parse(fs.readFileSync(envConfigFile, "utf-8")));
    }
}
globalConfig["MAIN_PATH"] = mainPath;
globalConfig["CORE_PATH"] = corePath;
function app(constructor) {
    const coreFiles = walkSync(corePath, { globs: ['**/*.ts'], ignore: ['**/*.d.ts', 'scaffold/**'] });
    const mainFiles = walkSync(mainPath, { globs: ['**/*.ts'] });
    (async function () {
        var _a, _b;
        try {
            for (let p of coreFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                await (_a = corePath + "/" + moduleName, Promise.resolve().then(() => require(_a)));
            }
            for (let p of mainFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                await (_b = mainPath + "/" + moduleName, Promise.resolve().then(() => require(_b)));
            }
        }
        catch (err) {
            console.error(err);
        }
        //log("main start")
        const main = new constructor();
        main["main"]();
    }());
}
exports.app = app;
function config(node) {
    return globalConfig[node] || null;
}
exports.config = config;
function value(configPath) {
    return function (target, propertyKey) {
        if (globalConfig === undefined) {
            Object.defineProperty(target, propertyKey, {
                get: () => {
                    return undefined;
                }
            });
        }
        else {
            let pathNodes = configPath.split(".");
            let nodeValue = globalConfig;
            for (let i = 0; i < pathNodes.length; i++) {
                nodeValue = nodeValue[pathNodes[i]];
            }
            Object.defineProperty(target, propertyKey, {
                get: () => {
                    return nodeValue;
                }
            });
        }
    };
}
exports.value = value;
function getRootPath(lines) {
    const macths = ["at Function.Module._load", "at Module.require", "at require", "at Object.<anonymous>"];
    let matchIndex = 0;
    for (let line of lines) {
        if (line.includes(macths[matchIndex])) {
            if (matchIndex === macths.length - 1) {
                let arr = line.split("(")[1].split(":");
                arr.pop();
                arr.pop();
                return arr.join(':');
            }
            matchIndex++;
        }
        else {
            matchIndex = 0;
        }
    }
    return undefined;
}
__exportStar(require("./core.decorator"), exports);
__exportStar(require("./route.decorator"), exports);
__exportStar(require("./database.decorator"), exports);
var log_factory_class_1 = require("./factory/log-factory.class");
Object.defineProperty(exports, "LogFactory", { enumerable: true, get: function () { return log_factory_class_1.default; } });
var cache_factory_class_1 = require("./factory/cache-factory.class");
Object.defineProperty(exports, "CacheFactory", { enumerable: true, get: function () { return cache_factory_class_1.default; } });
var data_source_factory_class_1 = require("./factory/data-source-factory.class");
Object.defineProperty(exports, "DataSourceFactory", { enumerable: true, get: function () { return data_source_factory_class_1.default; } });
var server_factory_class_1 = require("./factory/server-factory.class");
Object.defineProperty(exports, "ServerFactory", { enumerable: true, get: function () { return server_factory_class_1.default; } });
var authentication_factory_class_1 = require("./factory/authentication-factory.class");
Object.defineProperty(exports, "AuthenticationFactory", { enumerable: true, get: function () { return authentication_factory_class_1.default; } });
var express_server_class_1 = require("./default/express-server.class");
Object.defineProperty(exports, "ExpressServer", { enumerable: true, get: function () { return express_server_class_1.default; } });
var log_default_class_1 = require("./default/log-default.class");
Object.defineProperty(exports, "LogDefault", { enumerable: true, get: function () { return log_default_class_1.default; } });
var node_cache_class_1 = require("./default/node-cache.class");
Object.defineProperty(exports, "NodeCache", { enumerable: true, get: function () { return node_cache_class_1.default; } });
var redis_class_1 = require("./default/redis.class");
Object.defineProperty(exports, "Redis", { enumerable: true, get: function () { return redis_class_1.Redis; } });
Object.defineProperty(exports, "redisSubscriber", { enumerable: true, get: function () { return redis_class_1.redisSubscriber; } });
var read_write_db_class_1 = require("./default/read-write-db.class");
Object.defineProperty(exports, "ReadWriteDb", { enumerable: true, get: function () { return read_write_db_class_1.default; } });
__exportStar(require("./default/rabbitmq.class"), exports);
__exportStar(require("./default/socket-io.class"), exports);
