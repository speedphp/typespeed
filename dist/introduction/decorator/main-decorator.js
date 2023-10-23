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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
let SecondClass = class SecondClass {
};
SecondClass = __decorate([
    atClassWithArgs(1, 2, 3)
], SecondClass);
let FirstClass = class FirstClass {
    get newname() {
        return this.name;
    }
    changeName(name) {
        this.name = name;
        return new SecondClass();
    }
    change(name, age) {
        this.age = age;
        this.name = name;
    }
    getName() {
        return this.name;
    }
};
__decorate([
    atPropertyWithArgs("Li", "Mei"),
    __metadata("design:type", String)
], FirstClass.prototype, "name", void 0);
__decorate([
    atProperty,
    __metadata("design:type", Number)
], FirstClass.prototype, "age", void 0);
__decorate([
    atAccessor,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], FirstClass.prototype, "newname", null);
__decorate([
    atMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", SecondClass)
], FirstClass.prototype, "changeName", null);
__decorate([
    atMethodWithArgs("New", "Type"),
    __param(1, atParameter),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], FirstClass.prototype, "change", null);
FirstClass = __decorate([
    atClass
], FirstClass);
exports.default = FirstClass;
const obj = new FirstClass();
console.log("FirstClass对象调用getName()取得装饰器赋值：", obj.getName());
// 类装饰器
function atClass(target) {
    console.log("类装饰器，类名是：", target.name);
}
// 类装饰器，带参数
function atClassWithArgs(...args) {
    return function (target) {
        console.log("类装饰器有参数，参数值：", args.join(","));
    };
}
// 方法装饰器
function atMethod(target, propertyKey) {
    const returnType = Reflect.getMetadata("design:returntype", target, propertyKey);
    console.log("方法装饰器，获得返回类型：", returnType.name);
}
// 方法装饰器，带参数
function atMethodWithArgs(...args) {
    return function (target, propertyKey) {
        console.log("方法装饰器有参数，参数值：", args.join(","));
    };
}
// 成员变量装饰器
function atProperty(target, propertyKey) {
    const propertyType = Reflect.getMetadata("design:type", target, propertyKey);
    console.log("变量装饰器，获得变量类型：", propertyType.name);
}
// 成员变量装饰器，带参数
function atPropertyWithArgs(...args) {
    return function (target, propertyKey) {
        console.log("变量装饰器有参数，参数值：", args.join(","));
        Object.defineProperty(target, propertyKey, {
            get: () => {
                return args;
            }
        });
    };
}
// 访问器装饰器
function atAccessor(target, propertyKey, descriptor) {
    const returnType = Reflect.getMetadata("design:type", target, propertyKey);
    console.log("访问器装饰器，访问器类型是：", returnType, "，值是：", target[propertyKey]);
}
// 访问器装饰器，带参数
function atAccessorWithArgs(...args) {
    return function (target, propertyKey, descriptor) {
        console.log("访问器装饰器，参数值：", args.join(","));
    };
}
// 参数装饰器
function atParameter(target, propertyKey, parameterIndex) {
    const parameterType = Reflect.getMetadata("design:paramtypes", target, propertyKey);
    console.log("参数装饰器，参数位置在：", parameterIndex, "参数类型是：", parameterType[parameterIndex].name);
}
// 参数装饰器，带参数
function atParameterWithArgs(...args) {
    return function (target, propertyKey, parameterIndex) {
        console.log("参数装饰器有参数，参数值：", args.join(","));
    };
}
