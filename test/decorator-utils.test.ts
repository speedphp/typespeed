import { expect } from "chai";
import { isStd, getStdArgs } from "../src/decorator-utils";

describe("decorator-utils · isStd 双签名判据", () => {
    it("legacy 类装饰器（1 参）→ false", () => {
        expect(isStd([class Foo {}])).to.equal(false);
    });

    it("legacy 方法/属性装饰器（2 参，第 2 参是 string key）→ false", () => {
        expect(isStd([{}, "methodName"])).to.equal(false);
    });

    it("legacy 带 descriptor 方法 / 参数装饰器（3 参）→ false", () => {
        expect(isStd([{}, "methodName", {}])).to.equal(false);
        expect(isStd([{}, "methodName", 0])).to.equal(false);
    });

    it("标准类/方法/field 装饰器（2 参，第 2 参带 string kind）→ true", () => {
        expect(isStd([function () {}, { kind: "class" }])).to.equal(true);
        expect(isStd([function () {}, { kind: "method" }])).to.equal(true);
        expect(isStd([undefined, { kind: "field" }])).to.equal(true);
        expect(isStd([{}, { kind: "accessor" }])).to.equal(true);
    });

    it("第 2 参是对象但无 kind → false", () => {
        expect(isStd([{}, {}])).to.equal(false);
    });

    it("第 2 参是 null / 非对象 → false", () => {
        expect(isStd([{}, null])).to.equal(false);
        expect(isStd([{}, 42])).to.equal(false);
    });

    it("getStdArgs 解出 (value, context)", () => {
        const ctx = { kind: "method", name: "foo" };
        const [value, context] = getStdArgs([function bar() {}, ctx]);
        expect(typeof value).to.equal("function");
        expect(context).to.equal(ctx);
    });
});

export {};
