"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisSubscriber = exports.Redis = void 0;
const core_decorator_1 = require("../core.decorator");
const ioredis_1 = require("ioredis");
const typespeed_1 = require("../typespeed");
const redisSubscribers = {};
class Redis extends ioredis_1.default {
    getRedis() {
        return Redis.getInstanceOfRedis("pub");
    }
    async zrevranking(key, start, stop) {
        const list = await this.zrevrange(key, start, stop, "WITHSCORES");
        const map = new Map();
        for (let i = 0; i < list.length; i = i + 2) {
            map.set(list[i], Number(list[i + 1]));
        }
        return map;
    }
    async zranking(key, start, stop) {
        const list = await this.zrange(key, start, stop, "WITHSCORES");
        const map = new Map();
        for (let i = 0; i < list.length; i = i + 2) {
            map.set(list[i], Number(list[i + 1]));
        }
        return map;
    }
    static getInstanceOfRedis(mode) {
        if (!(0, typespeed_1.config)("redis")) {
            return null;
        }
        if (mode === "pub") {
            this.pubObj = this.pubObj || new Redis((0, typespeed_1.config)("redis"));
            return this.pubObj;
        }
        else {
            this.subObj = this.subObj || new Redis((0, typespeed_1.config)("redis"));
            return this.subObj;
        }
    }
    static async close() {
        if (this.subObj != null) {
            await this.subObj.quit();
        }
        if (this.pubObj != null) {
            await this.pubObj.quit();
        }
    }
}
Redis.pubObj = null;
Redis.subObj = null;
__decorate([
    core_decorator_1.bean,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Redis)
], Redis.prototype, "getRedis", null);
exports.Redis = Redis;
function redisSubscriber(channel) {
    if (!(0, typespeed_1.config)("redis"))
        return function () {
            throw new Error("redis not configured");
        };
    Redis.getInstanceOfRedis("sub").subscribe(channel, function (err, count) {
        if (err) {
            console.error(err);
        }
    });
    return function (target, propertyKey) {
        redisSubscribers[channel] = {
            target: target,
            propertyKey: propertyKey
        };
    };
}
exports.redisSubscriber = redisSubscriber;
if ((0, typespeed_1.config)("redis")) {
    Redis.getInstanceOfRedis("sub").on("message", async function (channel, message) {
        await (0, core_decorator_1.getComponent)(redisSubscribers[channel].target.constructor)[redisSubscribers[channel].propertyKey](message);
    });
}
process.once('SIGINT', () => {
    Redis.close();
});
