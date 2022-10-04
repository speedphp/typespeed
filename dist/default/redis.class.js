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
const core_decorator_1 = require("../core.decorator");
const ioredis_1 = require("ioredis");
class Redis extends ioredis_1.default {
    getRedis() {
        if (!(0, core_decorator_1.config)("redis")) {
            return null;
        }
        return new Redis((0, core_decorator_1.config)("redis"));
    }
    constructor(config) {
        super(config);
    }
}
__decorate([
    core_decorator_1.bean,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Redis)
], Redis.prototype, "getRedis", null);
exports.default = Redis;
//# sourceMappingURL=redis.class.js.map