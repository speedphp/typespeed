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
const cache_factory_class_1 = require("../factory/cache-factory.class");
const cache = require("node-cache");
const core_decorator_1 = require("../core.decorator");
class NodeCache extends cache_factory_class_1.default {
    constructor() {
        super();
        this.nodeCacheOptions = this.config || { stdTTL: 3600 };
        this.NodeCache = new cache();
    }
    getNodeCache() {
        return new NodeCache();
    }
    get(key) {
        return this.NodeCache.get(key);
    }
    set(key, value, expire) {
        this.NodeCache.set(key, value, expire || this.nodeCacheOptions["stdTTL"]);
    }
    del(key) {
        this.NodeCache.del(key);
    }
    has(key) {
        return this.NodeCache.has(key);
    }
    flush() {
        this.NodeCache.flushAll();
    }
}
__decorate([
    (0, core_decorator_1.value)("cache"),
    __metadata("design:type", Object)
], NodeCache.prototype, "config", void 0);
__decorate([
    core_decorator_1.bean,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", cache_factory_class_1.default)
], NodeCache.prototype, "getNodeCache", null);
exports.default = NodeCache;
//# sourceMappingURL=node-cache.class.js.map