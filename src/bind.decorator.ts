import { isStd, getStdArgs } from "./decorator-utils";

/**
 * 方法级参数绑定注册表：key = `[className, methodName]`，value = 绑定声明。
 * 标准装饰器删除了参数装饰器，@bind 是方法级替代（legacy 模式同样可用）。
 * 按 value 类型区分两种语义：
 *   - database 场景：{ SQL占位符名: 参数索引 }（值为 number）
 *   - route 场景：{ 参数名: 请求来源 }（值为 string，如 "reqParam" / "reqBody" / "reqQuery"）
 */
const bindParamMap: Map<string, Record<string, string | number>> = new Map();

/**
 * @bind 方法级参数绑定装饰器。
 *
 * database 散参绑定（对象传参已是主路径，@bind 作散参补充）：
 * ```
 * @insert("Insert into `user` (id, name) values (#{id}, #{name})")
 * @bind({ name: 0, id: 1 })
 * async addRow(newName: string, id: number) { }
 * ```
 *
 * route 参数绑定（替代 req/res/reqBody/reqParam/reqQuery/reqForm 参数装饰器）：
 * ```
 * @getMapping("/user/:id")
 * @bind({ id: "reqParam", body: "reqBody", q: "reqQuery" })
 * async getUser(id: string, body: any, q: string) { }
 * ```
 */
function bind(mapping: Record<string, string | number>) {
    return function (...args: any[]): any {
        if (isStd(args)) {
            const [, ctx] = getStdArgs(args);
            const methodName = String(ctx.name);
            ctx.addInitializer(function (this: any) {
                bindParamMap.set([this.constructor.name, methodName].toString(), mapping);
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1] as string;
        bindParamMap.set([target.constructor.name, propertyKey].toString(), mapping);
    };
}

/** 读取某方法上的 @bind 声明（route/database 内部使用） */
function getBindMapping(className: string, methodName: string): Record<string, string | number> | undefined {
    return bindParamMap.get([className, methodName].toString());
}

export { bind, getBindMapping };
