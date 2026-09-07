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
const health_factory_class_1 = require("../factory/health-factory.class");
/**
 * 健康检查默认实现：恒为就绪。
 * 应用继承 HealthFactory 并用 @bean 注册自定义实现，即可覆盖默认行为（如接入数据库/Redis 连通性检查）。
 */
class HealthDefault extends health_factory_class_1.default {
    createHealth() {
        return new HealthDefault();
    }
    ready() {
        return true;
    }
}
exports.default = HealthDefault;
__decorate([
    core_decorator_1.bean,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", health_factory_class_1.default)
], HealthDefault.prototype, "createHealth", null);
