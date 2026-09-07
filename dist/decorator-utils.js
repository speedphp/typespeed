"use strict";
/**
 * 装饰器双签名感知工具。
 *
 * typespeed 2.5.x 起，装饰器同时支持两套运行时签名：
 *   - legacy（experimentalDecorators: true，2.4.x 现状）：
 *       类装饰器 (ctor)；方法/属性装饰器 (target, key)；带 descriptor 的方法 (target, key, descriptor)；参数 (target, key, index)
 *   - 标准（TC39 装饰器提案，当前 Stage 2.7，experimentalDecorators: false）：
 *       统一 (value, context)，context 恒为带 kind 字段的对象
 *
 * 装饰器函数本质是普通函数，运行时收到什么签名由「调用方（用户代码）」的编译模式决定，
 * 因此库可以单份源码、运行时按签名形态分流：legacy 分支逻辑与 2.4.x 逐字一致，标准分支为新增。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStdArgs = exports.isStd = void 0;
/**
 * 判断装饰器收到的运行时参数是否为标准装饰器签名 (value, context)。
 *
 * 判据（与 `2.5.x-新版装饰器使用方案.md` 一致）：
 *   参数个数 === 2 且第二个参数是「带 string 类型 kind 字段」的对象。
 *
 * 为什么这个判据可靠：
 *   - legacy 类装饰器只有 1 参 → 不满足 length === 2
 *   - legacy 方法/属性装饰器第二参是 string 的 key → 不是对象
 *   - legacy 带 descriptor 的方法 / 参数装饰器是 3 参 → 不满足 length === 2
 *   - 标准模式第二参恒是带 kind 的对象 → 命中
 */
function isStd(args) {
    return args.length === 2
        && typeof args[1] === "object"
        && args[1] !== null
        && typeof args[1].kind === "string";
}
exports.isStd = isStd;
/**
 * 从标准装饰器参数中解出 (value, context)。
 * 仅应在 isStd(args) 为 true 时调用。
 */
function getStdArgs(args) {
    return [args[0], args[1]];
}
exports.getStdArgs = getStdArgs;
