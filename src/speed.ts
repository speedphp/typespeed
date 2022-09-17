import "reflect-metadata";

function onClass<T extends { new(...args: any[]): {} }>(constructor: T) {
    console.log("decorator onClass: " + constructor.name);
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args);
            //console.log("this.name");
        }
    };
}

function bean(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value!;
    console.log("decorator bean, outside the function: " + method);
    descriptor.value = function () {
        console.log("decorator bean, in the function: " + method);
        return method.apply(this, arguments);
    };
}

function autoware(target: any, propertyKey: string): void {
    console.log("decorator autoware: " + propertyKey);
    target[propertyKey] = "autoware value";
}

function inject(): any {
    console.log("decorator inject, outside the return.");
    return (target: any, propertyKey: string) => {
        console.log("decorator inject, in the return, propertyKey: " + propertyKey);
        let type = Reflect.getMetadata("design:type", target, propertyKey);
        console.log("decorator inject, in the return, type.name: " + type.name);
        return {
            get: function () {
                return "decorator inject, in the return get function";
            }
        };
    }
}

export { onClass, bean, autoware, inject };