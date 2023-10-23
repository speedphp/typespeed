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
require("reflect-metadata");
class MainReflect {
    getAge() {
        return this.age;
    }
}
__decorate([
    injectAge(10),
    __metadata("design:type", Number)
], MainReflect.prototype, "age", void 0);
__decorate([
    findReturn,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Number)
], MainReflect.prototype, "getAge", null);
const mainReflect = new MainReflect();
console.log("获得Age值：", mainReflect.getAge());
function injectAge(arg) {
    return function (target, propertyKey) {
        Object.defineProperty(target, propertyKey, { get: () => { return arg; } });
    };
}
function findReturn(target, propertyKey) {
    const returnType = Reflect.getMetadata("design:returntype", target, propertyKey);
    console.log(target[propertyKey].name, "的返回类型是：", returnType.name);
}
