"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthenticationFactory {
    preHandle(req, res, next) {
        next();
    }
    afterCompletion(req, res, next) {
        next();
    }
}
exports.default = AuthenticationFactory;
