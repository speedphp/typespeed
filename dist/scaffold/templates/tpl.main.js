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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const typespeed_1 = require("typespeed");
let Main = class Main {
    main() {
        this.server.start(8081);
        (0, typespeed_1.log)('start application');
    }
};
__decorate([
    typespeed_1.autoware,
    __metadata("design:type", typeof (_a = typeof typespeed_1.ServerFactory !== "undefined" && typespeed_1.ServerFactory) === "function" ? _a : Object)
], Main.prototype, "server", void 0);
Main = __decorate([
    typespeed_1.app
], Main);
//# sourceMappingURL=tpl.main.js.map