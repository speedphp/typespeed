import { onClass, onMethod } from "./speed";

@onClass
export default class LogDefault {
    constructor() {
        console.log('LogDefault constructor');
    }

    @onMethod()
    public log(): string {
        console.log('LogDefault log method');
        return "end";
    }
}