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

export { onClass, onMethod };