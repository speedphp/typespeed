import "reflect-metadata";

function onClass<T extends { new(...args: any[]): {} }>(constructor: T) {
    console.log("decorator onClass");
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args);
            //console.log("this.name");
        }
    };
}

function onMethod() {
    return function (
        target,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        let type = Reflect.getMetadata("design:returntype", target, propertyKey);
        console.log("Metadata: " + type);
        descriptor.value = (...args: any[]) => {
            console.log("decorator onMethod");
            return "end";
        };
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

export { onClass, onMethod, autoware, inject };