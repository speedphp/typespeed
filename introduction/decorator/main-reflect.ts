import "reflect-metadata";

class MainReflect {
    @injectAge(10)
    private age: number;

    @findReturn
    getAge(): Number {
        return this.age;
    }
}

const mainReflect = new MainReflect();
console.log("获得Age值：", mainReflect.getAge());

function injectAge(arg: Number) {
    return function (target: any, propertyKey: string) {
        Object.defineProperty(target, propertyKey, {get: () => {return arg;}});
    }
}

function findReturn(target: any, propertyKey: string) {
    const returnType: any = Reflect.getMetadata("design:returntype", target, propertyKey);
    console.log(target[propertyKey].name, "的返回类型是：", returnType.name);
}