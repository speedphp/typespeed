import { log } from "../src/speed";

export default function app(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    log("App decorator running...");

}