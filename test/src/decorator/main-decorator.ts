import "reflect-metadata";

@atClassWithArgs(1, 2, 3)
class SecondClass {}

@atClass
export default class FirstClass {

    @atPropertyWithArgs("Hello", "World")
    private name: string;

    @atProperty
    private age: number;

    @atMethod
    changeName(name: string): SecondClass {
        this.name = name;
        return new SecondClass();
    }

    @atMethodWithArgs("New", "Type")
    change(name: string, @atParameter age: number): void {
        this.age = age;
        this.name = name;
    }

    getName(): string {
        return this.name;
    }
}

const obj = new FirstClass();
console.log("FirstClass对象调用getName()取得装饰器赋值：", obj.getName());

// 类装饰器，无返回对应无参数
function atClass(target: any) {
    console.log("类装饰器，类名是：", target.name);
}

// 类装饰器，返回回调函数对应有参数
function atClassWithArgs(...args: any[]) {
    return function (target: any) {
        console.log("类装饰器有参数，参数值：", args.join(","));
    }
}

// 方法装饰器，无返回对应无参数
function atMethod(target: any, propertyKey: string) {
    const returnType: any = Reflect.getMetadata("design:returntype", target, propertyKey);
    console.log("方法装饰器，获得返回类型：", returnType.name);
}

// 方法装饰器，返回回调函数对应有参数
function atMethodWithArgs(...args: any[]) {
    return function (target: any, propertyKey: string) {
        console.log("方法装饰器有参数，参数值：", args.join(","));
    }
}

// 成员变量装饰器，无返回对应无参数
function atProperty(target: any, propertyKey: string) {
    const propertyType: any = Reflect.getMetadata("design:type", target, propertyKey);
    console.log("变量装饰器，获得变量类型：", propertyType.name);
}

// 成员变量装饰器，返回回调函数对应有参数
function atPropertyWithArgs(...args: any[]) {
    return function (target: any, propertyKey: string) {
        console.log("变量装饰器有参数，参数值：", args.join(","));
        Object.defineProperty(target, propertyKey, {
            get: () => {
                return args;
            }
        });
    }
}

function atParameter(target: any, propertyKey: string, parameterIndex: number) {
    const parameterType: any = Reflect.getMetadata("design:paramtypes", target, propertyKey);
    console.log("参数装饰器，参数位置在：", parameterIndex, "参数类型是：", parameterType[parameterIndex].name);
}

function atParameterWithArgs(...args: any[]) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        console.log("参数装饰器有参数，参数值：", args.join(","));
    }
}