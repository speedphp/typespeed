"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_decorator_1 = require("../core.decorator");
class AuthenticationFactory {
    preHandle(req, res, next) {
        (0, core_decorator_1.log)('preHandle');
        next();
    }
    afterCompletion(req, res, next) {
        (0, core_decorator_1.log)('afterCompletion');
        next();
    }
}
exports.default = AuthenticationFactory;
